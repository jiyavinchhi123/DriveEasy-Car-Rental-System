const dotenv = require('dotenv');

// Load environment variables before any other application modules
dotenv.config();

const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

// Initialize Database Connection
connectDB();

// Start HTTP Server
const server = app.listen(PORT, () => {
  console.log('=============================================================');
  console.log('   DriveEasy Car Rental System - Backend Server (Stage 1)   ');
  console.log(`   Port:         ${PORT}                                     `);
  console.log(`   Environment:  ${process.env.NODE_ENV || 'development'}   `);
  console.log(`   Base URL:     http://localhost:${PORT}                    `);
  console.log(`   Health Check: http://localhost:${PORT}/api/v1/health      `);
  console.log('=============================================================');
});

// Handle unhandled Promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`[Process Error] Unhandled Rejection: ${err.message}`);
});

module.exports = server;
