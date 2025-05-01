import { Router, type Request } from "express";

const router = Router();

router.get("/", (req: Request<{org: number}>, res) => {
  // TODO: List all customers
});
router.post("/", (req: Request<{ org: number }>, res) => {
  // TODO: Create a new customer
});
router.patch("/:id", (req: Request<{ org: number; id: string }>, res) => {
  // TODO: Update a customer
});

export { router as customerRoutes };
