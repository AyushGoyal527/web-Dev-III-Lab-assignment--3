const Product = require("../models/Product");
const asyncHandler = require("../middleware/asyncHandler");

const getLowStockReport = asyncHandler(async (req, res) => {
  const rawThreshold = req.query.threshold ?? process.env.LOW_STOCK_THRESHOLD ?? "5";
  const threshold = Number(rawThreshold);

  if (!Number.isInteger(threshold) || threshold < 0) {
    res.status(400);
    throw new Error("threshold must be a non-negative whole number");
  }

  const products = await Product.find({ quantity: { $lte: threshold } }).sort({ quantity: 1, name: 1 });
  res.json({ success: true, threshold, count: products.length, data: products });
});

const getCategorySummary = asyncHandler(async (_req, res) => {
  const summary = await Product.aggregate([
    {
      $group: {
        _id: "$category",
        productCount: { $sum: 1 },
        totalUnits: { $sum: "$quantity" },
        inventoryValue: { $sum: { $multiply: ["$price", "$quantity"] } },
        averagePrice: { $avg: "$price" }
      }
    },
    { $sort: { category: 1, _id: 1 } },
    {
      $project: {
        _id: 0,
        category: "$_id",
        productCount: 1,
        totalUnits: 1,
        inventoryValue: { $round: ["$inventoryValue", 2] },
        averagePrice: { $round: ["$averagePrice", 2] }
      }
    }
  ]);

  res.json({ success: true, count: summary.length, data: summary });
});

module.exports = { getLowStockReport, getCategorySummary };
