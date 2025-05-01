import type { Request, Response } from "express";
import CustomerModel from "./customer.model";

export async function getCustomers(request: Request<{ org: number }>, response: Response) {
  const { org } = request.params;
  const customers = await CustomerModel.find({ orgId: org });
  response.json(customers);
}

export async function createCustomer(request: Request<{ org: number }>, response: Response) {
  const { org } = request.params;
  const customerData = request.body;
  const customer = new CustomerModel({ ...customerData, orgId: org });
  const cu = await customer.save();
  if (!cu) {
    return response.status(400).json({ error: "Failed to create customer" });
  }
  response.status(201).json(customer);
}

export async function updateCustomer(
  request: Request<{ org: number; id: string }>,
  response: Response,
) {
  const { org, id } = request.params;
  const customerData = request.body;

  const customer = await CustomerModel.findOne({ _id: id, orgId: org });
  if (!customer) {
    return response.status(404).json({ error: "Customer not found" });
  }

  const allowedFields = [
    "title",
    "name",
    "surName",
    "email",
    "phone",
    "address",
    "dateOfBirth",
    "state",
  ];

  for (const key of Object.keys(customerData)) {
    if (customerData[key] === undefined || !allowedFields.includes(key)) continue;
    customer.set(key, customerData[key]);
  }
  customer.updatedAt = new Date();

  const updatedCustomer = await customer.save();
  if (!updatedCustomer) {
    return response.status(400).json({ error: "Failed to update customer" });
  }
  response.json(updatedCustomer);
}
