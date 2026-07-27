
const axios = require("axios");

const AI_URL = process.env.AI_SERVICE_URL || "http://127.0.0.1:8000/chat";



async function askAI(
    sessionId,
    message,
    customerId,
    platform = "web",
    history = []
) {

    try {

        const response = await axios.post(
            AI_URL,
            {
                session_id: sessionId,

                message: message,

                customer_id: customerId,

                platform: platform,

                history: history
            }
        );


        return response.data;


    } catch(error) {

        console.error(
            "AI Service Error:",
            error.response?.data || error.message
        );


        return {
            reply:
            "Sorry, I'm having trouble responding right now."
        };

    }

}


module.exports = {
    askAI
};