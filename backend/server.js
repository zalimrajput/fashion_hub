const dotenv = require("dotenv");

// Load environment variables FIRST
dotenv.config();

const express = require("express");
const path = require("path");
const cors = require("cors");
const connectDB = require("./config/db");

const productRoutes = require("./routes/productRoutes");
const customerRoutes = require("./routes/customerRoutes");
const orderRoutes = require("./routes/orderRoutes");
const conversationRoutes = require("./routes/conversationRoutes");
const aiTrainingRoutes = require("./routes/aiTrainingRoutes");
const settingsRoutes = require("./routes/settingsRoutes");
const adminRoutes = require("./routes/adminRoutes");
const whatsappRoutes = require("./routes/whatsappRoutes");
const instagramRoutes = require("./routes/instagramRoutes");
const customerChannelRoutes =require("./routes/customerChannelRoutes");
const customerAuthRoutes = require("./routes/customerAuthRoutes");
const chatRoutes = require("./routes/chatRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
// Database connection
connectDB();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
    "/uploads",
    express.static(
        path.join(__dirname, "uploads")
    )
);

// Routes
app.use("/api/products", productRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/training", aiTrainingRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/customer-channel",customerChannelRoutes);

app.use("/api/customer-auth", customerAuthRoutes);
app.use("/api", chatRoutes);
app.use("/api/dashboard", dashboardRoutes);

// WhatsApp webhook routes
app.use("/api/whatsapp", whatsappRoutes);

// Instagram webhook routes
app.use("/api/instagram", instagramRoutes);


// Test route
app.get("/", (req, res) => {
    res.send("AI Sales Assistant Backend Running...");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});