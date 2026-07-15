const mongoose = require("mongoose");

const aiTrainingSchema = new mongoose.Schema(
  {
    intent: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      enum: [
        "Greeting",
        "Product",
        "Price",
        "Size",
        "Color",
        "Delivery",
        "Order",
        "Tracking",
        "Return",
        "Exchange",
        "Complaint",
        "Discount",
        "General",
      ],
      required: true,
    },

    question: {
      type: String,
      required: true,
      trim: true,
    },

    answer: {
      type: String,
      required: true,
      trim: true,
    },

    keywords: [
      {
        type: String,
        trim: true,
      },
    ],

    language: {
      type: String,
      default: "English",
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("AITraining", aiTrainingSchema);