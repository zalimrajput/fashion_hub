const express = require("express");

const {
  registerAdmin,
  loginAdmin,
  getProfile,
  updateProfile,
} = require("../controllers/adminController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Public Routes (registration removed; only login)
router.post("/login", loginAdmin);

// Protected Routes
router.get("/profile", authMiddleware, getProfile);
router.put("/profile", authMiddleware, updateProfile);

module.exports = router;