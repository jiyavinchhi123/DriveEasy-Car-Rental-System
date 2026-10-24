const express = require('express');
const router = express.Router();
const { authGuard, roleGuard } = require('../middleware/authGuard');
const {
  createNewBooking,
  getMyBookings,
  updateBookingStatusById,
  getAllBookings
} = require('../controllers/bookingController');

/**
 * Booking Routes (All Protected by authGuard)
 * 
 * 1. POST  /api/v1/bookings           - Create booking for authenticated customer
 * 2. GET   /api/v1/bookings/my        - Retrieve authenticated customer's bookings
 * 3. GET   /api/v1/bookings           - Retrieve all bookings (Admin & Fleet Manager)
 * 4. PATCH /api/v1/bookings/:id/status - Update status with role-based restrictions
 */

// Apply authGuard to all booking operations
router.use(authGuard);

router.post('/', createNewBooking);
router.get('/my', getMyBookings);
router.get('/', roleGuard('admin', 'fleetManager', 'fleet_manager'), getAllBookings);
router.patch('/:id/status', updateBookingStatusById);

module.exports = router;
