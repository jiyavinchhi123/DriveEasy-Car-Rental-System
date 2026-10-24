const mongoose = require('mongoose');

/**
 * Service to aggregate system and database health status
 */
const getSystemHealth = () => {
  const dbState = mongoose.connection.readyState;
  
  // Mongoose connection state mapping:
  // 0: disconnected, 1: connected, 2: connecting, 3: disconnecting
  const dbStateMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };

  return {
    application: 'DriveEasy Car Rental System API',
    status: 'healthy',
    stage: 'Stage 1 - Foundation & Starter Shell',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    database: {
      status: dbStateMap[dbState] || 'unknown',
      connected: dbState === 1
    }
  };
};

module.exports = {
  getSystemHealth
};
