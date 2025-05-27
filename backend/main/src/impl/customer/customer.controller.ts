import type { Request, Response } from "express";
import CustomerModel, { type ICustomer } from "./customer.model";
import { getPaginationParams, paginateArray } from "../../util/pagination";
import type { Document, Types } from "mongoose";

export async function getCustomers(
  request: Request<{ org: string }>,
  response: Response,
) {
  const org = Number.parseInt(request.params.org);
  if (Number.isNaN(org) || org < 0) {
    console.error("Invalid org ID:", request.params.org, "Parsed org ID:", org);
    return response.status(400).json({ error: "Invalid org ID" });
  }

  const paginationOptions = getPaginationParams(request);

  const customers = await CustomerModel.find({ orgId: org });
  const paginatedResult = paginateArray(customers, paginationOptions);

  response.json(paginatedResult);
}

export async function createCustomer(
  request: Request<{ org: string }>,
  response: Response,
) {
  const org = Number.parseInt(request.params.org);
  if (Number.isNaN(org) || org < 0) {
    return response.status(400).json({ error: "Invalid org ID" });
  }
  const customerData = request.body;
  const customer = new CustomerModel({ ...customerData, orgId: org });

  cleanAddress(customer);

  const cu = await customer.save();
  if (!cu) {
    return response.status(400).json({ error: "Failed to create customer" });
  }
  response.status(201).json(customer);
}

export async function updateCustomer(
  request: Request<{ org: string; id: string }>,
  response: Response,
) {
  const org = Number.parseInt(request.params.org);
  const id = request.params.id;
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

  cleanAddress(customer);

  const updatedCustomer = await customer.save();
  if (!updatedCustomer) {
    return response.status(400).json({ error: "Failed to update customer" });
  }
  response.json(updatedCustomer);
}

export function cleanAddress(
  // biome-ignore lint/complexity/noBannedTypes: required for Mongoose Document type
  customer: Document<unknown, {}, ICustomer, {}> &
    ICustomer & {
      _id: Types.ObjectId;
    } & {
      __v: number;
    },
) {
  if (!customer.address) return customer;

  const { street, postalCode, city, canton, country } = customer.address;

  if (
    street === "" &&
    postalCode === "" &&
    city === "" &&
    canton === "" &&
    country === ""
  )
    customer.address = undefined;
}
