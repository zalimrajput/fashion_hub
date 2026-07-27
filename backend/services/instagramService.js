const axios = require("axios");
const metaConfig = require("../config/metaConfig");

const API_VERSION = "v25.0";

const sendMessage = async (to, text) => {

    const url = `https://graph.facebook.com/${API_VERSION}/me/messages`;

    const data = {
        recipient: { id: to },
        message: { text }
    };

    const headers = {
        Authorization: `Bearer ${metaConfig.instagram.accessToken}`,
        "Content-Type": "application/json"
    };

    try {

        console.log("📱 Sending Instagram text to:", to);
        const response = await axios.post(url, data, { headers });

        console.log("✅ Instagram Sent:", response.data);

        return response.data;

    } catch (error) {

        console.log(
            "❌ IG SEND ERROR:",
            JSON.stringify(error.response?.data, null, 2)
        );

        throw error;
    }
};

const sendImageMessage = async (to, imageUrl, caption) => {

    const url = `https://graph.facebook.com/${API_VERSION}/me/messages`;

    const data = {
        recipient: { id: to },
        message: {
            attachment: {
                type: "image",
                payload: { url: imageUrl }
            }
        }
    };

    const headers = {
        Authorization: `Bearer ${metaConfig.instagram.accessToken}`,
        "Content-Type": "application/json"
    };

    try {

        console.log("🖼️ Sending Instagram image to:", to);
        const response = await axios.post(url, data, { headers });

        console.log("✅ Instagram Image Sent:", response.data);

        return response.data;

    } catch (error) {

        console.log(
            "❌ IG IMAGE SEND ERROR:",
            JSON.stringify(error.response?.data, null, 2)
        );

        throw error;
    }
};

module.exports = {
    sendMessage,
    sendImageMessage
};
