import type { Request, Response } from "express";
import InventoryItemModel from "./inventory-item.model";

export async function getInventoryItems(
  request: Request<{ org: number }>,
  response: Response,
) {
  const { org } = request.params;
  const items = await InventoryItemModel.find({ orgId: org, state: "active" });
  response.json(items);
}

export async function createInventoryItem(
  request: Request<{ org: number }>,
  response: Response,
) {
  const { org } = request.params;
  const itemData = request.body;
  const item = new InventoryItemModel({ ...itemData, orgId: org });
  const savedItem = await item.save();
  if (!savedItem) {
    return response.status(400).json({ error: "Failed to create inventory item" });
  }
  response.status(201).json(savedItem);
}

export async function updateInventoryItem(
  request: Request<{ org: number; id: string }>,
  response: Response,
) {
  const { org, id } = request.params;
  const itemData = request.body;

  const item = await InventoryItemModel.findOne({ _id: id, orgId: org });
  if (!item) {
    return response.status(404).json({ error: "Inventory item not found" });
  }

  const allowedFields = [
    "name",
    "shortName",
    "description",
    "type",
    "price",
    "allowAmountDecimal",
    "imageURLs",
    "primaryImage",
    "tags",
    "inStockStatus",
    "properties",
    "state",
  ];

  for (const key of Object.keys(itemData)) {
    if (itemData[key] === undefined || !allowedFields.includes(key)) continue;
    item.set(key, itemData[key]);
  }
  item.updatedAt = new Date();

  const updatedItem = await item.save();
  if (!updatedItem) {
    return response.status(400).json({ error: "Failed to update inventory item" });
  }
  response.json(updatedItem);
}
