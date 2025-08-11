import type { Request, Response } from "express";
import InventoryItemModel from "./inventory-item.model";
import { getPaginationParams, paginateArray } from "../../util/pagination";
import * as httpContext from "express-http-context";

export async function getInventoryItems(
  request: Request<{ org: string }>,
  response: Response,
) {
  const org = Number.parseInt(request.params.org);
  if (Number.isNaN(org) || org < 0) {
    return response.status(400).json({ error: "Invalid org ID" });
  }

  const paginationOptions = getPaginationParams(request);

  // Extract search filter
  const filter = request.query.filter as string;
  let searchObj: Record<string, unknown> = {};

  if (filter) {
    try {
      const filterObj = JSON.parse(filter);
      if (filterObj.search) {
        const searchRegex = new RegExp(filterObj.search, "i");
        searchObj = {
          $or: [
            { name: searchRegex },
            { shortName: searchRegex },
            { description: searchRegex },
            { tags: { $in: [searchRegex] } },
          ],
        };
      }
    } catch (e) {
      console.warn("Failed to parse filter:", filter);
    }
  }

  const items = await InventoryItemModel.find({
    orgId: org,
    state: "active",
    ...searchObj,
  });
  const paginatedResult = paginateArray(items, paginationOptions);

  response.json(paginatedResult);
}

export async function createInventoryItem(
  request: Request<{ org: string }>,
  response: Response,
) {
  const org = Number.parseInt(request.params.org);
  if (Number.isNaN(org) || org < 0) {
    return response.status(400).json({ error: "Invalid org ID" });
  }
  const itemData = request.body;

  const userId = httpContext.get("userId");
  if (!userId) {
    console.error("[ERROR] userId could not be inferred from context.");
    return response.status(401).json({ error: "Unauthorized" });
  }
  itemData.createdBy = userId;

  const item = new InventoryItemModel({ ...itemData, orgId: org });
  const savedItem = await item.save();
  if (!savedItem) {
    return response.status(400).json({ error: "Failed to create inventory item" });
  }
  response.status(201).json(savedItem);
}

export async function updateInventoryItem(
  request: Request<{ org: string; id: string }>,
  response: Response,
) {
  const org = Number.parseInt(request.params.org);
  if (Number.isNaN(org) || org < 0) {
    return response.status(400).json({ error: "Invalid org ID" });
  }
  const id = request.params.id;
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
