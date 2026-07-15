const Product = require("../models/Product");

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
            price: req.body.price,
            discount: req.body.discount,
            sizes: req.body.sizes,
            colors: req.body.colors,
            stock: req.body.stock,
            gender: req.body.gender,
            season: req.body.season,
            isTrending: req.body.isTrending,
            isBestSeller: req.body.isBestSeller,
            status: req.body.status,
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