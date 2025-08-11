import type { Request, Response } from "express";
import InvoiceModel from "./invoice.model";
import CouponModel from "../coupon/coupon.model";
import { getPaginationParams, paginateArray } from "../../util/pagination";
import * as httpContext from "express-http-context";

export async function getInvoices(request: Request<{ org: string }>, response: Response) {
  const org = Number.parseInt(request.params.org);
  if (Number.isNaN(org) || org < 0) {
    return response.status(400).json({ error: "Invalid org ID" });
  }

  const paginationOptions = getPaginationParams(request);

  const invoices = await InvoiceModel.find({ orgId: org, state: "active" })
    .populate("customerId")
    .populate("positions.inventoryItemId")
    .populate("appliedCoupons.couponId");

  const paginatedResult = paginateArray(invoices, paginationOptions);

  response.json(paginatedResult);
}

export async function getInvoiceById(
  request: Request<{ org: string; id: string }>,
  response: Response,
) {
  const org = Number.parseInt(request.params.org);
  if (Number.isNaN(org) || org < 0) {
    return response.status(400).json({ error: "Invalid org ID" });
  }
  const id = request.params.id;
  const invoice = await InvoiceModel.findOne({ _id: id, orgId: org, state: "active" })
    .populate("customerId")
    .populate("positions.inventoryItemId")
    .populate("appliedCoupons.couponId");

  if (!invoice) {
    return response.status(404).json({ error: "Invoice not found" });
  }
  response.json(invoice);
}

export async function createInvoice(
  request: Request<{ org: string }>,
  response: Response,
) {
  const org = Number.parseInt(request.params.org);
  if (Number.isNaN(org) || org < 0) {
    return response.status(400).json({ error: "Invalid org ID" });
  }
  const invoiceData = request.body;

  const userId = httpContext.get("userId");
  if (!userId) {
    console.error("[ERROR] userId could not be inferred from context.");
    return response.status(401).json({ error: "Unauthorized" });
  }
  invoiceData.createdBy = userId;

  const lastInvoice = await InvoiceModel.findOne({ orgId: org })
    .sort({ invoiceId: -1 })
    .select("invoiceId");
  const newInvoiceId = (lastInvoice?.invoiceId ?? 0) + 1;

  if (invoiceData.positions && Array.isArray(invoiceData.positions)) {
    console.log("Processing positions for new invoice creation");
    invoiceData.positions = invoiceData.positions.map((position: unknown) => {
      const processedPosition = { ...(position as Record<string, unknown>) };
      
      if (processedPosition.inventoryItemId && typeof processedPosition.inventoryItemId === 'object') {
        const inventoryItem = processedPosition.inventoryItemId as Record<string, unknown>;
        console.log("Converting populated inventoryItemId to ObjectId in new invoice:", inventoryItem._id || inventoryItem.id);
        processedPosition.inventoryItemId = inventoryItem._id || inventoryItem.id;
      }
      
      return processedPosition;
    });
  }

  const invoice = new InvoiceModel({
    ...invoiceData,
    orgId: org,
    invoiceId: newInvoiceId,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const savedInvoice = await invoice.save();
  if (!savedInvoice) {
    return response.status(400).json({ error: "Failed to create invoice" });
  }

  if (invoiceData.appliedCoupons && invoiceData.appliedCoupons.length > 0) {
    try {
      for (const appliedCoupon of invoiceData.appliedCoupons) {
        await CouponModel.findByIdAndUpdate(appliedCoupon.couponId, {
          $push: {
            used: {
              date: appliedCoupon.appliedAt,
              invoiceId: savedInvoice._id,
            },
          },
        });
      }
    } catch (error) {
      console.error("Error tracking coupon usage:", error);
    }
  }

  response.status(201).json(savedInvoice);
}

export async function updateInvoice(
  request: Request<{ org: string; id: string }>,
  response: Response,
) {
  const org = Number.parseInt(request.params.org);
  if (Number.isNaN(org) || org < 0) {
    return response.status(400).json({ error: "Invalid org ID" });
  }
  const id = request.params.id;
  const invoiceData = request.body;

  const invoice = await InvoiceModel.findOne({ _id: id, orgId: org });
  if (!invoice) {
    return response.status(404).json({ error: "Invoice not found" });
  }

  const allowedFields = [
    "description",
    "text",
    "notes",
    "positions",
    "paymentInformation",
    "issuedAt",
    "dueAt",
    "status",
    "billingAddress",
    "shippingAddress",
    "state",
  ];

  for (const key of Object.keys(invoiceData)) {
    if (invoiceData[key] === undefined || !allowedFields.includes(key)) continue;
    
    // Special handling for status change to "paid" - automatically set payment information
    if (key === "status" && invoiceData[key] === "paid") {
      console.log("Invoice status changed to paid, setting paymentInformation.paidAt");
      
      // If paymentInformation doesn't exist or paidAt is not set, set it now
      const currentPaymentInfo = invoice.paymentInformation || {};
      if (!currentPaymentInfo.paidAt) {
        invoice.set("paymentInformation", {
          ...currentPaymentInfo,
          paidAt: new Date(),
          paymentStatus: "completed"
        });
      }
    }
    
    // Special handling for positions to ensure inventoryItemId is just the ObjectId
    if (key === "positions" && Array.isArray(invoiceData[key])) {
      console.log("Processing positions for invoice update");
      const processedPositions = invoiceData[key].map((position: unknown) => {
        const processedPosition = { ...(position as Record<string, unknown>) };
        
        // If inventoryItemId is an object (populated), extract just the _id
        if (processedPosition.inventoryItemId && typeof processedPosition.inventoryItemId === 'object') {
          const inventoryItem = processedPosition.inventoryItemId as Record<string, unknown>;
          console.log("Converting populated inventoryItemId to ObjectId:", inventoryItem._id || inventoryItem.id);
          processedPosition.inventoryItemId = inventoryItem._id || inventoryItem.id;
        }
        
        return processedPosition;
      });
      invoice.set(key, processedPositions);
    } else {
      invoice.set(key, invoiceData[key]);
    }
  }
  invoice.updatedAt = new Date();

  const updatedInvoice = await invoice.save();
  if (!updatedInvoice) {
    return response.status(400).json({ error: "Failed to update invoice" });
  }
  response.json(updatedInvoice);
}
