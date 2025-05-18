import { Router, type Request, type Response } from "express";
import {
  createInventoryItem,
  getInventoryItems,
  updateInventoryItem,
} from "./inventory-item.controller";

const router = Router({ mergeParams: true });

router.get("/", async (req: Request<{ org: string }>, res: Response) => {
  await getInventoryItems(req, res);
});
router.post("/", async (req: Request<{ org: string }>, res: Response) => {
  await createInventoryItem(req, res);
});
router.patch("/:id", async (req: Request<{ org: string; id: string }>, res: Response) => {
  await updateInventoryItem(req, res);
});

export { router as inventoryItemRoutes };
