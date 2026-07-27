const axios = require("axios");
const metaConfig = require("../config/metaConfig");

const sendMessage = async (to, body) => {

    const url =
        `https://graph.facebook.com/v25.0/${metaConfig.whatsapp.phoneNumberId}/messages`;

    const data = {
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: {
            body
        }
    };

    const headers = {
        Authorization: `Bearer ${metaConfig.whatsapp.accessToken}`,
        "Content-Type": "application/json"
    };

    try {
        
        console.log("📱 Sending reply to:", to); 
        const response = await axios.post(url, data, { headers });

        console.log("✅ WhatsApp Sent:", response.data);

        return response.data;

    } catch (error) {

        console.log(
            "❌ META SEND ERROR:",
            JSON.stringify(error.response?.data, null, 2)
        );

        throw error;
    }
};

const sendImageMessage = async (to, imageUrl, caption) => {

    const url =
        `https://graph.facebook.com/v25.0/${metaConfig.whatsapp.phoneNumberId}/messages`;

    const data = {
        messaging_product: "whatsapp",
        to,
        type: "image",
        image: {
            link: imageUrl,
            caption
        }
    };

    const headers = {
        Authorization: `Bearer ${metaConfig.whatsapp.accessToken}`,
        "Content-Type": "application/json"
    };

    try {

        console.log("🖼️ Sending image to:", to);
        const response = await axios.post(url, data, { headers });

        console.log("✅ WhatsApp Image Sent:", response.data);

        return response.data;

    } catch (error) {

        console.log(
            "❌ META IMAGE SEND ERROR:",
            JSON.stringify(error.response?.data, null, 2)
        );

        throw error;
    }
};

module.exports = {
    sendMessage,
    sendImageMessage
};