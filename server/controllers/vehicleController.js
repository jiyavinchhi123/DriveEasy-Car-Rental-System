const { findVehicles, findVehicleById } = require('../services/dataService');

/**
 * @desc    Get all vehicles with optional vehicle type filter
 * @route   GET /api/v1/vehicles
 * @access  Public
 */
const getVehicles = async (req, res, next) => {
  try {
    const { type } = req.query;

    const vehicles = await findVehicles(type);

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
 * @desc    Get single vehicle by ID
 * @route   GET /api/v1/vehicles/:id
 * @access  Public
 */
const getVehicleById = async (req, res, next) => {
  try {
    const vehicle = await findVehicleById(req.params.id);

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
