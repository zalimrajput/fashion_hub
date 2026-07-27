const crypto = require("crypto");
const { sendMessage, sendImageMessage } = require("../services/instagramService");
const { askAI } = require("../services/aiService");
const metaConfig = require("../config/metaConfig");

const ChatSession = require("../models/ChatSession");
const Customer = require("../models/Customer");
const Conversation = require("../models/Conversation");
const ProcessedMessage = require("../models/ProcessedMessage");


// ==========================================
// Verify Instagram Webhook
// ==========================================

const verifyWebhook = (req, res) => {

    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (
        mode === "subscribe" &&
        token === metaConfig.instagram.verifyToken
    ) {

        console.log("✅ Instagram Webhook Verified");

        return res.status(200).send(challenge);
    }

    return res.sendStatus(403);
};


// ==========================================
// Receive Instagram Message
// ==========================================

const receiveMessage = async (req, res) => {

    res.sendStatus(200);

    try {

        const message =
            req.body.entry?.[0]
                ?.messaging?.[0];

        if (!message) {
            return;
        }

        // =====================================
        // Deduplicate — Meta may redeliver the same webhook event
        // =====================================

        const igMessageId = message.message?.mid;

        if (igMessageId) {

            try {

                await ProcessedMessage.create({
                    messageId: igMessageId,
                    platform: "Instagram",
                });

            } catch (err) {

                if (err.code === 11000) {

                    console.log(
                        "⏭️ Duplicate Instagram message, skipping:",
                        igMessageId
                    );

                    return;

                }

                throw err;

            }

        }

        const igUserId = message.sender.id;
        const senderName = message.sender?.name || "";

        const incomingMessage =
            message.message?.text || "";

        console.log("================================");
        console.log("IG User ID:", igUserId);
        console.log("Message:", incomingMessage);
        console.log("================================");


        // =====================================
        // Find or Auto-Create Customer
        // =====================================

        let customer =
            await Customer.findOne({
                instagramId: igUserId
            });

        if (!customer) {
            const dummyEmail = `instagram_${igUserId}@fashionhub.local`;
            const dummyPassword = crypto.randomBytes(16).toString("hex");

            customer = await Customer.create({
                instagramId: igUserId,
                name: senderName || "Instagram Customer",
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
                instagramId: igUserId
            });

        if (!chatSession) {

            chatSession = await ChatSession.create({

              instagramId: igUserId,

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

                platform: "Instagram"

            });


        if (!conversation) {

            conversation =
                await Conversation.create({

                    customer: customer._id,

                    platform: "Instagram",

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

    `instagram_${igUserId}`,

    incomingMessage,

    customer._id.toString(),

    "Instagram",

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

            igUserId,

            aiResponse.reply

        );

        // Send product images if any
        if (aiResponse.products && aiResponse.products.length > 0) {

            for (const product of aiResponse.products) {

                const imageUrl = product.images && product.images[0];

                if (imageUrl) {

                    const productCaption =
                        `${product.productName}\nPrice: Rs. ${product.price}`;

                    await sendImageMessage(igUserId, imageUrl, productCaption);

                }

            }

        }

        console.log("✅ Instagram Reply Sent");

    }

    catch (error) {

        console.log(
            "INSTAGRAM ERROR:",
            error.response?.data || error.message
        );

    }

};


module.exports = {

    verifyWebhook,

    receiveMessage

};
