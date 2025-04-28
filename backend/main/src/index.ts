import express from "express";
import { customerRoutes } from "./impl/customer/customer.routes";

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
app.use("/:org/customer/", customerRoutes);

app.get("/", (req, res) => {
  res.send(`SwissCounts Server v${version} by Luis Hutterli`);
});

app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});
