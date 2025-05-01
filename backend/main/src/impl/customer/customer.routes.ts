import { Router, type Request, type Response } from "express";
import { createCustomer, getCustomers, updateCustomer } from "./customer.controller";

const router = Router();

// TODO: Why is this required on the last two but not on the first route?
router.get("/", getCustomers);
router.post("/", async (req: Request<{ org: number }>, res: Response) => {
  await createCustomer(req, res);
});
router.patch("/:id", async (req: Request<{ org: number; id: string }>, res: Response) => {
  await updateCustomer(req, res);
});

export { router as customerRoutes };
