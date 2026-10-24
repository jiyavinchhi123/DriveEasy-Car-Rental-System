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

/**
 * @desc    Toggle vehicle availability flag (Admin / Fleet Manager only)
 * @route   PATCH /api/v1/vehicles/:id/availability
 * @access  Private (authGuard + roleGuard)
 */
const toggleVehicleAvailability = async (req, res, next) => {
  try {
    const { id } = req.params;
    const vehicle = await Vehicle.findById(id);

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: `Vehicle with ID '${id}' was not found.`
      });
    }

    vehicle.available = !vehicle.available;
    await vehicle.save();

    res.status(200).json({
      success: true,
      message: `Vehicle '${vehicle.model}' availability updated to ${vehicle.available}.`,
      data: vehicle
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add a new vehicle to the fleet (Admin / Fleet Manager only)
 * @route   POST /api/v1/vehicles
 * @access  Private (authGuard + roleGuard)
 */
const createVehicle = async (req, res, next) => {
  try {
    const { model, type, pricePerDay, registrationNumber, available } = req.body;

    const vehicle = await Vehicle.create({
      model,
      type,
      pricePerDay,
      registrationNumber: registrationNumber || `GJ-06-REG-${Date.now().toString().slice(-4)}`,
      available: available !== undefined ? available : true
    });

    res.status(201).json({
      success: true,
      message: `Vehicle '${vehicle.model}' added to fleet successfully.`,
      data: vehicle
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getVehicles,
  getVehicleById,
  toggleVehicleAvailability,
  createVehicle
};
