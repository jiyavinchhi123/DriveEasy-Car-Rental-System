const mongoose = require('mongoose');

/**
 * Vehicle Schema
 */
const vehicleSchema = new mongoose.Schema(
  {
    model: {
      type: String,
      required: [true, 'Vehicle model name is required'],
      trim: true
    },
    type: {
      type: String,
      required: [true, 'Vehicle category type is required'],
      enum: {
        values: ['Hatchback', 'Sedan', 'SUV'],
        message: '{VALUE} is not a supported vehicle category'
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
      required: [true, 'Vehicle registration number is required'],
      unique: true,
      trim: true,
      uppercase: true
    },
    fuelType: {
      type: String,
      enum: ['Petrol', 'Diesel', 'Electric', 'Hybrid'],
      default: 'Petrol'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Vehicle', vehicleSchema);
