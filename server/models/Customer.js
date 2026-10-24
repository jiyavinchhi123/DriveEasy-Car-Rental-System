const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * Customer Mongoose Model
 * Represents registered users, customers, fleet managers, and administrators.
 */
const customerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Customer email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email address']
    },
    phone: {
      type: String,
      required: [true, 'Contact phone number is required'],
      trim: true
    },
    licenseNumber: {
      type: String,
      required: [true, 'Driving license number is required'],
      unique: true,
      trim: true,
      uppercase: true
    },
    passwordHash: {
      type: String,
      required: [true, 'Password hash is required'],
      select: false // Excluded from ordinary query results by default
    },
    role: {
      type: String,
      enum: {
        values: ['customer', 'fleetManager', 'fleet_manager', 'admin'],
        message: '{VALUE} is not a supported role'
      },
      default: 'customer'
    }
  },
  {
    timestamps: true
  }
);

/**
 * Compare submitted plaintext password with stored bcrypt passwordHash
 * 
 * @param {string} candidatePassword
 * @returns {Promise<boolean>}
 */
customerSchema.methods.matchPassword = async function (candidatePassword) {
  if (!this.passwordHash) {
    throw new Error('passwordHash field must be selected to perform password verification');
  }
  return await bcrypt.compare(candidatePassword, this.passwordHash);
};

module.exports = mongoose.model('Customer', customerSchema);
