const jwt = require('jsonwebtoken');

/**
 * Predefined accounts supporting the 3 required application roles
 * (Customer, Fleet Manager, Admin) for ITUE301 practical examination
 */
const SEED_USERS = [
  {
    id: 'usr_cust_001',
    name: 'Rahul Sharma (Customer)',
    email: 'customer@driveeasy.com',
    password: 'customer123',
    role: 'customer'
  },
  {
    id: 'usr_mgr_002',
    name: 'Priya Patel (Fleet Manager)',
    email: 'manager@driveeasy.com',
    password: 'manager123',
    role: 'fleet_manager'
  },
  {
    id: 'usr_adm_003',
    name: 'System Administrator',
    email: 'admin@driveeasy.com',
    password: 'admin123',
    role: 'admin'
  }
];

/**
 * @desc    Authenticate customer/admin & generate JWT token
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
const login = async (req, res) => {
  const { email, password } = req.body;

  // Validate required fields
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Please provide both email address and password.'
    });
  }

  // Look up registered user
  const user = SEED_USERS.find(
    (u) => u.email.toLowerCase() === email.trim().toLowerCase()
  );

  // Strictly verify credentials (never accept arbitrary passwords)
  if (!user || user.password !== password) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials: Email or password does not match our records.'
    });
  }

  // Generate genuine JWT token signed with secret
  const secret = process.env.JWT_SECRET || 'driveeasy_super_secret_jwt_key_cspit_charusat';
  const tokenPayload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  };

  const token = jwt.sign(tokenPayload, secret, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });

  // Return authenticated customer identity and token
  res.status(200).json({
    success: true,
    message: `Authentication successful. Welcome, ${user.name}!`,
    data: {
      customer: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    }
  });
};

/**
 * @desc    Get current authenticated user profile
 * @route   GET /api/v1/auth/me
 * @access  Private (Bearer token required)
 */
const getMe = async (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      customer: req.customer
    }
  });
};

module.exports = {
  login,
  getMe,
  SEED_USERS
};
