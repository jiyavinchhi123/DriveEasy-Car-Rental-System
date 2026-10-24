const mongoose = require('mongoose');

/**
 * Booking Mongoose Model
 * Represents a vehicle rental booking reservation.
 */
const bookingSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: [true, 'customerId is required']
    },
    vehicleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: [true, 'vehicleId is required']
    },
    pickupDate: {
      type: Date,
      required: [true, 'pickupDate is required']
    },
    returnDate: {
      type: Date,
      required: [true, 'returnDate is required'],
      validate: {
        validator: function (value) {
          // Schema-level validation: returnDate must be later than pickupDate
          if (!this.pickupDate || !value) return true;
          return new Date(value).getTime() > new Date(this.pickupDate).getTime();
        },
        message: 'returnDate must be strictly later than pickupDate'
      }
    },
    totalPrice: {
      type: Number,
      min: [0, 'Total price cannot be negative']
    },
    status: {
      type: String,
      enum: {
        values: ['reserved', 'ongoing', 'completed', 'cancelled'],
        message: '{VALUE} is not a supported booking status'
      },
      default: 'reserved'
    }
  },
  {
    timestamps: true
  }
);

// Ensure index on vehicleId and date range for efficient overlap queries
bookingSchema.index({ vehicleId: 1, status: 1, pickupDate: 1, returnDate: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
