const crypto = require("crypto");
const { sendMessage, sendImageMessage } = require("../services/whatsappService");
const { askAI } = require("../services/aiService");
const metaConfig = require("../config/metaConfig");

const ChatSession = require("../models/ChatSession");
const Customer = require("../models/Customer");
const Conversation = require("../models/Conversation");
const ProcessedMessage = require("../models/ProcessedMessage");


// ==========================================
// Verify Meta Webhook
// ==========================================

const verifyWebhook = (req, res) => {

    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (
        mode === "subscribe" &&
        token === metaConfig.whatsapp.verifyToken
    ) {

        console.log("✅ Meta Webhook Verified");

        return res.status(200).send(challenge);
    }

    return res.sendStatus(403);
};


// ==========================================
// Receive WhatsApp Message
// ==========================================

const receiveMessage = async (req, res) => {

    res.sendStatus(200);

    try {

        const message =
            req.body.entry?.[0]
                ?.changes?.[0]
                ?.value?.messages?.[0];

        if (!message) {
            return;
        }

        // =====================================
        // Deduplicate — Meta may redeliver the same webhook event
        // =====================================

        const waMessageId = message.id;

        if (waMessageId) {

            try {

                await ProcessedMessage.create({
                    messageId: waMessageId,
                    platform: "WhatsApp",
                });

            } catch (err) {

                if (err.code === 11000) {

                    console.log(
                        "⏭️ Duplicate WhatsApp message, skipping:",
                        waMessageId
                    );

                    return;

                }

                throw err;

            }

        }

        const phoneNumber = message.from;

        const incomingMessage =
            message.text?.body || "";

        const contact =
            req.body.entry?.[0]
                ?.changes?.[0]
                ?.value?.contacts?.[0];

        const profileName = contact?.profile?.name || "";

        console.log("================================");
        console.log("Phone:", phoneNumber);
        console.log("Message:", incomingMessage);
        console.log("Profile:", profileName);
        console.log("================================");


        // =====================================
        // Find or Auto-Create Customer
        // =====================================

        let customer =
            await Customer.findOne({
                phoneNumber: phoneNumber
            });

        if (!customer) {
            const dummyEmail = `whatsapp_${phoneNumber.replace(/[^0-9]/g, "")}@fashionhub.local`;
            const dummyPassword = crypto.randomBytes(16).toString("hex");

            customer = await Customer.create({
                phoneNumber: phoneNumber,
                whatsappNumber: phoneNumber,
                name: profileName || "WhatsApp Customer",
                email: dummyEmail,
                password: dummyPassword,
            });

            console.log("✅ Auto-created customer:", customer._id, customer.name);
        }


        // =====================================
        // Find/Create Chat Session
        // =====================================

        let chatSession =
            await ChatSession.findOne({
                phoneNumber
            });

        if (!chatSession) {

            chatSession = await ChatSession.create({

              phoneNumber,

              customerName: customer.name || "",

             city: customer.city || "",

             province: customer.province || ""

            });

        }


        // =====================================
        // Find/Create Conversation
        // =====================================

        let conversation =
            await Conversation.findOne({

                customer: customer._id,

                platform: "WhatsApp"

            });


        if (!conversation) {

            conversation =
                await Conversation.create({

                    customer: customer._id,

                    platform: "WhatsApp",

                    messages: [],

                    lastMessage: "",

                    intent: "",

                    lastIntent: "",

                    sentiment: "neutral"

                });

        }


        // =====================================
        // Ask AI
        // =====================================

        
           const aiHistory = [];

if (conversation) {

    conversation.messages.forEach(msg => {

        aiHistory.push({

            role:
                msg.sender === "Customer"
                    ? "user"
                    : "assistant",

            content:
                msg.message

        });

    });

}

const aiResponse = await askAI(

    `whatsapp_${phoneNumber}`,

    incomingMessage,

    customer._id.toString(),

    "WhatsApp",

    aiHistory

);


        conversation.messages.push({

            sender: "Customer",

            message: incomingMessage,

            metadata: {

                intent:
                    aiResponse.intent?.intent || "",

                entities:
                    aiResponse.entities || {}

            }

        });


        conversation.messages.push({

            sender: "AI",

            message: aiResponse.reply,

            metadata: {

                intent:
                    aiResponse.intent?.intent || "",

                entities:
                    aiResponse.entities || {}

            }

        });


        conversation.lastMessage =
            aiResponse.reply;


        conversation.intent =
            aiResponse.intent?.intent || "";


        conversation.lastIntent =
            aiResponse.intent?.intent || "";


        conversation.sentiment =
            (
                aiResponse.sentiment?.sentiment ||
                "neutral"
            ).toLowerCase();

        chatSession.updatedAt = new Date();
        await chatSession.save();

        await conversation.save();


        // =====================================
        // Send Reply
        // =====================================

        await sendMessage(

            phoneNumber,

            aiResponse.reply

        );

        // Send product images if any
        if (aiResponse.products && aiResponse.products.length > 0) {

            for (const product of aiResponse.products) {

                const imageUrl = product.images && product.images[0];

                if (imageUrl) {

                    const productCaption =
                        `${product.productName}\nPrice: Rs. ${product.price}`;

                    await sendImageMessage(phoneNumber, imageUrl, productCaption);

                }

            }

        }

        console.log("✅ WhatsApp Reply Sent");

    }

    catch (error) {

        console.log(
            "WHATSAPP ERROR:",
            error.response?.data || error.message
        );

    }

};


module.exports = {

    verifyWebhook,

    receiveMessage

};