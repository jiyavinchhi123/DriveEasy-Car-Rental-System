const express = require('express');
const cors = require('cors');
const requestLogger = require('./middleware/requestLogger');
const apiRoutes = require('./routes');
const notFoundHandler = require('./middleware/notFoundHandler');
const errorHandler = require('./middleware/errorHandler');

const app = express();

/**
 * 1. Cross-Origin Resource Sharing (CORS) Configuration
 * Permits incoming requests from frontend origin
 */
const allowedOrigin = process.env.CLIENT_URL || 'http://localhost:5173';
app.use(cors({
  origin: allowedOrigin,
  credentials: true
}));

/**
 * 2. Request Body Parsers (JSON & URL-Encoded)
 */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * 3. Global Request Logger Middleware
 * Executes on every incoming request logging: [METHOD] [PATH] [TIMESTAMP]
 */
app.use(requestLogger);

/**
 * 4. Root Welcome Route
 */
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    name: 'DriveEasy Car Rental System Backend API',
    course: 'ITUE301 Open-Book Practical Examination - CSPIT, CHARUSAT',
    version: '1.0.0',
    stage: 'Stage 4 - Express Backend REST API',
    apiDocumentation: '/api/v1',
    healthCheck: '/api/v1/health'
  });
});

/**
 * 5. Mount API v1 Routes
 * (Public: /auth/login, /vehicles, /health; Protected: /bookings)
 */
app.use('/api/v1', apiRoutes);

/**
 * 6. 404 Not Found Middleware (catches unhandled routes)
 */
app.use(notFoundHandler);

/**
 * 7. Global Centralized Error Handler Middleware (last in chain)
 * Handles CastError, ValidationError, Duplicate Key 11000, and JWT errors
 */
app.use(errorHandler);

module.exports = app;
