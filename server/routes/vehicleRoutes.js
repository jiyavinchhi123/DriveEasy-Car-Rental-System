const express = require('express');
const router = express.Router();
const { authGuard, roleGuard } = require('../middleware/authGuard');
const {
  getVehicles,
  getVehicleById,
  toggleVehicleAvailability,
  createVehicle
} = require('../controllers/vehicleController');

/**
 * Vehicle Routes
 * 
 * Public:
 * GET  /api/v1/vehicles          - List all vehicles (supports ?type=SUV)
 * GET  /api/v1/vehicles/:id      - Get single vehicle
 * 
 * Protected (Admin & Fleet Manager):
 * POST  /api/v1/vehicles         - Create new fleet vehicle
 * PATCH /api/v1/vehicles/:id/availability - Toggle availability flag
 */

router.get('/', getVehicles);
router.get('/:id', getVehicleById);

// Admin & Fleet Manager routes
router.post('/', authGuard, roleGuard('admin', 'fleetManager', 'fleet_manager'), createVehicle);
router.patch('/:id/availability', authGuard, roleGuard('admin', 'fleetManager', 'fleet_manager'), toggleVehicleAvailability);

module.exports = router;
