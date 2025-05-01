import type { Request, Response } from "express";
import ExpenseModel from "./expense.model";

export async function getExpenses(request: Request<{ org: number }>, response: Response) {
  const { org } = request.params;
  const expenses = await ExpenseModel.find({ orgId: org, state: "active" });
  response.json(expenses);
}

export async function createExpense(
  request: Request<{ org: number }>,
  response: Response,
) {
  const { org } = request.params;
  const expenseData = request.body;
  const expense = new ExpenseModel({
    ...expenseData,
    orgId: org,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const savedExpense = await expense.save();
  if (!savedExpense) {
    return response.status(400).json({ error: "Failed to create expense" });
  }
  response.status(201).json(savedExpense);
}

export async function updateExpense(
  request: Request<{ org: number; id: string }>,
  response: Response,
) {
  const { org, id } = request.params;
  const expenseData = request.body;

  const expense = await ExpenseModel.findOne({ _id: id, orgId: org });
  if (!expense) {
    return response.status(404).json({ error: "Expense not found" });
  }

  const allowedFields = [
    "description",
    "amount",
    "category",
    "date",
    "receiptImageURL",
    "notes",
    "state",
  ];

  for (const key of Object.keys(expenseData)) {
    if (expenseData[key] === undefined || !allowedFields.includes(key)) continue;
    expense.set(key, expenseData[key]);
  }
  expense.updatedAt = new Date();

  const updatedExpense = await expense.save();
  if (!updatedExpense) {
    return response.status(400).json({ error: "Failed to update expense" });
  }
  response.json(updatedExpense);
}