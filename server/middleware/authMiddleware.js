const jwt = require('jsonwebtoken');

/**
 * Bearer Token Authentication Middleware
 * Validates JSON Web Tokens (JWT) supplied in Authorization header
 * Header format expected: Authorization: Bearer <jwt_token>
 */
const verifyToken = (req, res, next) => {
  let token = null;
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No authorization token was provided.'
    });
  }

  try {
    const secret = process.env.JWT_SECRET || 'driveeasy_super_secret_jwt_key_cspit_charusat';
    const decoded = jwt.verify(token, secret);
    
    // Attach decoded customer payload to request object
    req.customer = decoded;
    req.user = decoded; // alias for compatibility
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token. Please log in again.'
    });
  }
};

/**
 * Role-Based Authorization Guard Middleware
 * Enforces role restrictions at the backend API level.
 * 
 * @param  {...string} allowedRoles - Array of authorized roles, e.g. ('admin', 'fleet_manager')
 */
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    const currentRole = req.customer?.role || req.user?.role;

    if (!currentRole) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: User identity could not be verified.'
      });
    }

    if (!allowedRoles.includes(currentRole)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access restricted. Requires one of roles: [${allowedRoles.join(', ')}]. Current role: '${currentRole}'.`
      });
    }

    next();
  };
};

module.exports = {
  verifyToken,
  authorizeRoles
};
