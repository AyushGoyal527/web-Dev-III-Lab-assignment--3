require("dotenv").config();

const express = require("express");
const connectDB = require("./src/config/db");
const productRoutes = require("./src/routes/productRoutes");
const reportRoutes = require("./src/routes/reportRoutes");
const { notFound, errorHandler } = require("./src/middleware/errorMiddleware");

const app = express();
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({
    name: "Inventory & Data Management API",
    status: "running",
    endpoints: {
      products: "/api/products",
      lowStockReport: "/api/reports/low-stock",
      categorySummary: "/api/reports/category-summary"
    }
  });
});

app.use("/api/products", productRoutes);
app.use("/api/reports", reportRoutes);
app.use(notFound);
app.use(errorHandler);

const port = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`Inventory API listening on http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error("Could not start the application:", error.message);
    process.exit(1);
  });
