const jwt = require('jsonwebtoken');

/**
 * Bearer Token Authentication Middleware
 * Validates JSON Web Tokens (JWT) supplied in Authorization header
 * 
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
    
    // Attach decoded user payload to request object
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token. Please log in again.'
    });
  }
};

module.exports = {
  verifyToken
};
