const mongoose = require('mongoose');

/**
 * Connect to MongoDB database
 * Keeps database connection logic decoupled from Express server startup
 */
const connectDB = async () => {
  const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/driveeasy';

  try {
    const conn = await mongoose.connect(mongoURI);
    console.log(`[Database] MongoDB Connected Successfully: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`[Database Error] MongoDB connection failed: ${error.message}`);
    console.warn('[Database Notice] Server will continue running for health checks and API requests.');
    console.warn('[Database Notice] If you are testing MongoDB features, ensure mongod service is started or update MONGO_URI in .env.');
    return null;
  }
};

module.exports = connectDB;
