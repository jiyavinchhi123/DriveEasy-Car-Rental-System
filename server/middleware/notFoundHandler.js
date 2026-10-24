/**
 * Not Found (404) Middleware
 * Catches any request targeting undefined routes
 */
const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Resource not found: Cannot ${req.method} ${req.originalUrl}`
  });
};

module.exports = notFoundHandler;
