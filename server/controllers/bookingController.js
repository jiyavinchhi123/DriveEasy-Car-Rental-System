const {
  findVehicleById,
  createBooking,
  findBookingsByCustomer,
  findBookingById,
  updateBookingStatus
} = require('../services/dataService');

/**
 * @desc    Create a new car booking for the authenticated customer
 * @route   POST /api/v1/bookings
 * @access  Private (authGuard)
 */
const createNewBooking = async (req, res, next) => {
  try {
    const { vehicleId, pickupDate, returnDate } = req.body;

    // 1. Validate required fields
    if (!vehicleId || !pickupDate || !returnDate) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request: vehicleId, pickupDate, and returnDate are all required.'
      });
    }

    // 2. Validate date formats
    const start = new Date(pickupDate);
    const end = new Date(returnDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format provided for pickupDate or returnDate.'
      });
    }

    // 3. Reject returnDate earlier than or equal to pickupDate
    if (end <= start) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed: returnDate must be later than pickupDate.'
      });
    }

    // 4. Check vehicle existence and availability
    const vehicle = await findVehicleById(vehicleId);

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: `Vehicle with ID '${vehicleId}' does not exist.`
      });
    }

    if (!vehicle.available) {
      return res.status(400).json({
        success: false,
        message: `Vehicle '${vehicle.model}' is currently unavailable for rental.`
      });
    }

    // 5. Calculate rental duration in days and total price
    const diffTime = end.getTime() - start.getTime();
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const totalPrice = days * vehicle.pricePerDay;

    // Security Rule: Never trust customerId from body; derive strictly from verified token (req.user.id)
    const authenticatedCustomerId = req.user.id;

    const bookingRecord = await createBooking({
      customerId: authenticatedCustomerId,
      vehicleId: vehicle._id || vehicle.id,
      pickupDate: start,
      returnDate: end,
      days,
      totalPrice,
      status: 'reserved'
    });

    res.status(201).json({
      success: true,
      message: 'Booking created successfully.',
      data: bookingRecord
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all bookings belonging to the authenticated customer
 * @route   GET /api/v1/bookings/my
 * @access  Private (authGuard)
 */
const getMyBookings = async (req, res, next) => {
  try {
    // Security: Derive customerId strictly from verified token
    const customerId = req.user.id;

    // Populates customerId with name and email, vehicleId with model and type
    const bookings = await findBookingsByCustomer(customerId);

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update booking status with role-based permission checks
 * @route   PATCH /api/v1/bookings/:id/status
 * @access  Private (authGuard)
 */
const updateBookingStatusById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const ALLOWED_STATUSES = ['reserved', 'ongoing', 'completed', 'cancelled'];

    // 1. Validate requested status
    if (!status || !ALLOWED_STATUSES.includes(status.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: `Invalid status requested. Allowed values: [${ALLOWED_STATUSES.join(', ')}]`
      });
    }

    const normalizedStatus = status.toLowerCase();

    // 2. Find booking record
    const booking = await findBookingById(id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: `Booking with ID '${id}' was not found.`
      });
    }

    // 3. Enforce Role-Based Permissions
    const userRole = req.user.role || 'customer';
    const bookingOwnerId = (booking.customerId?._id || booking.customerId).toString();
    const isOwner = bookingOwnerId === req.user.id.toString();

    // Customers: can ONLY cancel their OWN booking
    if (userRole === 'customer') {
      if (!isOwner) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: You do not have permission to modify bookings belonging to other customers.'
        });
      }

      if (normalizedStatus !== 'cancelled') {
        return res.status(403).json({
          success: false,
          message: "Forbidden: Customers may only cancel their own reservations ('cancelled'). Administrative status changes ('ongoing', 'completed') require Fleet Manager or Admin privileges."
        });
      }
    }

    // 4. Update status
    const updated = await updateBookingStatus(id, normalizedStatus);

    res.status(200).json({
      success: true,
      message: `Booking #${id} status successfully updated to '${normalizedStatus}'.`,
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createNewBooking,
  getMyBookings,
  updateBookingStatusById
};
