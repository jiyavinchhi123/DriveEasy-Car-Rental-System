const jwt = require('jsonwebtoken');

/**
 * Authentication Guard Middleware
 * 
 * Requirements:
 * 1. Reads the Authorization header.
 * 2. Requires the Bearer token format.
 * 3. Verifies the JWT using JWT_SECRET.
 * 4. Returns HTTP 401 with structured JSON if token is missing, malformed, expired, or invalid.
 * 5. Attaches verified identity to req.user.
 * 6. Security Rule: Never trust a customerId supplied by request body;
 *    ownership must always be derived from req.user.
 */
const authGuard = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // 1 & 2. Verify Authorization header and Bearer scheme
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Access denied: Authorization token missing or malformed. Required format: Bearer <token>'
    });
  }

  const token = authHeader.split(' ')[1];

  if (!token || token.trim() === '') {
    return res.status(401).json({
      success: false,
      message: 'Access denied: Token string is empty.'
    });
  }

  // 3 & 4. Verify token using JWT_SECRET
  try {
    const secret = process.env.JWT_SECRET || 'driveeasy_super_secret_jwt_key_cspit_charusat';
    const decoded = jwt.verify(token, secret);

    // 5. Attach verified identity to req.user (and alias req.customer)
    req.user = decoded;
    req.customer = decoded;

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Authentication failed: Token has expired. Please log in again.'
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Authentication failed: Invalid or tampered token.'
    });
  }
};

/**
 * Role Authorization Guard Middleware
 * Restricts endpoint execution to specified user roles (e.g. 'admin', 'fleet_manager')
 * 
 * @param  {...string} allowedRoles
 */
const roleGuard = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required before checking permissions.'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access restricted. Your role '${req.user.role}' lacks permission for this action.`
      });
    }

    next();
  };
};

module.exports = {
  authGuard,
  roleGuard
};
