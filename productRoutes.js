const express = require("express");
const {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  adjustStock
} = require("../controllers/productController");

const router = express.Router();

router.route("/").post(createProduct).get(getProducts);
router.patch("/:id/stock", adjustStock);
router.route("/:id").get(getProduct).put(updateProduct).delete(deleteProduct);

module.exports = router;
