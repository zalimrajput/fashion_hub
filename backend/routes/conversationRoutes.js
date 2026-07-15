// const express = require("express");

// const {
//   createConversation,
//   getConversations,
//   getConversationById,
//   updateConversation,
//   deleteConversation,
// } = require("../controllers/conversationController");

// const router = express.Router();

// router.post("/", createConversation);

// router.get("/", getConversations);

// router.get("/:id", getConversationById);

// router.put("/:id", updateConversation);

// router.delete("/:id", deleteConversation);

// module.exports = router;


const express = require("express");

const {
  createConversation,
  getConversations,
  getConversationById,
  updateConversation,
  deleteConversation,
} = require("../controllers/conversationController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", authMiddleware, createConversation);

router.get("/", authMiddleware, getConversations);

router.get("/:id", authMiddleware, getConversationById);

router.put("/:id", authMiddleware, updateConversation);

router.delete("/:id", authMiddleware, deleteConversation);

module.exports = router;