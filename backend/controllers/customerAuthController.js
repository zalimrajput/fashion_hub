const bcrypt = require("bcryptjs");
const Customer = require("../models/Customer");
const generateCustomerToken = require("../utils/generateCustomerToken");

// ==============================
// Register Customer
// ==============================
const registerCustomer = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phoneNumber,
    } = req.body;

    // Validate required fields
    if (!name || !email || !password || !phoneNumber) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    // Check existing customer
    const existingCustomer = await Customer.findOne({ email });

    if (existingCustomer) {
      return res.status(400).json({
        success: false,
        message: "Customer already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create customer
    const customer = await Customer.create({
      name,
      email,
      password: hashedPassword,
      phoneNumber,
    });

    const token = generateCustomerToken(customer._id);

    const customerData = customer.toObject();
    delete customerData.password;

    res.status(201).json({
      success: true,
      message: "Customer registered successfully",
      token,
      data: customerData,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// ==============================
// Login Customer
// ==============================
const loginCustomer = async (req, res) => {

  try {

    const {
      email,
      password,
    } = req.body;

    if (!email || !password) {

      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });

    }

    const customer = await Customer.findOne({
      email,
    }).select("+password");

    if (!customer) {

      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });

    }

    const isMatch = await bcrypt.compare(
      password,
      customer.password
    );

    if (!isMatch) {

      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });

    }

    customer.lastLogin = new Date();

    await customer.save();

    const token = generateCustomerToken(
      customer._id
    );

    const customerData = customer.toObject();

    delete customerData.password;

    res.status(200).json({

      success: true,

      message: "Login successful",

      token,

      data: customerData,

    });

  } catch (error) {

    res.status(500).json({

      success: false,

      message: error.message,

    });

  }

};

// ==============================
// Get Customer Profile
// ==============================
const getProfile = async (req, res) => {

  try {

    const customer = await Customer.findById(
      req.customer.id
    ).select("-password");

    if (!customer) {

      return res.status(404).json({

        success: false,

        message: "Customer not found",

      });

    }

    res.status(200).json({

      success: true,

      data: customer,

    });

  } catch (error) {

    res.status(500).json({

      success: false,

      message: error.message,

    });

  }

};

// ==============================
// Update Customer Profile
// ==============================
const updateProfile = async (req, res) => {

  try {

    delete req.body.password;

    const customer = await Customer.findByIdAndUpdate(

      req.customer.id,

      req.body,

      {

        new: true,

        runValidators: true,

      }

    ).select("-password");

    if (!customer) {

      return res.status(404).json({

        success: false,

        message: "Customer not found",

      });

    }

    res.status(200).json({

      success: true,

      message: "Profile updated successfully",

      data: customer,

    });

  } catch (error) {

    res.status(500).json({

      success: false,

      message: error.message,

    });

  }

};

// ==============================
// Change Password
// ==============================
const changePassword = async (req, res) => {

  try {

    const {

      currentPassword,

      newPassword,

    } = req.body;

    if (!currentPassword || !newPassword) {

      return res.status(400).json({

        success: false,

        message: "Current password and new password are required",

      });

    }

    const customer = await Customer.findById(
      req.customer.id
    ).select("+password");

    if (!customer) {

      return res.status(404).json({

        success: false,

        message: "Customer not found",

      });

    }

    const isMatch = await bcrypt.compare(

      currentPassword,

      customer.password

    );

    if (!isMatch) {

      return res.status(401).json({

        success: false,

        message: "Current password is incorrect",

      });

    }

    customer.password = await bcrypt.hash(
      newPassword,
      10
    );

    await customer.save();

    res.status(200).json({

      success: true,

      message: "Password changed successfully",

    });

  } catch (error) {

    res.status(500).json({

      success: false,

      message: error.message,

    });

  }

};

module.exports = {

  registerCustomer,

  loginCustomer,

  getProfile,

  updateProfile,

  changePassword,

};