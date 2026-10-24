const express = require('express');
const router = express.Router();
const { authGuard } = require('../middleware/authGuard');
const {
  createNewBooking,
  getMyBookings,
  updateBookingStatusById
} = require('../controllers/bookingController');

/**
 * Booking Routes (All Protected by authGuard)
 * 
 * 1. POST  /api/v1/bookings           - Create booking for authenticated customer
 * 2. GET   /api/v1/bookings/my        - Retrieve authenticated customer's bookings
 * 3. PATCH /api/v1/bookings/:id/status - Update status with role-based restrictions
 */

// Apply authGuard to all booking operations
router.use(authGuard);

router.post('/', createNewBooking);
router.get('/my', getMyBookings);
router.patch('/:id/status', updateBookingStatusById);

module.exports = router;
