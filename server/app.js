const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes');
const notFoundHandler = require('./middleware/notFoundHandler');
const errorHandler = require('./middleware/errorHandler');

const app = express();

/**
 * Cross-Origin Resource Sharing (CORS) Configuration
 * Permits incoming requests from frontend development origin
 */
const allowedOrigin = process.env.CLIENT_URL || 'http://localhost:5173';
app.use(cors({
  origin: allowedOrigin,
  credentials: true
}));

/**
 * Request Body Parsers
 */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * Root Welcome Route
 */
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    name: 'DriveEasy Car Rental System Backend API',
    description: 'ITUE301 Open-Book Practical Examination - CSPIT, CHARUSAT',
    version: '1.0.0',
    stage: 'Stage 1 - Foundation & Starter Shell',
    healthCheck: '/api/v1/health'
  });
});

/**
 * Mount API v1 Routes
 * (includes /api/v1/health and future stage routes)
 */
app.use('/api/v1', apiRoutes);

/**
 * 404 Route Handler
 */
app.use(notFoundHandler);

/**
 * Centralized Error Handler (prevents leaking secrets & stack traces)
 */
app.use(errorHandler);

module.exports = app;
