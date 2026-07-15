const Setting = require("../models/Setting");

// Create Settings
const createSetting = async (req, res) => {
  try {
    const existingSetting = await Setting.findOne();

    if (existingSetting) {
      return res.status(400).json({
        success: false,
        message: "Settings already exist. Please update instead.",
      });
    }

    const setting = await Setting.create(req.body);

    res.status(201).json({
      success: true,
      message: "Settings created successfully",
      data: setting,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Settings
const getSetting = async (req, res) => {
  try {
    const setting = await Setting.findOne();

    res.status(200).json({
      success: true,
      data: setting,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update Settings
const updateSetting = async (req, res) => {
  try {
    const setting = await Setting.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!setting) {
      return res.status(404).json({
        success: false,
        message: "Settings not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Settings updated successfully",
      data: setting,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete Settings
const deleteSetting = async (req, res) => {
  try {
    const setting = await Setting.findByIdAndDelete(req.params.id);

    if (!setting) {
      return res.status(404).json({
        success: false,
        message: "Settings not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Settings deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createSetting,
  getSetting,
  updateSetting,
  deleteSetting,
};