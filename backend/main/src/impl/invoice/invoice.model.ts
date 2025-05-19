import { Schema, model } from "mongoose";
import type { IPrice } from "../inventory-item/inventory-item.model";
import type { IAddress } from "../customer/customer.model";

interface IPaymentInformation {
  paidAt: Date;
  paymentMethod: "cash" | "twint" | "other";
  paymentStatus: "pending" | "completed" | "failed";
  transactionId?: string;
  paymentDetails?: {
    [key: string]: string | number | boolean;
  };
}

interface IInvoicePosition {
  // ---- General ----
  positionId: number;
  amount: number;
  settledPrice: IPrice;

  // ---- Inventory Item ----
  inventoryItemId?: Schema.Types.ObjectId;

  // ---- Custom Item ----
  customItem?: {
    name: string;
    description?: string;
  };
}

interface IInvoice {
  invoiceId: number;
  customerId: Schema.Types.ObjectId;
  description?: string;
  text?: string;
  notes?: string; // Internal
  // TODO: Coupons
  positions: IInvoicePosition[];
  paymentInformation?: IPaymentInformation;
  issuedAt: Date;
  dueAt: Date;
  status: "draft" | "sent" | "viewed" | "paid" | "overdue" | "canceled";
  billingAddress?: IAddress & { email?: string; phone?: string };
  shippingAddress?: IAddress & { email?: string; phone?: string };
  createdBy: number; // References a user in the AuthKit system
  createdAt: Date;
  updatedAt: Date;
  orgId: number; // References an organization in the AuthKit system
  state: "active" | "deleted";
}

const invoiceSchema = new Schema<IInvoice>(
  {
    invoiceId: { type: Number, required: true },
    customerId: { type: Schema.Types.ObjectId, ref: "Customers", required: true },
    description: { type: String, required: false },
    text: { type: String, required: false },
    notes: { type: String, required: false },
    positions: [
      {
        positionId: { type: Number, required: true },
        amount: { type: Number, required: true },
        settledPrice: {
          mwst: { type: String, enum: ["brutto", "netto"], required: true },
          price: { type: Number, required: true },
          mwstPercent: { type: Number, required: false },
          unit: {
            type: String,
            enum: ["Stück", "t", "kg", "g", "l", "cl", "ml", "m", "cm", "mm"],
            required: false,
          },
        },
        inventoryItemId: {
          type: Schema.Types.ObjectId,
          ref: "InventoryItems",
          required: false,
        },
        customItem: {
          name: { type: String, required: false },
          description: { type: String, required: false },
        },
      },
    ],
    paymentInformation: {
      paidAt: { type: Date, required: true },
      paymentMethod: {
        type: String,
        enum: ["cash", "twint", "other"],
        required: true,
      },
      paymentStatus: {
        type: String,
        enum: ["pending", "completed", "failed"],
        required: true,
      },
      transactionId: { type: String, required: false },
      paymentDetails: {
        type: Map,
        of: Schema.Types.Mixed,
        required: false,
      },
    },
    issuedAt: { type: Date, required: true },
    dueAt: { type: Date, required: true },
    status: {
      type: String,
      enum: ["draft", "sent", "viewed", "paid", "overdue", "canceled"],
      required: true,
    },
    billingAddress: {
      street: { type: String, required: false },
      city: { type: String, required: false },
      canton: { type: String, required: false },
      postalCode: { type: String, required: false },
      country: { type: String, required: false },
      email: { type: String, required: false },
      phone: { type: String, required: false },
    },
    shippingAddress: {
      street: { type: String, required: false },
      city: { type: String, required: false },
      canton: { type: String, required: false },
      postalCode: { type: String, required: false },
      country: { type: String, required: false },
      email: { type: String, required: false },
      phone: { type: String, required: false },
    },
    createdBy: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now, required: true },
    updatedAt: { type: Date, default: Date.now, required: true },
    orgId: { type: Number, required: true },
    state: {
      type: String,
      enum: ["active", "deleted"],
      default: "active",
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id;
        ret._id = undefined;
        ret.__v = undefined;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id;
        ret._id = undefined;
        ret.__v = undefined;
        return ret;
      },
    },
  },
);

const InvoiceModel = model<IInvoice>("Invoices", invoiceSchema);
export default InvoiceModel;
