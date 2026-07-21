const Product = require("../models/Product");
const Customer = require("../models/Customer");
const Order = require("../models/Order");
const Conversation = require("../models/Conversation");

const toCsv = (rows) => {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const escape = (value) => {
    const str = value === null || value === undefined ? "" : String(value);
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  return [
    headers.join(","),
    ...rows.map((row) => headers.map((h) => escape(row[h])).join(",")),
  ].join("\n");
};

const exportProducts = async (req, res) => {
  try {
    const products = await Product.find().lean();
    const rows = products.map((p) => ({
      id: p._id,
      productName: p.productName,
      category: p.category,
      price: p.price,
      discount: p.discount,
      stock: p.stock,
      gender: p.gender,
      season: p.season,
      sizes: (p.sizes || []).join("|"),
      colors: (p.colors || []).join("|"),
      status: p.status,
      createdAt: p.createdAt,
    }));

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=products.csv");
    res.status(200).send(toCsv(rows));
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const exportCustomers = async (req, res) => {
  try {
    const customers = await Customer.find().lean();
    const rows = customers.map((c) => ({
      id: c._id,
      name: c.name,
      phoneNumber: c.phoneNumber,
      whatsappNumber: c.whatsappNumber,
      instagramId: c.instagramId,
      email: c.email,
      city: c.city,
      address: c.address,
      orders: (c.orderHistory || []).length,
      createdAt: c.createdAt,
    }));

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=customers.csv");
    res.status(200).send(toCsv(rows));
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const exportOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate("customer", "name phoneNumber").lean();
    const rows = orders.map((o) => ({
      orderId: o.orderId,
      customer: o.customer?.name || "",
      phone: o.customer?.phoneNumber || "",
      status: o.status,
      paymentStatus: o.paymentStatus,
      grandTotal: o.grandTotal,
      city: o.city,
      trackingNumber: o.trackingNumber,
      createdAt: o.createdAt,
    }));

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=orders.csv");
    res.status(200).send(toCsv(rows));
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const exportConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find()
      .populate("customer", "name phoneNumber")
      .lean();

    const rows = conversations.map((c) => ({
      id: c._id,
      customer: c.customer?.name || "",
      phone: c.customer?.phoneNumber || "",
      platform: c.platform,
      lastMessage: c.lastMessage,
      intent: c.intent,
      sentiment: c.sentiment,
      isResolved: c.isResolved,
      messageCount: (c.messages || []).length,
      updatedAt: c.updatedAt,
    }));

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=conversations.csv"
    );
    res.status(200).send(toCsv(rows));
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  exportProducts,
  exportCustomers,
  exportOrders,
  exportConversations,
};
