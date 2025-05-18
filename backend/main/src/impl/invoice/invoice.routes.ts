import { Router, type Request, type Response } from "express";
import {
  createInvoice,
  getInvoices,
  getInvoiceById,
  updateInvoice,
} from "./invoice.controller";

const router = Router();

router.get("/", async (req: Request<{ org: string }>, res: Response) => {
  await getInvoices(req, res);
});
router.get("/:id", async (req: Request<{ org: string; id: string }>, res: Response) => {
  await getInvoiceById(req, res);
});
router.post("/", async (req: Request<{ org: string }>, res: Response) => {
  await createInvoice(req, res);
});
router.patch("/:id", async (req: Request<{ org: string; id: string }>, res: Response) => {
  await updateInvoice(req, res);
});

export { router as invoiceRoutes };
