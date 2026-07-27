const bcrypt = require("bcryptjs");
const Admin = require("../models/Admin");
const generateToken = require("../utils/generateToken");

// Register Admin
const registerAdmin = async (req, res) => {
  try {
    const { fullName, email, password, role, phoneNumber } = req.body;

    // Check existing admin
    const existingAdmin = await Admin.findOne({ email });

    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: "Admin already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin
    const admin = await Admin.create({
      fullName,
      email,
      password: hashedPassword,
      role,
      phoneNumber,
    });

    res.status(201).json({
      success: true,
      message: "Admin registered successfully",
      token: generateToken(admin._id),
      data: admin,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Login Admin
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Password is required",
      });
    }

    const adminEmail = email || process.env.ADMIN_EMAIL || "admin@fashionhub.local";

    let admin = await Admin.findOne({ email: adminEmail });

    // If no admin exists yet, allow the default password to bootstrap the first admin.
    if (!admin) {
      if (String(password) !== "12345") {
        return res.status(401).json({
          success: false,
          message: "Invalid password",
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      admin = await Admin.create({
        fullName: "Default Admin",
        email: adminEmail,
        password: hashedPassword,
        role: "Admin",
        phoneNumber: "",
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(String(password), admin.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid password",
      });
    }

    // Update last login
    admin.lastLogin = new Date();
    await admin.save();

    res.status(200).json({
      success: true,
      message: "Login successful",
      token: generateToken(admin._id),
      data: admin,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Admin Profile
const getProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.id).select("-password");

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    res.status(200).json({
      success: true,
      data: admin,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update Admin Profile
const updateProfile = async (req, res) => {
  try {
    const admin = await Admin.findByIdAndUpdate(
      req.admin.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    ).select("-password");

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: admin,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  registerAdmin,
  loginAdmin,
  getProfile,
  updateProfile,
};