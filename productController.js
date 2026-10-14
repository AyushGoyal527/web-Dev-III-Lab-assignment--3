const mongoose = require("mongoose");
const Product = require("../models/Product");
const asyncHandler = require("../middleware/asyncHandler");
const parseOptionalNumber = require("../utils/parseNumber");

const createProduct = asyncHandler(async (req, res) => {
  const product = await Product.create(req.body);
  res.status(201).json({ success: true, data: product });
});

const getProducts = asyncHandler(async (req, res) => {
  const {
    search,
    category,
    minPrice,
    maxPrice,
    sort = "-createdAt",
    page = "1",
    limit = "10"
  } = req.query;

  const pageNumber = Math.max(1, Number.parseInt(page, 10) || 1);
  const pageSize = Math.min(100, Math.max(1, Number.parseInt(limit, 10) || 10));
  const filter = {};

  if (search && search.trim()) {
    const escaped = search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    filter.$or = [
      { name: { $regex: escaped, $options: "i" } },
      { sku: { $regex: escaped, $options: "i" } },
      { category: { $regex: escaped, $options: "i" } }
    ];
  }

  if (category) filter.category = { $regex: `^${category.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" };

  const lowerPrice = parseOptionalNumber(minPrice, "minPrice");
  const upperPrice = parseOptionalNumber(maxPrice, "maxPrice");
  if (lowerPrice !== undefined || upperPrice !== undefined) {
    filter.price = {};
    if (lowerPrice !== undefined) filter.price.$gte = lowerPrice;
    if (upperPrice !== undefined) filter.price.$lte = upperPrice;
  }

  const allowedSorts = {
    newest: "-createdAt",
    oldest: "createdAt",
    name: "name",
    "-name": "-name",
    price: "price",
    "-price": "-price",
    quantity: "quantity",
    "-quantity": "-quantity"
  };
  const sortBy = allowedSorts[sort] || sort;

  const [products, total] = await Promise.all([
    Product.find(filter)
      .sort(sortBy)
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize),
    Product.countDocuments(filter)
  ]);

  res.json({
    success: true,
    count: products.length,
    pagination: {
      total,
      page: pageNumber,
      limit: pageSize,
      pages: Math.ceil(total / pageSize)
    },
    data: products
  });
});

const getProduct = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(400);
    throw new Error("Invalid product ID");
  }

  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  res.json({ success: true, data: product });
});

const updateProduct = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(400);
    throw new Error("Invalid product ID");
  }

  const allowedFields = ["name", "sku", "category", "description", "price", "quantity", "supplier"];
  const updates = Object.fromEntries(
    Object.entries(req.body).filter(([key]) => allowedFields.includes(key))
  );

  const product = await Product.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
    context: "query"
  });

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  res.json({ success: true, data: product });
});

const deleteProduct = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(400);
    throw new Error("Invalid product ID");
  }

  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  res.json({ success: true, message: "Product deleted successfully", data: product });
});

const adjustStock = asyncHandler(async (req, res) => {
  const { operation, quantity } = req.body;

  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(400);
    throw new Error("Invalid product ID");
  }
  if (!["restock", "sale"].includes(operation)) {
    res.status(400);
    throw new Error('operation must be either "restock" or "sale"');
  }
  if (!Number.isInteger(quantity) || quantity <= 0) {
    res.status(400);
    throw new Error("quantity must be a positive whole number");
  }

  const change = operation === "restock" ? quantity : -quantity;
  const condition = operation === "sale" ? { _id: req.params.id, quantity: { $gte: quantity } } : { _id: req.params.id };
  const product = await Product.findOneAndUpdate(
    condition,
    { $inc: { quantity: change } },
    { new: true, runValidators: true }
  );

  if (!product) {
    const exists = await Product.exists({ _id: req.params.id });
    if (!exists) {
      res.status(404);
      throw new Error("Product not found");
    }
    res.status(409);
    throw new Error("Sale rejected: not enough stock available");
  }

  res.json({ success: true, message: `Stock ${operation} successful`, data: product });
});

module.exports = { createProduct, getProducts, getProduct, updateProduct, deleteProduct, adjustStock };
