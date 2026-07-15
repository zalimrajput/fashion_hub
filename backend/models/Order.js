const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    productName: {
      type: String,
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    selectedSize: {
      type: String,
      default: "",
    },

    selectedColor: {
      type: String,
      default: "",
    },

    originalPrice: {
      type: Number,
      required: true,
    },

    discountPercentage: {
      type: Number,
      default: 0,
    },

    discountAmount: {
      type: Number,
      default: 0,
    },

    finalPrice: {
      type: Number,
      required: true,
    },

    subtotal: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },

    products: {
    type: [orderItemSchema],
    required: true,
    validate: {
        validator: function(value) {
            return value.length > 0;
        },
        message: "Order must contain at least one product"
    }
},

    subtotal: {
      type: Number,
      required: true,
      default: 0,
    },

    totalDiscount: {
      type: Number,
      default: 0,
    },

    deliveryCharges: {
      type: Number,
      default: 0,
    },

    grandTotal: {
      type: Number,
      required: true,
      default: 0,
    },

    paymentMethod: {
      type: String,
      enum: [
        "Cash on Delivery",
        "Bank Transfer",
        "Card",
        "JazzCash",
        "EasyPaisa",
      ],
      default: "Cash on Delivery",
    },

    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Failed", "Refunded"],
      default: "Pending",
    },

    status: {
      type: String,
      enum: [
        "Pending",
        "Confirmed",
        "Processing",
        "Shipped",
        "Delivered",
        "Cancelled",
      ],
      default: "Pending",
    },

    trackingNumber: {
      type: String,
      default: "",
    },

    shippingAddress: {
      type: String,
      required: true,
    },

    city: {
    type: String,
    required: true,
    trim: true,
},

province: {
    type: String,
    required: true,
    trim: true,
},

    notes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Order", orderSchema);