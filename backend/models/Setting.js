const mongoose = require("mongoose");

const settingSchema = new mongoose.Schema(
  {
    // ==============================
    // Store Information
    // ==============================

    storeName: {
      type: String,
      default: "FashionHub",
      trim: true,
    },

    storeCity: {
      type: String,
      default: "Rawalpindi",
      trim: true,
    },

    storeProvince: {
      type: String,
      default: "Punjab",
      trim: true,
    },

    currency: {
      type: String,
      default: "PKR",
    },

    // ==============================
    // Contact Information
    // ==============================

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

    // ==============================
    // Delivery Settings
    // ==============================

    sameCityCharge: {
      type: Number,
      default: 150,
      min: 0,
    },

    sameProvinceCharge: {
      type: Number,
      default: 250,
      min: 0,
    },

    otherProvinceCharge: {
      type: Number,
      default: 350,
      min: 0,
    },

    freeDeliveryAbove: {
      type: Number,
      default: 10000,
      min: 0,
    },

    sameDayDelivery: {
      type: Boolean,
      default: false,
    },

    deliveryTime: {
      type: String,
      default: "3-5 Working Days",
    },

    // ==============================
    // Store Policies
    // ==============================

    returnPolicy: {
      type: String,
      default: "Returns accepted within 7 days.",
    },

    exchangePolicy: {
      type: String,
      default: "Exchange available within 7 days.",
    },

    // ==============================
    // Business Hours
    // ==============================

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