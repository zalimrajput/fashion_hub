const { handleIncomingMessage } = require("../services/conversationService");
const { getAIReply } = require("../services/aiService");

// Admin AI tester — does not send WhatsApp, only chats with AI
const testChat = async (req, res) => {
  try {
    const { message, sessionId = "admin_test" } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    const reply = await getAIReply(sessionId, message);

    res.status(200).json({
      success: true,
      data: { reply },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Simulate a full WhatsApp-style conversation (persists customer + conversation)
const simulateChat = async (req, res) => {
  try {
    const { message, phone = "+920000000000" } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    const result = await handleIncomingMessage({
      from: phone,
      body: message,
      platform: "WhatsApp",
    });

    res.status(200).json({
      success: true,
      data: {
        reply: result.reply,
        conversationId: result.conversation._id,
        customerId: result.customer._id,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  testChat,
  simulateChat,
};
