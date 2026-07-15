const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    phoneNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    instagramId: {
      type: String,
      default: "",
      trim: true,
    },

    whatsappNumber: {
      type: String,
      default: "",
      trim: true,
    },

    email: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
    },

    address: {
      type: String,
      default: "",
    },

    city: {
      type: String,
      default: "",
    },

    preferences: {
      favoriteCategory: {
        type: String,
        default: "",
      },

      favoriteColor: {
        type: String,
        default: "",
      },

      favoriteSize: {
        type: String,
        default: "",
      },

      budget: {
        type: Number,
        default: 0,
      },

      gender: {
        type: String,
        enum: ["Men", "Women", "Unisex", ""],
        default: "",
      },
    },

    orderHistory: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Customer", customerSchema);