/**
 * Centralized Global Error Handler Middleware
 * 
 * Handles:
 * - Invalid ObjectIds (CastError)
 * - Mongoose Validation Errors (ValidationError)
 * - Mongoose Duplicate Key Errors (code 11000)
 * - JWT Token Errors
 * - Unexpected Server Errors
 * 
 * Security Rule: Never leak raw stack traces or database internals to client.
 */
const errorHandler = (err, req, res, next) => {
  // If response headers have already been sent, delegate to Express default
  if (res.headersSent) {
    return next(err);
  }

  let statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  let message = err.message || 'An unexpected internal server error occurred';

  // 1. Handle Mongoose Invalid ObjectId (CastError)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ID parameter format provided: '${err.value}'`;
  }

  // 2. Handle Mongoose Validation Error (e.g. required field missing)
  if (err.name === 'ValidationError') {
    statusCode = 400;
    const validationDetails = Object.values(err.errors || {})
      .map((val) => val.message)
      .join(', ');
    message = `Validation Failed: ${validationDetails || err.message}`;
  }

  // 3. Handle Mongoose Duplicate Key Error (e.g. unique email or registration)
  if (err.code === 11000) {
    statusCode = 400;
    const duplicateField = Object.keys(err.keyValue || {})[0] || 'field';
    const duplicateValue = err.keyValue ? err.keyValue[duplicateField] : '';
    message = `Duplicate field value: A record with ${duplicateField} '${duplicateValue}' already exists.`;
  }

  // 4. Handle JSON Web Token Errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Authentication failed: Invalid token signature.';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Authentication failed: Token has expired.';
  }

  // Server-side logging for developer troubleshooting
  console.error(`[Error] [${req.method} ${req.originalUrl}] Status: ${statusCode} - ${message}`);

  // Return clean, structured JSON to the client
  res.status(statusCode).json({
    success: false,
    message
  });
};

module.exports = errorHandler;
