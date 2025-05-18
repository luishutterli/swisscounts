import { Router, type Request, type Response } from "express";
import { getExpenses, createExpense, updateExpense } from "./expense.controller";

const router = Router();

router.get("/", async (req: Request<{ org: string }>, res: Response) => {
  await getExpenses(req, res);
});
router.post("/", async (req: Request<{ org: string }>, res: Response) => {
  await createExpense(req, res);
});
router.patch("/:id", async (req: Request<{ org: string; id: string }>, res: Response) => {
  await updateExpense(req, res);
});

export { router as expenseRoutes };
