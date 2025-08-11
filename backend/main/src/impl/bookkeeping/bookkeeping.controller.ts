import type { Request, Response } from "express";
import ExpenseModel from "../expense/expense.model";
import InvoiceModel from "../invoice/invoice.model";
import { getPaginationParams, paginateArray } from "../../util/pagination";

interface BookkeepingEntry {
  id: string;
  date: Date;
  description: string;
  type: "income" | "expense";
  amount: number;
  category?: string;
  sourceId?: string; // References the original expense or invoice ID
  sourceType: "expense" | "invoice";
}

interface BookkeepingSummary {
  totalIncome: number;
  totalExpenses: number;
  netAmount: number;
}

export async function getBookkeepingEntries(
  request: Request<{ org: string }>,
  response: Response,
) {
  console.log("Bookkeeping request received for org:", request.params.org);
  const org = Number.parseInt(request.params.org);
  if (Number.isNaN(org) || org < 0) {
    console.log("Invalid org ID:", request.params.org);
    return response.status(400).json({ error: "Invalid org ID" });
  }

  const paginationOptions = getPaginationParams(request);
  console.log("Pagination options:", paginationOptions);

  try {
    console.log("Fetching expenses and invoices for org:", org);

    // Get all expenses
    const expenses = await ExpenseModel.find({ orgId: org, state: "active" });
    console.log("Found expenses:", expenses.length);

    // Get all paid invoices - either with paidAt date set OR status is "paid"
    const paidInvoices = await InvoiceModel.find({
      orgId: org,
      state: "active",
      $or: [{ "paymentInformation.paidAt": { $exists: true } }, { status: "paid" }],
    }).populate("customerId");
    console.log("Found paid invoices:", paidInvoices.length);

    const bookkeepingEntries: BookkeepingEntry[] = [];

    // Add expenses as negative entries
    for (const expense of expenses) {
      bookkeepingEntries.push({
        id: expense._id.toString(),
        date: expense.date,
        description: expense.description,
        type: "expense",
        amount: expense.amount,
        category: expense.category,
        sourceId: expense._id.toString(),
        sourceType: "expense",
      });
    }

    // Add paid invoices as positive entries
    for (const invoice of paidInvoices) {
      // Calculate total invoice amount from positions
      const totalAmount = invoice.positions.reduce((sum, position) => {
        return sum + position.amount * position.settledPrice.price;
      }, 0);

      // Use customer name if available, otherwise use invoice ID
      const customer = invoice.customerId as unknown;
      const isPopulatedCustomer =
        customer &&
        typeof customer === "object" &&
        customer !== null &&
        "name" in customer &&
        "surName" in customer;
      const customerName = isPopulatedCustomer
        ? `${(customer as { name: string; surName?: string }).name} ${(customer as { name: string; surName?: string }).surName || ""}`.trim()
        : `Rechnung #${invoice.invoiceId}`;

      bookkeepingEntries.push({
        id: invoice._id.toString(),
        date: invoice.paymentInformation?.paidAt || invoice.issuedAt,
        description: invoice.description || `Rechnung an ${customerName}`,
        type: "income",
        amount: totalAmount,
        sourceId: invoice._id.toString(),
        sourceType: "invoice",
      });
    }

    // Sort entries by date (newest first)
    bookkeepingEntries.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );

    // Calculate summary
    const summary: BookkeepingSummary = {
      totalIncome: bookkeepingEntries
        .filter((entry) => entry.type === "income")
        .reduce((sum, entry) => sum + entry.amount, 0),
      totalExpenses: bookkeepingEntries
        .filter((entry) => entry.type === "expense")
        .reduce((sum, entry) => sum + entry.amount, 0),
      netAmount: 0,
    };
    summary.netAmount = summary.totalIncome - summary.totalExpenses;

    // Apply pagination
    const paginatedResult = paginateArray(bookkeepingEntries, paginationOptions);

    response.json({
      ...paginatedResult,
      summary,
    });
  } catch (error) {
    console.error("Error fetching bookkeeping entries:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    response
      .status(500)
      .json({ error: "Failed to fetch bookkeeping entries", details: errorMessage });
  }
}

export async function getBookkeepingSummary(
  request: Request<{ org: string }>,
  response: Response,
) {
  console.log("Bookkeeping summary request received for org:", request.params.org);
  const org = Number.parseInt(request.params.org);
  if (Number.isNaN(org) || org < 0) {
    console.log("Invalid org ID for summary:", request.params.org);
    return response.status(400).json({ error: "Invalid org ID" });
  }

  try {
    // Get all expenses
    const expenses = await ExpenseModel.find({ orgId: org, state: "active" });

    // Get all paid invoices - either with paidAt date set OR status is "paid"
    const paidInvoices = await InvoiceModel.find({
      orgId: org,
      state: "active",
      $or: [{ "paymentInformation.paidAt": { $exists: true } }, { status: "paid" }],
    });

    // Calculate summary
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

    const totalIncome = paidInvoices.reduce((sum, invoice) => {
      return (
        sum +
        invoice.positions.reduce((posSum, position) => {
          return posSum + position.amount * position.settledPrice.price;
        }, 0)
      );
    }, 0);

    const summary: BookkeepingSummary = {
      totalIncome,
      totalExpenses,
      netAmount: totalIncome - totalExpenses,
    };

    response.json(summary);
  } catch (error) {
    console.error("Error fetching bookkeeping summary:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    response
      .status(500)
      .json({ error: "Failed to fetch bookkeeping summary", details: errorMessage });
  }
}
