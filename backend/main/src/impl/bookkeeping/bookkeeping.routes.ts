import { Router, type Request, type Response } from "express";
import { getBookkeepingEntries, getBookkeepingSummary } from "./bookkeeping.controller";

const router = Router({ mergeParams: true });

router.get("/", async (req: Request<{ org: string }>, res: Response) => {
  await getBookkeepingEntries(req, res);
});

router.get("/summary", async (req: Request<{ org: string }>, res: Response) => {
  await getBookkeepingSummary(req, res);
});

export { router as bookkeepingRoutes };
