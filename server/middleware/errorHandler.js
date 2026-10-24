/**
 * Centralized Global Error Handler Middleware
 * 
 * Security Rule: Never expose internal stack traces, system paths,
 * or credentials in responses returned to the client/browser.
 */
const errorHandler = (err, req, res, next) => {
  // If headers are already sent, delegate to default Express handler
  if (res.headersSent) {
    return next(err);
  }

  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;

  // Log detailed error server-side for development debugging
  console.error(`[Error Handler] ${req.method} ${req.originalUrl}:`, err.message);

  // Return clean, sanitized JSON to the client
  res.status(statusCode).json({
    success: false,
    message: err.message || 'An internal server error occurred',
    // Only in development, provide a harmless hint, never the stack trace
    ...(process.env.NODE_ENV === 'development' && {
      hint: 'Check server console logs for detailed diagnostics'
    })
  });
};

module.exports = errorHandler;
