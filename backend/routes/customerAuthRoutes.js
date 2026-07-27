const express = require("express");

const {
  registerCustomer,
  loginCustomer,
  getProfile,
  updateProfile,
  changePassword,
} = require("../controllers/customerAuthController");

const customerAuthMiddleware = require("../middleware/customerAuthMiddleware");

const router = express.Router();

// ==============================
// Public Routes
// ==============================

router.post("/register", registerCustomer);

router.post("/login", loginCustomer);

// ==============================
// Protected Routes
// ==============================

router.get(
  "/profile",
  customerAuthMiddleware,
  getProfile
);

router.put(
  "/profile",
  customerAuthMiddleware,
  updateProfile
);

router.put(
  "/change-password",
  customerAuthMiddleware,
  changePassword
);

module.exports = router;