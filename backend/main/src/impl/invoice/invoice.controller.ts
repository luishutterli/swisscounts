import type { Request, Response } from "express";
import InvoiceModel from "./invoice.model";
import { getPaginationParams, paginateArray } from "../../util/pagination";

export async function getInvoices(request: Request<{ org: string }>, response: Response) {
  const org = Number.parseInt(request.params.org);
  if (Number.isNaN(org) || org < 0) {
    return response.status(400).json({ error: "Invalid org ID" });
  }

  const paginationOptions = getPaginationParams(request);

  const invoices = await InvoiceModel.find({ orgId: org, state: "active" })
    .populate("customerId")
    .populate("positions.inventoryItemId");

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
    .populate("positions.inventoryItemId");

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

  const lastInvoice = await InvoiceModel.findOne({ orgId: org })
    .sort({ invoiceId: -1 })
    .select("invoiceId");
  const newInvoiceId = (lastInvoice?.invoiceId ?? 0) + 1;

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
    invoice.set(key, invoiceData[key]);
  }
  invoice.updatedAt = new Date();

  const updatedInvoice = await invoice.save();
  if (!updatedInvoice) {
    return response.status(400).json({ error: "Failed to update invoice" });
  }
  response.json(updatedInvoice);
}
