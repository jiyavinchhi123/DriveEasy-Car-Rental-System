const jwt = require('jsonwebtoken');
const { Customer } = require('../models');

/**
 * @desc    Authenticate customer against Mongoose Customer record & passwordHash
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 1. Validate request data
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request: Both email and password are required.'
      });
    }

    if (typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Invalid data types provided for email or password.'
      });
    }

    // 2. Query real Customer record (explicitly select passwordHash as it is excluded by default)
    const customer = await Customer.findOne({
      email: email.toLowerCase().trim()
    }).select('+passwordHash');

    if (!customer) {
      return res.status(401).json({
        success: false,
        message: 'Authentication failed: Invalid email or password.'
      });
    }

    // 3. Compare submitted password against securely stored bcrypt passwordHash
    const isMatch = await customer.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Authentication failed: Invalid email or password.'
      });
    }

    // 4. Generate signed JWT token
    const secret = process.env.JWT_SECRET || 'driveeasy_super_secret_jwt_key_cspit_charusat';
    const customerId = customer._id.toString();

    const tokenPayload = {
      id: customerId,
      name: customer.name,
      email: customer.email,
      role: customer.role
    };

    const token = jwt.sign(tokenPayload, secret, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    });

    // 5. Return safe customer details (Never return the passwordHash)
    res.status(200).json({
      success: true,
      message: `Authentication successful. Welcome, ${customer.name}!`,
      data: {
        customer: {
          id: customerId,
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          licenseNumber: customer.licenseNumber,
          role: customer.role
        },
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current authenticated customer profile from MongoDB
 * @route   GET /api/v1/auth/me
 * @access  Private (authGuard)
 */
const getMe = async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.user.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer record was not found.'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        customer: {
          id: customer._id,
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          licenseNumber: customer.licenseNumber,
          role: customer.role
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
  getMe
};
