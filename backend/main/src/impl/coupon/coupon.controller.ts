import type { Request, Response } from "express";
import CouponModel from "./coupon.model";

export async function getCoupons(request: Request<{ org: number }>, response: Response) {
  const { org } = request.params;
  const coupons = await CouponModel.find({ orgId: org, state: "active" });
  response.json(coupons);
}

export async function createCoupon(
  request: Request<{ org: number }>,
  response: Response,
) {
  const { org } = request.params;
  const couponData = request.body;

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
  request: Request<{ org: number; id: string }>,
  response: Response,
) {
  const { org, id } = request.params;
  const couponData = request.body;

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
