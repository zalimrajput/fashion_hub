const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");

const {
  createTraining,
  getTrainings,
  getTrainingById,
  updateTraining,
  deleteTraining,
} = require("../controllers/aiTrainingController");

const router = express.Router();

router.use(authMiddleware);

router.post("/", createTraining);
router.get("/", getTrainings);
router.get("/:id", getTrainingById);
router.put("/:id", updateTraining);
router.delete("/:id", deleteTraining);

module.exports = router;
