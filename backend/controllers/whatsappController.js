const { sendMessage } = require("../services/whatsappService");
const { handleIncomingMessage } = require("../services/conversationService");

const receiveMessage = async (req, res) => {
  try {
    const incomingMessage = req.body.Body;
    const from = req.body.From;

    console.log("WhatsApp message:", incomingMessage);
    console.log("From:", from);

    if (!incomingMessage || !from) {
      return res.status(200).send("Ignored empty message.");
    }

    const { reply } = await handleIncomingMessage({
      from,
      body: incomingMessage,
      platform: "WhatsApp",
    });

    await sendMessage(from, reply);

    res.status(200).send("Message processed.");
  } catch (err) {
    console.error("WhatsApp webhook error:", err);

    // Always acknowledge Twilio to avoid retries storms
    res.status(200).send("Error handled.");
  }
};

module.exports = {
  receiveMessage,
};
