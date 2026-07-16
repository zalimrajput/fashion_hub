const { sendMessage } = require("../services/whatsappService");

const receiveMessage = async (req, res) => {
    try {

        const incomingMessage = req.body.Body;
        const from = req.body.From;

        console.log("Message :", incomingMessage);
        console.log("From :", from);

        await sendMessage(
            from,
            "👋 Welcome to FashionHub!\n\nThank you for contacting us."
        );

        res.status(200).send("Message received.");

    } catch (err) {

        console.error(err);

        res.status(500).json({
            success: false,
            message: err.message
        });

    }
};

module.exports = {
    receiveMessage,
};