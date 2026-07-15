// const express = require("express");

// const {
//   createCustomer,
//   getCustomers,
//   getCustomerById,
//   updateCustomer,
//   deleteCustomer,
// } = require("../controllers/customerController");

// const router = express.Router();

// router.post("/", createCustomer);

// router.get("/", getCustomers);

// router.get("/:id", getCustomerById);

// router.put("/:id", updateCustomer);

// router.delete("/:id", deleteCustomer);

// module.exports = router;



const express = require("express");

const {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
} = require("../controllers/customerController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", authMiddleware, createCustomer);

router.get("/", authMiddleware, getCustomers);

router.get("/:id", authMiddleware, getCustomerById);

router.put("/:id", authMiddleware, updateCustomer);

router.delete("/:id", authMiddleware, deleteCustomer);

module.exports = router;