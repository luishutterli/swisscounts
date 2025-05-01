import { Router, type Request, type Response } from "express";
import {
  createInventoryItem,
  getInventoryItems,
  updateInventoryItem,
} from "./inventory-item.controller";

const router = Router();

router.get("/", getInventoryItems);
router.post("/", async (req: Request<{ org: number }>, res: Response) => {
  await createInventoryItem(req, res);
});
router.patch("/:id", async (req: Request<{ org: number; id: string }>, res: Response) => {
  await updateInventoryItem(req, res);
});

export { router as inventoryItemRoutes };
