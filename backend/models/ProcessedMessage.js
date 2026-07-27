const mongoose = require("mongoose");

const processedMessageSchema = new mongoose.Schema(
  {
    messageId: {
      type: String,
      required: true,
      unique: true,
    },
    platform: {
      type: String,
      enum: ["WhatsApp", "Instagram"],
      required: true,
    },
    processedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
  }
);

module.exports = mongoose.model("ProcessedMessage", processedMessageSchema);
