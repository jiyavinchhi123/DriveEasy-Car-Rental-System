const express = require('express');
const router = express.Router();
const healthRoutes = require('./healthRoutes');
const authRoutes = require('./authRoutes');
const vehicleRoutes = require('./vehicleRoutes');
const bookingRoutes = require('./bookingRoutes');

/**
 * API v1 Central Router
 * 
 * Modular Endpoints:
 * 1. Health Monitoring: /api/v1/health (Public)
 * 2. Authentication:    /api/v1/auth (Public POST /login, Protected GET /me)
 * 3. Vehicles Fleet:    /api/v1/vehicles (Public GET)
 * 4. Bookings Engine:   /api/v1/bookings (Protected by authGuard)
 */

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/vehicles', vehicleRoutes);
router.use('/bookings', bookingRoutes);

// Root API v1 info index
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to DriveEasy Car Rental System REST API v1',
    stage: 'Stage 4 - Express Backend API & Controller Architecture',
    endpoints: {
      auth: {
        login: 'POST /api/v1/auth/login (Public)'
      },
      vehicles: {
        list: 'GET /api/v1/vehicles (Public, supports ?type=SUV)',
        single: 'GET /api/v1/vehicles/:id (Public)'
      },
      bookings: {
        create: 'POST /api/v1/bookings (Protected by authGuard)',
        myBookings: 'GET /api/v1/bookings/my (Protected by authGuard)',
        updateStatus: 'PATCH /api/v1/bookings/:id/status (Protected by authGuard & RBAC)'
      },
      health: 'GET /api/v1/health (Public)'
    }
  });
});

module.exports = router;
