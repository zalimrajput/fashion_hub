// const Product = require("../models/Product");

// // Create Product
// const createProduct = async (req, res) => {

//     try {

//         const images = [];

//         if (req.files && req.files.length > 0) {

//             req.files.forEach(file => {

//                 images.push(
//                     "/uploads/products/" + file.filename
//                 );

//             });

//         }

//         const product = await Product.create({

//             productName: req.body.productName,
//             category: req.body.category,
//             subCategory: req.body.subCategory,
//             description: req.body.description,
//             price: req.body.price,
//             discount: req.body.discount,
//             sizes: req.body.sizes,
//             colors: req.body.colors,
//             stock: req.body.stock,
//             gender: req.body.gender,
//             season: req.body.season,
//             isTrending: req.body.isTrending,
//             isBestSeller: req.body.isBestSeller,
//             status: req.body.status,
//             images

//         });

//         res.status(201).json({

//             success: true,
//             message: "Product created successfully",
//             data: product

//         });

//     } catch (error) {

//         res.status(500).json({

//             success: false,
//             message: error.message

//         });

//     }

// };

// // Get All Products
// const getProducts = async (req, res) => {
//   try {
//     const products = await Product.find();

//     res.status(200).json({
//       success: true,
//       count: products.length,
//       data: products,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

// // Get Single Product
// const getProductById = async (req, res) => {
//   try {
//     const product = await Product.findById(req.params.id);

//     if (!product) {
//       return res.status(404).json({
//         success: false,
//         message: "Product not found",
//       });
//     }

//     res.status(200).json({
//       success: true,
//       data: product,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

// // Update Product
// const updateProduct = async (req, res) => {
//   try {
//     let updateData = { ...req.body };

//     // If new images are uploaded, replace old images
//     if (req.files && req.files.length > 0) {
//       updateData.images = req.files.map(
//         (file) => `/uploads/products/${file.filename}`
//       );
//     }

//     const product = await Product.findByIdAndUpdate(
//       req.params.id,
//       updateData,
//       {
//         new: true,
//         runValidators: true,
//       }
//     );

//     if (!product) {
//       return res.status(404).json({
//         success: false,
//         message: "Product not found",
//       });
//     }

//     res.status(200).json({
//       success: true,
//       message: "Product updated successfully",
//       data: product,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

// // Delete Product
// const deleteProduct = async (req, res) => {
//   try {
//     const product = await Product.findByIdAndDelete(req.params.id);

//     if (!product) {
//       return res.status(404).json({
//         success: false,
//         message: "Product not found",
//       });
//     }

//     res.status(200).json({
//       success: true,
//       message: "Product deleted successfully",
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

// module.exports = {
//   createProduct,
//   getProducts,
//   getProductById,
//   updateProduct,
//   deleteProduct,
// };





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

    let sizes = req.body.sizes;
    let colors = req.body.colors;

    // Parse sizes
    if (typeof sizes === "string") {
      try {
        sizes = JSON.parse(sizes);
      } catch (err) {
        sizes = sizes
          .replace(/^\[/, "")
          .replace(/\]$/, "")
          .replace(/"/g, "")
          .split(",")
          .map(s => s.trim())
          .filter(Boolean);
      }
    }

    // Parse colors
    if (typeof colors === "string") {
      try {
        colors = JSON.parse(colors);
      } catch (err) {
        colors = colors
          .replace(/^\[/, "")
          .replace(/\]$/, "")
          .replace(/"/g, "")
          .split(",")
          .map(c => c.trim())
          .filter(Boolean);
      }
    }

    // ===========================
    // Save Product
    // ===========================

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