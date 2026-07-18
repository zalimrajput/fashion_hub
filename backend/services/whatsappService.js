const getTwilioClient = require("../config/twilioConfig");

const sendMessage = async (to, body) => {
  const client = getTwilioClient();
  return client.messages.create({
    from: process.env.TWILIO_WHATSAPP_NUMBER,
    to,
    body,
  });
};

module.exports = {
  sendMessage,
};
