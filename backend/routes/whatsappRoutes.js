const express = require("express");

const {
    receiveMessage,
} = require("../controllers/whatsappController");

const router = express.Router();

router.post("/", receiveMessage);

module.exports = router;