import type { Request, Response } from "express";
import CouponModel from "./coupon.model";
import { getPaginationParams, paginateArray } from "../../util/pagination";

// Utility function to validate and sanitize coupon code
const validateAndSanitizeCouponCode = (code: string): { isValid: boolean; sanitizedCode: string; error?: string } => {
  if (!code || typeof code !== "string") {
    return { isValid: false, sanitizedCode: "", error: "Coupon code is required" };
  }
  
  // Sanitize: convert to lowercase and remove invalid characters
  const sanitizedCode = code.toLowerCase().replace(/[^a-z0-9-]/g, "").replace(/\s+/g, "");
  
  // Validate: check if it contains only allowed characters
  const validPattern = /^[a-z0-9-]+$/;
  if (!validPattern.test(sanitizedCode)) {
    return { isValid: false, sanitizedCode, error: "Coupon code can only contain lowercase letters, numbers, and dashes" };
  }
  
  if (sanitizedCode.length === 0) {
    return { isValid: false, sanitizedCode, error: "Coupon code cannot be empty" };
  }
  
  return { isValid: true, sanitizedCode };
};

// Utility function to validate gift card data
const validateGiftCardData = (couponData: {
  price?: { price: number };
  value?: { value: number };
}): { isValid: boolean; error?: string } => {
  // Check if this is a gift card (has price field)
  if (!couponData.price) {
    return { isValid: true }; // Not a gift card, skip validation
  }
  
  const price = couponData.price?.price;
  const value = couponData.value?.value;
  
  if (price && value && price > value) {
    return { 
      isValid: false, 
      error: "Gift card price cannot be greater than its value" 
    };
  }
  
  if (price && price <= 0) {
    return { 
      isValid: false, 
      error: "Gift card price must be greater than 0" 
    };
  }
  
  if (value && value <= 0) {
    return { 
      isValid: false, 
      error: "Gift card value must be greater than 0" 
    };
  }
  
  return { isValid: true };
};

// Utility function to validate coupon data
const validateCouponData = (couponData: {
  value?: { type: string; value: number; maxDiscount?: number };
  minimumSpend?: number;
  maxUses?: number;
  maxUsesPerCustomer?: number;
}): { isValid: boolean; error?: string } => {
  const value = couponData.value;
  
  if (!value) {
    return { isValid: false, error: "Coupon value is required" };
  }
  
  if (value.value <= 0) {
    return { isValid: false, error: "Coupon value must be greater than 0" };
  }
  
  if (value.type === "percentage") {
    if (value.value > 100) {
      return { isValid: false, error: "Percentage value cannot be greater than 100" };
    }
    if (value.value < 0) {
      return { isValid: false, error: "Percentage value cannot be negative" };
    }
    if (value.maxDiscount && value.maxDiscount <= 0) {
      return { isValid: false, error: "Maximum discount amount must be greater than 0" };
    }
  }
  
  if (value.type === "fixed" && value.value < 0) {
    return { isValid: false, error: "Fixed discount amount cannot be negative" };
  }
  
  if (couponData.minimumSpend && couponData.minimumSpend < 0) {
    return { isValid: false, error: "Minimum spend cannot be negative" };
  }
  
  if (couponData.maxUses && couponData.maxUses <= 0) {
    return { isValid: false, error: "Maximum uses must be greater than 0" };
  }
  
  if (couponData.maxUsesPerCustomer && couponData.maxUsesPerCustomer <= 0) {
    return { isValid: false, error: "Maximum uses per customer must be greater than 0" };
  }
  
  return { isValid: true };
};

export async function getCoupons(request: Request<{ org: string }>, response: Response) {
  const org = Number.parseInt(request.params.org);
  if (Number.isNaN(org) || org < 0) {
    return response.status(400).json({ error: "Invalid org ID" });
  }

  const paginationOptions = getPaginationParams(request);

  const coupons = await CouponModel.find({ orgId: org, state: "active" });
  const paginatedResult = paginateArray(coupons, paginationOptions);

  response.json(paginatedResult);
}

export async function createCoupon(
  request: Request<{ org: string }>,
  response: Response,
) {
  const org = Number.parseInt(request.params.org);
  if (Number.isNaN(org) || org < 0) {
    return response.status(400).json({ error: "Invalid org ID" });
  }
  const couponData = request.body;

  // Validate and sanitize coupon code
  const codeValidation = validateAndSanitizeCouponCode(couponData.code);
  if (!codeValidation.isValid) {
    return response.status(400).json({ error: codeValidation.error });
  }  couponData.code = codeValidation.sanitizedCode;

  // Validate gift card data
  const giftCardValidation = validateGiftCardData(couponData);
  if (!giftCardValidation.isValid) {
    return response.status(400).json({ error: giftCardValidation.error });
  }

  // Validate general coupon data
  const couponValidation = validateCouponData(couponData);
  if (!couponValidation.isValid) {
    return response.status(400).json({ error: couponValidation.error });
  }

  couponData.createdBy = 1; // TODO: Use userId from authentication middleware

  const existingCoupon = await CouponModel.findOne({
    code: couponData.code,
    orgId: org,
    state: "active",
  });

  if (existingCoupon) {
    return response.status(400).json({ error: "Coupon code already exists" });
  }

  const coupon = new CouponModel({
    ...couponData,
    orgId: org,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const savedCoupon = await coupon.save();
  if (!savedCoupon) {
    return response.status(400).json({ error: "Failed to create coupon" });
  }
  response.status(201).json(savedCoupon);
}

export async function updateCoupon(
  request: Request<{ org: string; id: string }>,
  response: Response,
) {
  const org = Number.parseInt(request.params.org);
  if (Number.isNaN(org) || org < 0) {
    return response.status(400).json({ error: "Invalid org ID" });
  }
  const id = request.params.id;
  const couponData = request.body;

  // If code is being updated, validate and sanitize it
  if (couponData.code) {
    const codeValidation = validateAndSanitizeCouponCode(couponData.code);
    if (!codeValidation.isValid) {
      return response.status(400).json({ error: codeValidation.error });
    }
    couponData.code = codeValidation.sanitizedCode;
  }
  // Validate gift card data
  const giftCardValidation = validateGiftCardData(couponData);
  if (!giftCardValidation.isValid) {
    return response.status(400).json({ error: giftCardValidation.error });
  }

  // Validate general coupon data
  const couponValidation = validateCouponData(couponData);
  if (!couponValidation.isValid) {
    return response.status(400).json({ error: couponValidation.error });
  }

  const coupon = await CouponModel.findOne({ _id: id, orgId: org });
  if (!coupon) {
    return response.status(404).json({ error: "Coupon not found" });
  }

  if (couponData.code && couponData.code !== coupon.code) {
    const existingCoupon = await CouponModel.findOne({
      code: couponData.code,
      orgId: org,
      state: "active",
      _id: { $ne: id },
    });

    if (existingCoupon) {
      return response.status(400).json({ error: "Coupon code already exists" });
    }
  }
  const allowedFields = [
    "code",
    "name",
    "description",
    "value",
    "status",
    "startDate",
    "expiryDate",
    "minimumSpend",
    "applicableItems",
    "stackable",
    "maxUses",
    "maxUsesPerCustomer",
    "used",
    "price",
    "bookings",
    "purchasedInvoiceId",
    "state",
  ];

  for (const key of Object.keys(couponData)) {
    if (couponData[key] === undefined || !allowedFields.includes(key)) continue;
    coupon.set(key, couponData[key]);
  }
  coupon.updatedAt = new Date();

  const updatedCoupon = await coupon.save();
  if (!updatedCoupon) {
    return response.status(400).json({ error: "Failed to update coupon" });
  }
  response.json(updatedCoupon);
}
