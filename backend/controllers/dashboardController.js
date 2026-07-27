const Product = require("../models/Product");
const Customer = require("../models/Customer");
const Order = require("../models/Order");
const Conversation = require("../models/Conversation");
const AITraining = require("../models/AITraining");

const getDashboardStats = async (req, res) => {
  try {
    const [
      productCount,
      customerCount,
      orderCount,
      conversations,
      trainingCount,
      orders
    ] = await Promise.all([
      Product.countDocuments(),
      Customer.countDocuments(),
      Order.countDocuments(),
      Conversation.find(),
      AITraining.countDocuments(),
      Order.find().populate("customer").populate("products.product")
    ]);

    const totalRevenue = orders.reduce((sum, o) => sum + (Number(o.grandTotal) || 0), 0);
    const unresolvedConversations = conversations.filter(c => !c.isResolved).length;

    res.status(200).json({
      success: true,
      data: {
        stats: {
          products: productCount,
          customers: customerCount,
          orders: orderCount,
          orderRevenue: totalRevenue,
          unresolvedConversations,
          trainings: trainingCount
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = { getDashboardStats };
