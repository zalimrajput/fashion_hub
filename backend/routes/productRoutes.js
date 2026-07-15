// const express = require("express");

// const {
//   createProduct,
//   getProducts,
//   getProductById,
//   updateProduct,
//   deleteProduct,
// } = require("../controllers/productController");

// const router = express.Router();

// router.post("/", createProduct);

// router.get("/", getProducts);

// router.get("/:id", getProductById);

// router.put("/:id", updateProduct);

// router.delete("/:id", deleteProduct);

// module.exports = router;



// const express = require("express");

// const {
//   createProduct,
//   getProducts,
//   getProductById,
//   updateProduct,
//   deleteProduct,
// } = require("../controllers/productController");

// const authMiddleware = require("../middleware/authMiddleware");
// const upload = require("../middleware/uploadMiddleware");

// const router = express.Router();

// // Public Routes
// router.get("/", getProducts);

// router.get("/:id", getProductById);

// // Admin Protected Routes
// router.post(
//   "/",
//   authMiddleware,
//   //upload.array("images", 5),
//   createProduct
// );

// router.put(
//   "/:id",
//   authMiddleware,
//   //upload.array("images", 5),
//   updateProduct
// );

// router.delete(
//   "/:id",
//   authMiddleware,
//   deleteProduct
// );

// module.exports = router;




const express = require("express");

const router = express.Router();

const {
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct
} = require("../controllers/productController");

const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");


// Public
router.get("/", getProducts);

router.get("/:id", getProductById);


// Admin
router.post(
    "/",
    authMiddleware,
    upload.array("images", 5),
    createProduct
);

router.put(
    "/:id",
    authMiddleware,
    upload.array("images", 5),
    updateProduct
);

router.delete(
    "/:id",
    authMiddleware,
    deleteProduct
);

module.exports = router;