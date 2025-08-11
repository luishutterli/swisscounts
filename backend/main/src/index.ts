import express from "express";
import mongoose from "mongoose";
import { customerRoutes } from "./impl/customer/customer.routes";
import { inventoryItemRoutes } from "./impl/inventory-item/inventory-item.routes";
import { invoiceRoutes } from "./impl/invoice/invoice.routes";
import { couponRoutes } from "./impl/coupon/coupon.routes";
import { expenseRoutes } from "./impl/expense/expense.routes";
import { bookkeepingRoutes } from "./impl/bookkeeping/bookkeeping.routes";
import * as httpContext from "express-http-context";
import cors from "cors";

interface AppError extends Error {
  statusCode?: number;
}

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
app.use(httpContext.middleware);
app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

// Middleware to check for authkit-validity
app.use((req, res, next) => {
  const headerStr = req.headers["x-authkit-valid"];
  if (headerStr !== "true") {
    console.error(
      "[CRITICAL] Backend received request although X-AuthKit-Valid is not true! X-AuthKit-Valid:",
      headerStr,
    );
    res.status(401).json({
      success: false,
      error: {
        message: "Unauthorized",
      },
    });
    return;
  }

  const userStr = req.headers["x-authkit-user"];
  if (!userStr || typeof userStr !== "string") {
    console.error(
      "[CRITICAL] Backend received request without X-AuthKit-User! X-AuthKit-User:",
      userStr,
    );
    res.status(401).json({
      success: false,
      error: {
        message: "Unauthorized",
      },
    });
    return;
  }

  // biome-ignore lint/suspicious/noExplicitAny:
  let userObj: any;
  try {
    userObj = JSON.parse(userStr);
  } catch (err) {
    console.error(
      "[CRITICAL] Backend received request with invalid X-AuthKit-User! X-AuthKit-User:",
      userStr,
    );
    res.status(401).json({
      success: false,
      error: {
        message: "Unauthorized",
      },
    });
    return;
  }

  // Validate userObj
  if (
    !(
      userObj?.id &&
      userObj?.email &&
      userObj?.name &&
      userObj?.surname &&
      userObj.emailVerified !== undefined &&
      userObj?.createdAt
    )
  ) {
    console.error(
      "[CRITICAL] Backend received request with incomplete X-AuthKit-User! X-AuthKit-User:",
      userObj,
    );
    res.status(401).json({
      success: false,
      error: {
        message: "Unauthorized",
      },
    });
    return;
  }

  httpContext.set("user", userObj);
  httpContext.set("userId", userObj.id);

  next();
});

// Error handling middleware
app.use(
  (
    err: Error | AppError,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    console.error("Error:", err.message);
    console.error("Stack:", err.stack);

    if (res.headersSent) {
      return next(err);
    }

    const statusCode = (err as AppError).statusCode ?? 500;

    const errorResponse: Record<string, unknown> = {
      success: false,
      error: {
        message:
          process.env.NODE_ENV === "production" ? "Internal server error" : err.message,
      },
    };

    if (process.env.NODE_ENV !== "production") {
      errorResponse.error = {
        ...(errorResponse.error as Record<string, unknown>),
        stack: err.stack ?? "No stack trace available",
      };
    }

    res.status(statusCode).json(errorResponse);
  },
);

// Base
const base = `/v${version.split(".")[0]}`;

// Routes
app.use(`${base}/:org/customers/`, customerRoutes);
app.use(`${base}/:org/inventory/items/`, inventoryItemRoutes);
app.use(`${base}/:org/invoices/`, invoiceRoutes);
app.use(`${base}/:org/coupons/`, couponRoutes);
app.use(`${base}/:org/expenses/`, expenseRoutes);
app.use(`${base}/:org/bookkeeping/`, bookkeepingRoutes);

app.get("/", (req, res) => {
  res.send(poweredText);
});

// Not found
app.use((req, res) => {
  res.status(404).send("Not found");
});

app.listen(port, () => {
  console.log(`${poweredText}: Server listening on port ${port}`);
});
