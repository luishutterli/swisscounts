import { Schema, model } from "mongoose";

type WeightUnit = "t" | "kg" | "g";
type VolumeUnit = "l" | "cl" | "ml";
type LengthUnit = "m" | "cm" | "mm";

export interface IPrice {
  mwst: "brutto" | "netto";
  price: number;
  mwstPercent?: number;
  unit?: "Stück" | WeightUnit | VolumeUnit | LengthUnit; // Null: no unit
}

interface IInventoryItem {
  name: string;
  shortName?: string;
  description?: string;
  type: "product" | "service";
  price: IPrice;
  allowAmountDecimal?: boolean; // Null: false, only integers
  imageURLs?: string[];
  primaryImage?: number;
  tags?: string[];
  inStockStatus?: boolean; // Null: true
  properties?: {
    [key: string]: string | number | boolean;
  };
  createdBy: number; // References a user in the AuthKit system
  createdAt?: Date;
  updatedAt?: Date;
  orgId: number; // References an organization in the AuthKit system
  state: "active" | "deleted";
}

const inventoryItemSchema = new Schema<IInventoryItem>({
  name: { type: String, required: true },
  shortName: { type: String, required: false },
  description: { type: String, required: false },
  type: { type: String, enum: ["product", "service"], required: true },
  price: {
    mwst: { type: String, enum: ["brutto", "netto"], required: true },
    price: { type: Number, required: true },
    mwstPercent: { type: Number, required: false },
    unit: {
      type: String,
      enum: ["Stück", "t", "kg", "g", "l", "cl", "ml", "m", "cm", "mm"],
      required: false,
    },
  },
  allowAmountDecimal: { type: Boolean, required: false },
  imageURLs: { type: [String], required: false },
  primaryImage: { type: Number, required: false },
  tags: { type: [String], required: false },
  inStockStatus: { type: Boolean, required: false },
  properties: {
    type: Map,
    of: Schema.Types.Mixed,
    required: false,
  },
  createdBy: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  orgId: { type: Number, required: true },
  state: {
    type: String,
    enum: ["active", "deleted"],
    default: "active",
  },
});

const InventoryItemModel = model<IInventoryItem>("InventoryItems", inventoryItemSchema);
export default InventoryItemModel;
