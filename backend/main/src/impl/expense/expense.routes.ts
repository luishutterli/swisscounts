import { Router, type Request, type Response } from "express";
import { getExpenses, createExpense, updateExpense } from "./expense.controller";

const router = Router();

router.get("/", getExpenses);
router.post("/", async (req: Request<{ org: number }>, res: Response) => {
  await createExpense(req, res);
});
router.patch("/:id", async (req: Request<{ org: number; id: string }>, res: Response) => {
  await updateExpense(req, res);
});

export { router as expenseRoutes };