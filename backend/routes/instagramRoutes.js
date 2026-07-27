const express = require("express");

const {
    verifyWebhook,
    receiveMessage,
} = require("../controllers/instagramController");

const router = express.Router();

// Instagram webhook verification
router.get("/webhook", verifyWebhook);

// Receive Instagram messages
router.post("/webhook", receiveMessage);

module.exports = router;
