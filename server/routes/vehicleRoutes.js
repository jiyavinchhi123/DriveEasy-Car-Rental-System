const express = require('express');
const router = express.Router();
const { getVehicles, getVehicleById } = require('../controllers/vehicleController');

/**
 * Public Vehicle Routes
 * GET /api/v1/vehicles
 * GET /api/v1/vehicles/:id
 */
router.get('/', getVehicles);
router.get('/:id', getVehicleById);

module.exports = router;
