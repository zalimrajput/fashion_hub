const mongoose = require("mongoose");

const settingSchema = new mongoose.Schema(
  {
    storeName: {
      type: String,
      default: "FashionHub",
      trim: true,
    },

    supportEmail: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
    },

    supportPhone: {
      type: String,
      default: "",
      trim: true,
    },

    whatsappNumber: {
      type: String,
      default: "",
      trim: true,
    },

    instagramUsername: {
      type: String,
      default: "",
      trim: true,
    },

    facebookPage: {
      type: String,
      default: "",
      trim: true,
    },

    currency: {
      type: String,
      default: "PKR",
    },

    deliveryCharges: {
      type: Number,
      default: 250,
    },

    sameDayDelivery: {
      type: Boolean,
      default: false,
    },

    deliveryTime: {
      type: String,
      default: "3-5 Working Days",
    },

    returnPolicy: {
      type: String,
      default: "Returns accepted within 7 days.",
    },

    exchangePolicy: {
      type: String,
      default: "Exchange available within 7 days.",
    },

    businessHours: {
      type: String,
      default: "Monday - Saturday (9:00 AM - 8:00 PM)",
    },

    isStoreOpen: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Setting", settingSchema);