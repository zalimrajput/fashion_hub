const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8000";

const getAIReply = async (sessionId, message) => {

  console.log("Calling AI Service...");
  console.log("URL:", `${AI_SERVICE_URL}/chat`);

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

  console.log("Status:", response.status);

  if (!response.ok) {
    const text = await response.text();

    console.log("AI Error:", text);

    throw new Error(`AI service error (${response.status}): ${text}`);
  }

  const data = await response.json();

  console.log("AI Response:", data);

  return data.reply;
};

module.exports = {
  getAIReply,
};