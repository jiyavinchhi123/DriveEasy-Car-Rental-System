const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * Customer / User Schema
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
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters']
    },
    role: {
      type: String,
      enum: {
        values: ['customer', 'fleet_manager', 'admin'],
        message: '{VALUE} is not a supported application role'
      },
      default: 'customer'
    },
    phone: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

/**
 * Pre-save middleware to hash password with bcrypt if modified
 */
customerSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

/**
 * Instance method to compare submitted password against stored bcrypt hash
 */
customerSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Customer', customerSchema);
