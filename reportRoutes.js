const express = require("express");
const { getLowStockReport, getCategorySummary } = require("../controllers/reportController");

const router = express.Router();

router.get("/low-stock", getLowStockReport);
router.get("/category-summary", getCategorySummary);

module.exports = router;
