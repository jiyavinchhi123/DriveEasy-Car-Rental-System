const { Vehicle } = require('../models');

/**
 * @desc    Get all vehicles from MongoDB with optional category type filter
 * @route   GET /api/v1/vehicles
 * @access  Public
 */
const getVehicles = async (req, res, next) => {
  try {
    const { type } = req.query;

    const query = type && type.toLowerCase() !== 'all'
      ? { type: new RegExp(`^${type.trim()}$`, 'i') }
      : {};

    const vehicles = await Vehicle.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: vehicles.length,
      filter: type || 'All',
      data: vehicles
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single vehicle by MongoDB ObjectId
 * @route   GET /api/v1/vehicles/:id
 * @access  Public
 */
const getVehicleById = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: `Vehicle with ID '${req.params.id}' was not found.`
      });
    }

    res.status(200).json({
      success: true,
      data: vehicle
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getVehicles,
  getVehicleById
};
