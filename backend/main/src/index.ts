import express from "express";
import mongoose from "mongoose";
import { customerRoutes } from "./impl/customer/customer.routes";
import { inventoryItemRoutes } from "./impl/inventory-item/inventory-item.routes";
import { invoiceRoutes } from "./impl/invoice/invoice.routes";
import { couponRoutes } from "./impl/coupon/coupon.routes";
import { expenseRoutes } from "./impl/expense/expense.routes";

// ---- Config ----
const port = process.env.PORT ? Number.parseInt(process.env.PORT) : 3000;
const version = "1.0.0";
const mongoURI = process.env.MONGODB_URI ?? "mongodb://db2_mongodb:27017/swisscounts";

const poweredText = `SwissCounts Server v${version} by Luis Hutterli`;

// ---- MongoDB ----
mongoose
  .connect(mongoURI)
  .then(() => {
    console.log("MongoDB: Connected");
  })
  .catch((error) => {
    console.error("MongoDB: Could not connect, error: ", error);
    process.exit(1);
  });

mongoose.connection.on("error", (err) => {
  console.error("MongoDB: Connection error:", err);
});

mongoose.connection.on("disconnected", () => {
  console.warn("MongoDB: Disconnected");
});

mongoose.connection.on("reconnected", () => {
  console.log("MongoDB: Reconnected");
});

process.on("SIGINT", async () => {
  try {
    await mongoose.connection.close();
    console.log("MongoDB: Closed connection");
    process.exit(0);
  } catch (err) {
    console.error("Error during MongoDB connection closure:", err);
    process.exit(1);
  }
});

// ---- Express ----
const app = express();

// Middleware
app.use((req, res, next) => {
  res.setHeader("Server", poweredText);
  res.setHeader("X-Powered-By", poweredText);
  next();
});
app.use(express.json());

// Routes
app.use("/:org/customers/", customerRoutes);
app.use("/:org/inventory/items/", inventoryItemRoutes);
app.use("/:org/invoices/", invoiceRoutes);
app.use("/:org/coupons/", couponRoutes);
app.use("/:org/expenses/", expenseRoutes);

app.get("/", (req, res) => {
  res.send(poweredText);
});

// Not found
app.use((req, res) => {
  res.status(404).send("Not found");
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
