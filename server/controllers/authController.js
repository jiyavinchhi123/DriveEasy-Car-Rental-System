const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { findCustomerByEmail } = require('../services/dataService');

/**
 * @desc    Authenticate customer and issue signed JWT token
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 1. Validate submitted request data
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request: Email and password are both required.'
      });
    }

    if (typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Invalid request data types provided for email or password.'
      });
    }

    // 2. Query real Customer record
    const customer = await findCustomerByEmail(email);

    if (!customer) {
      return res.status(401).json({
        success: false,
        message: 'Authentication failed: Invalid email or password.'
      });
    }

    // 3. Authenticate against securely stored bcrypt password hash
    const isPasswordValid = await bcrypt.compare(password, customer.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Authentication failed: Invalid email or password.'
      });
    }

    // 4. Generate signed JWT token
    const secret = process.env.JWT_SECRET || 'driveeasy_super_secret_jwt_key_cspit_charusat';
    const customerId = customer._id ? customer._id.toString() : customer.id;

    const tokenPayload = {
      id: customerId,
      name: customer.name,
      email: customer.email,
      role: customer.role
    };

    const token = jwt.sign(tokenPayload, secret, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    });

    // 5. Return safe customer details (Never return the password or password hash)
    res.status(200).json({
      success: true,
      message: `Authentication successful. Welcome, ${customer.name}!`,
      data: {
        customer: {
          id: customerId,
          name: customer.name,
          email: customer.email,
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
 * @desc    Get currently authenticated customer profile
 * @route   GET /api/v1/auth/me
 * @access  Private (authGuard)
 */
const getMe = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      data: {
        customer: req.user
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
