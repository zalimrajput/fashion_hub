const express = require("express");

const {
    verifyWebhook,
    receiveMessage,
} = require("../controllers/whatsappController");

const router = express.Router();

// Meta webhook verification
router.get("/webhook", verifyWebhook);

// Receive WhatsApp messages
router.post("/webhook", receiveMessage);

module.exports = router;