import { type Model, Schema, model } from "mongoose";
import type { IPrice } from "../inventory-item/inventory-item.model";

interface ICouponValue {
  type: "percentage" | "fixed";
  value: number;
  maxDiscount?: number; // for percentage
}

interface ICoupon {
  code: string;
  name: string;
  description?: string;
  value: ICouponValue;

  status: "active" | "used" | "inactive";
  startDate?: Date;
  expiryDate?: Date;

  minimumSpend?: number;
  applicableItems?: Schema.Types.ObjectId[]; // References inventory items

  stackable?: boolean;

  // ---- Discount ----
  maxUses?: number;
  maxUsesPerCustomer?: number;
  used?: [
    {
      date: Date;
      invoiceId: Schema.Types.ObjectId;
    },
  ];

  // ---- "Gift Card" ----
  price?: IPrice;
  bookings?: [
    {
      amount: number;
      usedAt: Date;
      invoiceId?: Schema.Types.ObjectId; // References an invoice
    },
  ];
  purchasedInvoiceId?: Schema.Types.ObjectId; // References an invoice

  createdBy?: number; // References a user in the AuthKit system
  createdAt?: Date;
  updatedAt?: Date;
  orgId: number; // References an organization in the AuthKit system
  state: "active" | "deleted";
}

interface ICouponVirtuals {
  usedCount?: number;
  remainingValue?: number;
}

// biome-ignore lint/complexity/noBannedTypes: https://mongoosejs.com/docs/typescript/virtuals.html#set-virtuals-type-manually
type CouponModel = Model<ICoupon, {}, ICouponVirtuals>;

const couponSchema = new Schema<ICoupon, CouponModel, ICouponVirtuals>(
  {
    code: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: { type: String },
    value: {
      type: {
        type: String,
        enum: ["percentage", "fixed"],
        required: true,
      },
      value: { type: Number, required: true },
      maxDiscount: { type: Number },
    },

    status: {
      type: String,
      enum: ["active", "used", "inactive"],
      default: "active",
      required: true,
    },
    startDate: { type: Date },
    expiryDate: { type: Date },

    minimumSpend: { type: Number },
    applicableItems: [{ type: Schema.Types.ObjectId, ref: "InventoryItems" }],

    stackable: { type: Boolean, default: false },

    // ---- Discount ----
    maxUses: { type: Number },
    maxUsesPerCustomer: { type: Number },
    used: [
      {
        date: { type: Date, required: true },
        invoiceId: {
          type: Schema.Types.ObjectId,
          ref: "Invoices",
          required: true,
        },
      },
    ],
    // ---- "Gift Card" ----
    price: {
      type: {
        mwst: { type: String, enum: ["brutto", "netto"], required: true },
        price: { type: Number, required: true },
        mwstPercent: { type: Number, required: false },
        unit: {
          type: String,
          enum: ["Stück", "t", "kg", "g", "l", "cl", "ml", "m", "cm", "mm"],
          required: false,
        },
      },
      required: false, // Make the entire price object optional
    },
    bookings: [
      {
        amount: { type: Number, required: true },
        usedAt: { type: Date, required: true },
        invoiceId: {
          type: Schema.Types.ObjectId,
          ref: "Invoices",
        },
      },
    ],
    purchasedInvoiceId: {
      type: Schema.Types.ObjectId,
      ref: "Invoices",
    },

    orgId: { type: Number, required: true },
    state: {
      type: String,
      enum: ["active", "deleted"],
      default: "active",
    },
    createdBy: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
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

// Virtuals
couponSchema.virtual("usedCount").get(function () {
  return this.used?.length ?? 0;
});

couponSchema.virtual("remainingValue").get(function () {
  if (this.value.type === "fixed") {
    return (
      this.value.value -
      (this.bookings?.reduce((acc, booking) => acc + booking.amount, 0) ?? 0)
    );
  }
  return undefined;
});

const CouponModel = model<ICoupon, CouponModel>("Coupons", couponSchema);
export default CouponModel;
