import { Schema, model } from "mongoose";

export interface IAddress {
  street: string;
  city: string;
  canton: string;
  postalCode: string;
  country: string;
}

interface ICustomer {
  title?: "Herr" | "Frau";
  name: string;
  surName: string;
  email: string;
  phone?: string;
  address?: IAddress;
  dateOfBirth?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  orgId: number; // References an organization in the AuthKit system
  state: "active" | "suspended" | "deleted";
}

const customerSchema = new Schema<ICustomer>(
  {
    title: { type: String, enum: ["Herr", "Frau"], required: false },
    name: { type: String, required: true },
    surName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: false },
    address: {
      street: { type: String, required: false },
      city: { type: String, required: false },
      canton: { type: String, required: false },
      postalCode: { type: String, minlength: 4, required: false },
      country: { type: String, required: false },
    },
    dateOfBirth: { type: Date, required: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    orgId: { type: Number, required: true },
    state: {
      type: String,
      enum: ["active", "suspended", "deleted"],
      default: "active",
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

const CustomerModel = model<ICustomer>("Customers", customerSchema);
export default CustomerModel;
