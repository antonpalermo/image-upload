import dotenv from 'dotenv'
import express, { Application, Router } from "express";

import productsRoute from "./routers/products";

dotenv.config()

async function main() {
  const app: Application = express();
  const port = process.env.PORT || 5000;
  // base route instance
  const baseRouter: Router = express.Router();

  // products routes
  baseRouter.use("/products", productsRoute);

  app.use("/api", baseRouter);

  app.listen(port, () => {
    console.log(`server started on http://localhost:${port}`);
  });
}

main().catch((e) => {
  console.log("Internal Server Error: ", e);
});
