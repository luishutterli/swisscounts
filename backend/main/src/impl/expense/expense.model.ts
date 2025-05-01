import { Schema, model } from "mongoose";

interface IExpense {
  description: string;
  amount: number;
  category?: string;
  date: Date;
  receiptImageURL?: string;
  notes?: string;
  createdBy: number; // References a user in the AuthKit system
  createdAt?: Date;
  updatedAt?: Date;
  orgId: number; // References an organization in the AuthKit system
  state: "active" | "deleted";
}

const expenseSchema = new Schema<IExpense>({
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  category: { type: String, required: false },
  date: { type: Date, required: true },
  receiptImageURL: { type: String, required: false },
  notes: { type: String, required: false },
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

const ExpenseModel = model<IExpense>("Expenses", expenseSchema);
export default ExpenseModel;