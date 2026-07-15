const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: String,
      enum: ["Customer", "AI", "Admin"],
      required: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },

    messageType: {
      type: String,
      enum: ["Text", "Image", "Video", "Document"],
      default: "Text",
    },

    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const conversationSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },

    platform: {
      type: String,
      enum: ["Instagram", "WhatsApp"],
      required: true,
    },

    messages: [messageSchema],

    lastMessage: {
      type: String,
      default: "",
    },

    intent: {
      type: String,
      default: "",
    },

    sentiment: {
      type: String,
      enum: [
        "Happy",
        "Interested",
        "Neutral",
        "Frustrated",
        "Angry",
      ],
      default: "Neutral",
    },

    isResolved: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Conversation", conversationSchema);