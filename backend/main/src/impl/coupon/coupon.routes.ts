import { Router, type Request, type Response } from "express";
import { getCoupons, createCoupon, updateCoupon } from "./coupon.controller";

const router = Router();

router.get("/", getCoupons);
router.post("/", async (req: Request<{ org: number }>, res: Response) => {
  await createCoupon(req, res);
});
router.patch("/:id", async (req: Request<{ org: number; id: string }>, res: Response) => {
  await updateCoupon(req, res);
});

export { router as couponRoutes };
