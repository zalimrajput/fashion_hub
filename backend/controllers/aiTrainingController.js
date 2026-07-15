const AITraining = require("../models/AITraining");

// Create Training Data
const createTraining = async (req, res) => {
  try {
    const training = await AITraining.create(req.body);

    res.status(201).json({
      success: true,
      message: "Training data created successfully",
      data: training,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get All Training Data
const getTrainings = async (req, res) => {
  try {
    const trainings = await AITraining.find();

    res.status(200).json({
      success: true,
      count: trainings.length,
      data: trainings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Training By ID
const getTrainingById = async (req, res) => {
  try {
    const training = await AITraining.findById(req.params.id);

    if (!training) {
      return res.status(404).json({
        success: false,
        message: "Training data not found",
      });
    }

    res.status(200).json({
      success: true,
      data: training,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update Training
const updateTraining = async (req, res) => {
  try {
    const training = await AITraining.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!training) {
      return res.status(404).json({
        success: false,
        message: "Training data not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Training data updated successfully",
      data: training,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete Training
const deleteTraining = async (req, res) => {
  try {
    const training = await AITraining.findByIdAndDelete(req.params.id);

    if (!training) {
      return res.status(404).json({
        success: false,
        message: "Training data not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Training data deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createTraining,
  getTrainings,
  getTrainingById,
  updateTraining,
  deleteTraining,
};