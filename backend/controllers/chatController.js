const ChatSession = require("../models/ChatSession");
const Conversation = require("../models/Conversation");

const {
    askAI
} = require("../services/aiService");



// =====================================
// Chat Controller
// =====================================

const chat = async (req, res) => {

    try {


        const {

            session_id,

            message,

            customer_id,

            platform,

            phoneNumber,

            history = []


        } = req.body;



        // =====================================
        // 1. Find/Create Chat Session
        // =====================================


        let chatSession =
            await ChatSession.findOne({
                phoneNumber
            });



        if (!chatSession) {


            chatSession =
                await ChatSession.create({

                    phoneNumber,

                    step: "START"

                });

        }



        // =====================================
        // 2. Load Conversation History
        // =====================================

        let conversation = await Conversation.findOne({
           customer: customer_id,
           platform: platform
        });

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


// =====================================
// 3. Send Message To AI
// =====================================

const aiResponse = await askAI(

    session_id,

    message,

    customer_id,

    platform,

    aiHistory

);


        // =====================================
// 4. Save Conversation
// =====================================

if (!conversation) {

    conversation = await Conversation.create({

        customer: customer_id,

        platform,

        messages: [],

        lastMessage: "",

        intent: "",

        lastIntent: "",

        sentiment: "neutral"

    });

}


conversation.messages.push({

    sender: "Customer",

    message,

    metadata: {

        intent:
            aiResponse.intent?.intent || "",

        entities:
            aiResponse.entities || {}

    }

});


conversation.messages.push({

    sender: "AI",

    message:
        aiResponse.reply,

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

await conversation.save();



        // =====================================
        // 4. Return AI Response
        // =====================================


        res.status(200).json(

            aiResponse

        );



    }
    catch (error) {


        console.log(
            "CHAT CONTROLLER ERROR:",
            error.message
        );


        res.status(500).json({

            success: false,

            reply:
            "Something went wrong."

        });


    }

};



module.exports = {

    chat

};