// const express = require("express");

// const {
//   createOrder,
//   getOrders,
//   getOrderById,
//   updateOrder,
//   deleteOrder,
// } = require("../controllers/orderController");

// const router = express.Router();

// router.post("/", createOrder);

// router.get("/", getOrders);

// router.get("/:id", getOrderById);

// router.put("/:id", updateOrder);

// router.delete("/:id", deleteOrder);

// module.exports = router;



const express = require("express");

const {
  createOrder,
  getOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
} = require("../controllers/orderController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", authMiddleware, createOrder);

router.get("/", authMiddleware, getOrders);

router.get("/:id", authMiddleware, getOrderById);

router.put("/:id", authMiddleware, updateOrder);

router.delete("/:id", authMiddleware, deleteOrder);

module.exports = router;