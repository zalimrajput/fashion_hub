const twilio = require("twilio");

let client = null;

const getTwilioClient = () => {
  if (client) return client;

  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;

  if (!sid || !token) {
    throw new Error(
      "Twilio credentials missing. Set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN."
    );
  }

  client = twilio(sid, token);
  return client;
};

module.exports = getTwilioClient;
