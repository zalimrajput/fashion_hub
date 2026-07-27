const express = require("express");

const {
  createSetting,
  getSetting,
  updateSetting,
  deleteSetting,
} = require("../controllers/settingsController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", authMiddleware, createSetting);

router.get("/", authMiddleware, getSetting);

router.put("/:id", authMiddleware, updateSetting);

router.delete("/:id", authMiddleware, deleteSetting);

module.exports = router;