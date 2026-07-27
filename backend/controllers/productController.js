const Product = require("../models/Product");

function parseBoolean(value) {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    return value.toLowerCase() === "true";
  }
  return Boolean(value);
}

function parseListField(value) {
  if (Array.isArray(value)) return value;

  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch (err) {
      return value
        .replace(/^\[/, "")
        .replace(/\]$/, "")
        .replace(/"/g, "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    }
  }

  return [];
}

function normalizeProductPayload(body = {}) {
  const payload = { ...body };

  if (payload.sizes !== undefined) payload.sizes = parseListField(payload.sizes);
  if (payload.colors !== undefined) payload.colors = parseListField(payload.colors);
  if (payload.price !== undefined) payload.price = Number(payload.price);
  if (payload.discount !== undefined) payload.discount = Number(payload.discount);
  if (payload.stock !== undefined) payload.stock = Number(payload.stock);
  if (payload.isTrending !== undefined) payload.isTrending = parseBoolean(payload.isTrending);
  if (payload.isBestSeller !== undefined) payload.isBestSeller = parseBoolean(payload.isBestSeller);
  if (payload.status !== undefined) payload.status = parseBoolean(payload.status);

  return payload;
}

// Create Product
const createProduct = async (req, res) => {
  try {

    const images = [];

    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        images.push("/uploads/products/" + file.filename);
      });
    }

    // ===== DEBUG =====
    console.log("========== RAW BODY ==========");
    console.log(req.body);

    console.log("sizes:", req.body.sizes);
    console.log("colors:", req.body.colors);

    console.log("typeof sizes:", typeof req.body.sizes);
    console.log("typeof colors:", typeof req.body.colors);

    console.log("Array.isArray(sizes):", Array.isArray(req.body.sizes));
    console.log("Array.isArray(colors):", Array.isArray(req.body.colors));

    console.log("==============================");

    // ===========================
    // Parse sizes and colors
    // ===========================

    const normalized = normalizeProductPayload(req.body);

    const product = await Product.create({
      productName: normalized.productName,
      category: normalized.category,
      subCategory: normalized.subCategory,
      description: normalized.description,
      price: normalized.price,
      discount: normalized.discount,
      sizes: normalized.sizes,
      colors: normalized.colors,
      stock: normalized.stock,
      gender: normalized.gender,
      season: normalized.season,
      isTrending: normalized.isTrending,
      isBestSeller: normalized.isBestSeller,
      status: normalized.status,
      images,
    });

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};

// Get All Products
const getProducts = async (req, res) => {
  try {
    const products = await Product.find();

    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Single Product
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update Product
const updateProduct = async (req, res) => {
  try {
    let updateData = normalizeProductPayload(req.body);

    // If new images are uploaded, replace old images
    if (req.files && req.files.length > 0) {
      updateData.images = req.files.map(
        (file) => `/uploads/products/${file.filename}`
      );
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete Product
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};

