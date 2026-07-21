const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const {
  exportProducts,
  exportCustomers,
  exportOrders,
  exportConversations,
} = require("../controllers/exportController");

const router = express.Router();

router.use(authMiddleware);

router.get("/products", exportProducts);
router.get("/customers", exportCustomers);
router.get("/orders", exportOrders);
router.get("/conversations", exportConversations);

module.exports = router;
