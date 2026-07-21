const axios = require("axios");
const { sendMessage } = require("../services/whatsappService");

const receiveMessage = async (req, res) => {
    try {
        const incomingMessage = req.body.Body;
        const from = req.body.From;

        console.log("Message:", incomingMessage);
        console.log("From:", from);

        const aiResponse = await axios.post("http://127.0.0.1:8000/chat", {
            session_id: from,
            message: incomingMessage
        });

        await sendMessage(from, aiResponse.data.reply);

        res.status(200).send("OK");

    } catch (err) {
        console.error(err.response?.data || err.message);
        res.status(500).send("Error");
    }
};

module.exports = {
    receiveMessage,
};