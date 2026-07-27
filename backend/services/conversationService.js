const Customer = require("../models/Customer");
const Conversation = require("../models/Conversation");
const { getAIReply } = require("./aiService");

const normalizePhone = (from) => {
  if (!from) return "";
  return String(from).replace(/^whatsapp:/i, "").trim();
};

const findOrCreateCustomer = async (phone) => {
  let customer = await Customer.findOne({
    $or: [{ phoneNumber: phone }, { whatsappNumber: phone }],
  });

  if (!customer) {
    customer = await Customer.create({
      name: `WhatsApp ${phone.slice(-4)}`,
      phoneNumber: phone,
      whatsappNumber: phone,
    });
  }

  return customer;
};

const findOrCreateConversation = async (customerId, platform = "WhatsApp") => {
  let conversation = await Conversation.findOne({
    customer: customerId,
    platform,
    isResolved: false,
  }).sort({ updatedAt: -1 });

  if (!conversation) {
    conversation = await Conversation.create({
      customer: customerId,
      platform,
      messages: [],
      lastMessage: "",
    });
  }

  return conversation;
};

const appendMessage = (conversation, sender, message) => {
  conversation.messages.push({
    sender,
    message,
    messageType: "Text",
    timestamp: new Date(),
  });
  conversation.lastMessage = message;
};

const handleIncomingMessage = async ({
  from,
  body,
  platform = "WhatsApp",
}) => {
  const phone = normalizePhone(from);
  const text = (body || "").trim();

  if (!phone || !text) {
    throw new Error("Missing sender or message body");
  }

  const customer = await findOrCreateCustomer(phone);
  const conversation = await findOrCreateConversation(customer._id, platform);

  appendMessage(conversation, "Customer", text);

  const sessionId = `${platform.toLowerCase()}_${phone}`;
  let reply;

  try {
    reply = await getAIReply(sessionId, text);
  } catch (error) {
    console.error("AI service failed:", error.message);
    reply =
      "Welcome to FashionHub ❤ Thank you for contacting us.\n\nHow may I help you today?\n1. New Arrivals\n2. Women's Collection\n3. Men's Collection\n4. Order Tracking\n5. Delivery Information";
  }

  appendMessage(conversation, "AI", reply);
  await conversation.save();

  return {
    customer,
    conversation,
    reply,
  };
};

module.exports = {
  normalizePhone,
  findOrCreateCustomer,
  findOrCreateConversation,
  handleIncomingMessage,
};
