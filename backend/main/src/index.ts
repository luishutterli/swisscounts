import express from "express";
import { customerRoutes } from "./impl/customer/customer.routes";
import { inventoryItemRoutes } from "./impl/inventory-item/inventory-item.routes";
import { invoiceRoutes } from "./impl/invoice/invoice.routes";
import { couponRoutes } from "./impl/coupns/coupon.routes";
import { expenseRoutes } from "./impl/expense/expense.routes";

// ---- Config ----
const port = 3000;
const version = "1.0.0";

const app = express();

app.use((req, res, next) => {
  res.setHeader("Server", `SwissCounts Server v${version} by Luis Hutterli`);
  res.setHeader("X-Powered-By", `SwissCounts Server v${version} by Luis Hutterli`);
  next();
});
app.use(express.json());
app.use("/:org/customers/", customerRoutes);
app.use("/:org/inventory/items/", inventoryItemRoutes);
app.use("/:org/invoices/", invoiceRoutes);
app.use("/:org/coupons/", couponRoutes);
app.use("/:org/expenses/", expenseRoutes);

app.get("/", (req, res) => {
  res.send(`SwissCounts Server v${version} by Luis Hutterli`);
});

// Not found
app.use((req, res) => {
  res.status(404).send("Not found");
});

app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});
