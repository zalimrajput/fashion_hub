const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const { testChat, simulateChat } = require("../controllers/chatController");

const router = express.Router();

router.post("/test", authMiddleware, testChat);
router.post("/simulate", authMiddleware, simulateChat);

module.exports = router;
