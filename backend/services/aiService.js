const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8000";

const getAIReply = async (sessionId, message) => {
  const response = await fetch(`${AI_SERVICE_URL}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      session_id: sessionId,
      message,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`AI service error (${response.status}): ${text}`);
  }

  const data = await response.json();
  return data.reply || "Sorry, I could not process that right now. Please try again.";
};

module.exports = {
  getAIReply,
};
