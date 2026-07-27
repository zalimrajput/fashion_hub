const express = require("express");

const {
  createTraining,
  getTrainings,
  getTrainingById,
  updateTraining,
  deleteTraining,
} = require("../controllers/aiTrainingController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", authMiddleware, createTraining);

router.get("/", authMiddleware, getTrainings);

router.get("/:id", authMiddleware, getTrainingById);

router.put("/:id", authMiddleware, updateTraining);

router.delete("/:id", authMiddleware, deleteTraining);

module.exports = router;