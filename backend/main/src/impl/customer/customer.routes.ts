import { Router } from "express";

const router = Router();

router.get("/", (req, res) => {
  // TODO: List all customers
});
router.post("/", (req, res) => {
  // TODO: Create a new customer
});
router.patch("/:id", (req, res) => {
  // TODO: Update a customer
});

export { router as customerRoutes };
