const healthService = require('../services/healthService');

/**
 * @desc    Get API health status
 * @route   GET /api/v1/health
 * @access  Public
 */
const getHealthStatus = (req, res) => {
  const healthData = healthService.getSystemHealth();

  res.status(200).json({
    success: true,
    message: 'DriveEasy Car Rental API is operating normally',
    data: healthData
  });
};

module.exports = {
  getHealthStatus
};
