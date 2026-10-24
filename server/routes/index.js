const express = require('express');
const router = express.Router();
const healthRoutes = require('./healthRoutes');

/**
 * API v1 Central Router
 * Mounts modular sub-routers for DriveEasy Car Rental System
 */

// Health monitoring endpoint (/api/v1/health)
router.use('/health', healthRoutes);

// Root API v1 info endpoint
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to DriveEasy Car Rental System API v1',
    stage: 'Stage 1 - Foundation & Starter Shell',
    endpoints: {
      health: '/api/v1/health',
      auth: '/api/v1/auth (Coming in Stage 2)',
      cars: '/api/v1/cars (Coming in Stage 3)',
      rentals: '/api/v1/rentals (Coming in Stage 4)'
    }
  });
});

module.exports = router;
