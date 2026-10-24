const mongoose = require('mongoose');
const { Booking, Vehicle } = require('../models');

/**
 * @desc    Create a new vehicle booking with date overlap prevention & Mongoose transaction
 * @route   POST /api/v1/bookings
 * @access  Private (authGuard)
 */
const createNewBooking = async (req, res, next) => {
  try {
    const { vehicleId, pickupDate, returnDate } = req.body;

    // 1. Validate request parameters
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

    // 3. Schema & business rule: returnDate must be later than pickupDate
    if (end <= start) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed: returnDate must be later than pickupDate.'
      });
    }

    // 4. Find requested vehicle in MongoDB
    const vehicle = await Vehicle.findById(vehicleId);

    if (!vehicle) {
      return res.status(400).json({
        success: false,
        message: `Vehicle with ID '${vehicleId}' does not exist.`
      });
    }

    // 5. Check vehicle availability flag
    if (!vehicle.available) {
      return res.status(400).json({
        success: false,
        message: `Vehicle '${vehicle.model}' is currently marked unavailable for rental.`
      });
    }

    // 6. Check date overlap against existing active bookings for the same vehicle
    // Overlap condition: (existingPickup < newReturn) && (existingReturn > newPickup)
    const activeStatuses = ['reserved', 'ongoing'];
    const overlappingBooking = await Booking.findOne({
      vehicleId: vehicle._id,
      status: { $in: activeStatuses },
      pickupDate: { $lt: end },
      returnDate: { $gt: start }
    });

    if (overlappingBooking) {
      return res.status(400).json({
        success: false,
        message: `Vehicle '${vehicle.model}' is already booked for the selected date range (${overlappingBooking.pickupDate.toISOString().split('T')[0]} to ${overlappingBooking.returnDate.toISOString().split('T')[0]}). Please choose different dates.`
      });
    }

    // 7. Calculate rental duration and total cost
    const diffTime = end.getTime() - start.getTime();
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const totalPrice = days * vehicle.pricePerDay;

    // Security Rule: Customer identity derived strictly from verified JWT token
    const customerId = req.user.id;

    // 8. Execute booking creation and vehicle availability update via Transaction
    let createdBooking = null;
    let session = null;

    try {
      session = await mongoose.startSession();
      session.startTransaction();

      const [newBooking] = await Booking.create(
        [
          {
            customerId,
            vehicleId: vehicle._id,
            pickupDate: start,
            returnDate: end,
            totalPrice,
            status: 'reserved'
          }
        ],
        { session }
      );

      // Update vehicle available field to false
      await Vehicle.findByIdAndUpdate(
        vehicle._id,
        { available: false },
        { session }
      );

      await session.commitTransaction();
      createdBooking = newBooking;
    } catch (txError) {
      if (session) {
        await session.abortTransaction();
      }

      // If transactions are not supported by the MongoDB standalone topology,
      // execute safe two-phase write with compensation rollback
      console.warn(`[Transaction Notice] Multi-document transaction unavailable (${txError.message}). Using safe compensation write.`);

      const fallbackBooking = await Booking.create({
        customerId,
        vehicleId: vehicle._id,
        pickupDate: start,
        returnDate: end,
        totalPrice,
        status: 'reserved'
      });

      try {
        await Vehicle.findByIdAndUpdate(vehicle._id, { available: false });
        createdBooking = fallbackBooking;
      } catch (vehUpdateErr) {
        // Rollback created booking so we never report success when vehicle update fails
        await Booking.findByIdAndDelete(fallbackBooking._id);
        throw new Error(`Failed to update vehicle availability. Booking was rolled back: ${vehUpdateErr.message}`);
      }
    } finally {
      if (session) {
        session.endSession();
      }
    }

    // 9. Return HTTP 201 Created
    res.status(201).json({
      success: true,
      message: 'Booking successfully created and vehicle reserved.',
      data: createdBooking
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
    const customerId = req.user.id;

    // Populate customerId with name & email; vehicleId with model & type
    const bookings = await Booking.find({ customerId })
      .populate('customerId', 'name email')
      .populate('vehicleId', 'model type')
      .sort({ createdAt: -1 });

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
 * @desc    Update booking status with role-based permissions & vehicle release logic
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

    // 2. Find booking record in MongoDB
    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: `Booking with ID '${id}' was not found.`
      });
    }

    // 3. Enforce Role-Based Permissions
    const userRole = req.user.role || 'customer';
    const isOwner = booking.customerId.toString() === req.user.id.toString();

    // Customer role restrictions: can ONLY cancel their OWN booking
    if (userRole === 'customer') {
      if (!isOwner) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: You cannot modify reservations belonging to another customer.'
        });
      }

      if (normalizedStatus !== 'cancelled') {
        return res.status(403).json({
          success: false,
          message: "Forbidden: Customers may only cancel their own reservations ('cancelled'). Administrative status changes ('ongoing', 'completed') require Fleet Manager or Administrator permissions."
        });
      }
    }

    // 4. Update the booking status
    booking.status = normalizedStatus;
    await booking.save();

    // 5. Intelligent Vehicle Availability Management
    // When a booking is cancelled or completed, restore vehicle availability
    // ONLY IF there are no other active bookings currently requiring it!
    if (normalizedStatus === 'cancelled' || normalizedStatus === 'completed') {
      const activeBookingsCount = await Booking.countDocuments({
        vehicleId: booking.vehicleId,
        _id: { $ne: booking._id },
        status: { $in: ['reserved', 'ongoing'] }
      });

      if (activeBookingsCount === 0) {
        await Vehicle.findByIdAndUpdate(booking.vehicleId, { available: true });
      }
    }

    // Return populated updated booking
    const updatedPopulated = await Booking.findById(booking._id)
      .populate('customerId', 'name email')
      .populate('vehicleId', 'model type');

    res.status(200).json({
      success: true,
      message: `Booking #${id} status updated to '${normalizedStatus}'.`,
      data: updatedPopulated
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
