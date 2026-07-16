const client = require("../config/twilioConfig");

const sendMessage = async (to, body) => {
    return await client.messages.create({
        from: process.env.TWILIO_WHATSAPP_NUMBER,
        to,
        body,
    });
};

module.exports = {
    sendMessage,
};