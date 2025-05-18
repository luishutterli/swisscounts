import { Router, type Request, type Response } from "express";
import { createCustomer, getCustomers, updateCustomer } from "./customer.controller";

const router = Router({ mergeParams: true });

router.get("/", async (req: Request<{ org: string }>, res: Response) => {
  await getCustomers(req, res);
});
router.post("/", async (req: Request<{ org: string }>, res: Response) => {
  await createCustomer(req, res);
});
router.patch("/:id", async (req: Request<{ org: string; id: string }>, res: Response) => {
  await updateCustomer(req, res);
});

export { router as customerRoutes };
