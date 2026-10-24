/**
 * Global Request Logger Middleware
 * Formats and logs every incoming HTTP request:
 * [METHOD] [PATH] [TIMESTAMP]
 */
const requestLogger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${req.method}] [${req.originalUrl || req.url}] [${timestamp}]`);
  next();
};

module.exports = requestLogger;
