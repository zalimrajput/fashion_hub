const Product = require("../models/Product");
const Customer = require("../models/Customer");
const Order = require("../models/Order");
const Conversation = require("../models/Conversation");

const getDashboardStats = async (req, res) => {
  try {
    const [
      totalProducts,
      totalCustomers,
      totalOrders,
      totalConversations,
      pendingOrders,
      openConversations,
      recentOrders,
      recentConversations,
    ] = await Promise.all([
      Product.countDocuments(),
      Customer.countDocuments(),
      Order.countDocuments(),
      Conversation.countDocuments(),
      Order.countDocuments({ status: "Pending" }),
      Conversation.countDocuments({ isResolved: false }),
      Order.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("customer", "name phoneNumber"),
      Conversation.find()
        .sort({ updatedAt: -1 })
        .limit(5)
        .populate("customer", "name phoneNumber"),
    ]);

    const revenueAgg = await Order.aggregate([
      { $match: { paymentStatus: { $in: ["Paid", "Pending"] } } },
      { $group: { _id: null, total: { $sum: "$grandTotal" } } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalProducts,
        totalCustomers,
        totalOrders,
        totalConversations,
        pendingOrders,
        openConversations,
        revenue: revenueAgg[0]?.total || 0,
        recentOrders,
        recentConversations,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getDashboardStats,
};
