const express = require('express');
const router = express.Router();
const healthRoutes = require('./healthRoutes');
const authRoutes = require('./authRoutes');

/**
 * API v1 Central Router
 * Mounts modular sub-routers for DriveEasy Car Rental System
 */

// Health monitoring endpoint (/api/v1/health)
router.use('/health', healthRoutes);

// Authentication endpoints (/api/v1/auth)
router.use('/auth', authRoutes);

// Root API v1 info endpoint
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to DriveEasy Car Rental System API v1',
    stage: 'Stage 3 - Routing, Auth State & Role Guards',
    endpoints: {
      health: '/api/v1/health',
      auth: {
        login: 'POST /api/v1/auth/login',
        me: 'GET /api/v1/auth/me (Protected)'
      },
      cars: '/api/v1/cars (Stage 4)',
      rentals: '/api/v1/rentals (Stage 5)'
    }
  });
});

module.exports = router;
