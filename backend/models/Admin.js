const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
      // Allow the required demo password `12345` (5 chars).
      minlength: 5,
    },

    role: {
      type: String,
      enum: ["Super Admin", "Admin", "Manager"],
      default: "Admin",
    },

    profileImage: {
      type: String,
      default: "",
    },

    phoneNumber: {
      type: String,
      default: "",
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    lastLogin: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Admin", adminSchema);