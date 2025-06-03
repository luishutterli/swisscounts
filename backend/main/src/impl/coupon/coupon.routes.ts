import { Router, type Request, type Response } from "express";
import { getCoupons, createCoupon, updateCoupon } from "./coupon.controller";

const router = Router({ mergeParams: true });

router.get("/", async (req: Request<{ org: string }>, res: Response) => {
  await getCoupons(req, res);
});
router.post("/", async (req: Request<{ org: string }>, res: Response) => {
  await createCoupon(req, res);
});
router.patch("/:id", async (req: Request<{ org: string; id: string }>, res: Response) => {
  await updateCoupon(req, res);
});

export { router as couponRoutes };
