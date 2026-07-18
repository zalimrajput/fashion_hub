const Product = require("../models/Product");

const parseList = (value) => {
  if (Array.isArray(value)) return value;
  if (typeof value !== "string" || !value.trim()) return [];
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed;
  } catch (_) {
    // fall through to comma-separated
  }
  return value.split(",").map((item) => item.trim()).filter(Boolean);
};

const parseBoolean = (value, fallback = false) => {
  if (typeof value === "boolean") return value;
  if (value === undefined || value === null || value === "") return fallback;
  return String(value).toLowerCase() === "true" || value === "1" || value === "on";
};

// Create Product
const createProduct = async (req, res) => {

    try {

        const images = [];

        if (req.files && req.files.length > 0) {

            req.files.forEach(file => {

                images.push(
                    "/uploads/products/" + file.filename
                );

            });

        }

        const product = await Product.create({

            productName: req.body.productName,
            category: req.body.category,
            subCategory: req.body.subCategory,
            description: req.body.description,
            price: Number(req.body.price),
            discount: Number(req.body.discount || 0),
            sizes: parseList(req.body.sizes),
            colors: parseList(req.body.colors),
            stock: Number(req.body.stock || 0),
            gender: req.body.gender,
            season: req.body.season,
            isTrending: parseBoolean(req.body.isTrending),
            isBestSeller: parseBoolean(req.body.isBestSeller),
            status: parseBoolean(req.body.status, true),
            images

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
    let updateData = { ...req.body };

    if (updateData.sizes !== undefined) updateData.sizes = parseList(updateData.sizes);
    if (updateData.colors !== undefined) updateData.colors = parseList(updateData.colors);
    if (updateData.price !== undefined) updateData.price = Number(updateData.price);
    if (updateData.discount !== undefined) updateData.discount = Number(updateData.discount);
    if (updateData.stock !== undefined) updateData.stock = Number(updateData.stock);
    if (updateData.isTrending !== undefined) updateData.isTrending = parseBoolean(updateData.isTrending);
    if (updateData.isBestSeller !== undefined) updateData.isBestSeller = parseBoolean(updateData.isBestSeller);
    if (updateData.status !== undefined) updateData.status = parseBoolean(updateData.status, true);

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