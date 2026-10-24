const mongoose = require('mongoose');

/**
 * Vehicle Mongoose Model
 * Represents rental fleet vehicles.
 */
const vehicleSchema = new mongoose.Schema(
  {
    model: {
      type: String,
      required: [true, 'Vehicle model is required'],
      trim: true
    },
    type: {
      type: String,
      required: [true, 'Vehicle type category is required'],
      enum: {
        values: ['Hatchback', 'Sedan', 'SUV'],
        message: '{VALUE} is not a valid vehicle type (allowed: Hatchback, Sedan, SUV)'
      },
      trim: true
    },
    pricePerDay: {
      type: Number,
      required: [true, 'Daily rental price is required'],
      min: [0, 'Daily rental price cannot be negative']
    },
    available: {
      type: Boolean,
      default: true
    },
    registrationNumber: {
      type: String,
      trim: true,
      uppercase: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Vehicle', vehicleSchema);
