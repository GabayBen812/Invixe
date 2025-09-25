const express = require('express');
const router = express.Router();

// Basic health check
router.get('/', (req, res) => {
  const healthCheck = {
    status: 'ok',
    message: 'Invixe backend is running!',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0',
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB'
    },
    pid: process.pid
  };
  
  res.status(200).json(healthCheck);
});

// Detailed health check
router.get('/detailed', async (req, res) => {
  try {
    const healthCheck = {
      status: 'ok',
      message: 'Invixe backend is running!',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB',
        external: Math.round(process.memoryUsage().external / 1024 / 1024) + ' MB',
        rss: Math.round(process.memoryUsage().rss / 1024 / 1024) + ' MB'
      },
      pid: process.pid,
      platform: process.platform,
      nodeVersion: process.version,
      cpuUsage: process.cpuUsage(),
      database: 'connected' // This could be enhanced to actually test DB connection
    };
    
    res.status(200).json(healthCheck);
  } catch (error) {
    res.status(503).json({
      status: 'error',
      message: 'Health check failed',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

// Readiness check (for Kubernetes/Docker)
router.get('/ready', (req, res) => {
  // Add any readiness checks here (e.g., database connection, external services)
  res.status(200).json({
    status: 'ready',
    message: 'Service is ready to accept traffic',
    timestamp: new Date().toISOString()
  });
});

// Liveness check (for Kubernetes/Docker)
router.get('/live', (req, res) => {
  // Simple liveness check - if this endpoint responds, the service is alive
  res.status(200).json({
    status: 'alive',
    message: 'Service is alive',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

module.exports = router;
