import type { Request, Response } from "express";
import ExpenseModel from "./expense.model";
import { getPaginationParams, paginateArray } from "../../util/pagination";

export async function getExpenses(request: Request<{ org: string }>, response: Response) {
  const org = Number.parseInt(request.params.org);
  if (Number.isNaN(org) || org < 0) {
    return response.status(400).json({ error: "Invalid org ID" });
  }

  const paginationOptions = getPaginationParams(request);

  const expenses = await ExpenseModel.find({ orgId: org, state: "active" });
  const paginatedResult = paginateArray(expenses, paginationOptions);

  response.json(paginatedResult);
}

export async function createExpense(
  request: Request<{ org: string }>,
  response: Response,
) {
  const org = Number.parseInt(request.params.org);
  if (Number.isNaN(org) || org < 0) {
    return response.status(400).json({ error: "Invalid org ID" });
  }
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
  request: Request<{ org: string; id: string }>,
  response: Response,
) {
  const org = Number.parseInt(request.params.org);
  if (Number.isNaN(org) || org < 0) {
    return response.status(400).json({ error: "Invalid org ID" });
  }
  const id = request.params.id;
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
