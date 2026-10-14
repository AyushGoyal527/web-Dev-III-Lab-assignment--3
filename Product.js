const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      minlength: [2, "Product name must be at least 2 characters"],
      maxlength: [100, "Product name cannot exceed 100 characters"]
    },
    sku: {
      type: String,
      required: [true, "SKU is required"],
      unique: true,
      trim: true,
      uppercase: true,
      match: [/^[A-Z0-9-]{3,30}$/, "SKU must be 3–30 letters, numbers or hyphens"]
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
      maxlength: [60, "Category cannot exceed 60 characters"]
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
      default: ""
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"]
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [0, "Quantity cannot be negative"],
      validate: {
        validator: Number.isInteger,
        message: "Quantity must be a whole number"
      },
      default: 0
    },
    supplier: {
      type: String,
      trim: true,
      maxlength: [100, "Supplier cannot exceed 100 characters"],
      default: ""
    }
  },
  { timestamps: true, versionKey: false }
);

productSchema.index({ name: "text", category: "text", sku: "text" });
productSchema.index({ category: 1 });
productSchema.index({ quantity: 1 });

module.exports = mongoose.model("Product", productSchema);
