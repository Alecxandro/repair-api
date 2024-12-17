import mongoose from 'mongoose'

export const apiStatus = async (req, res) => {
  try {
    let databaseStatus = 'disconnected'
    try {
      await mongoose.connection.db.admin().ping()
      databaseStatus = 'connected'
    } catch (dbError) {
      databaseStatus = 'connection error'
    }
    const status = {
      service: 'Repair Management API',
      version: '1.0.0',
      status: 'healthy',
      currentTime: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      endpoints: ['/api/repairs', '/api/customers', '/api/auth'],
      systemInfo: {
        memoryUsage: {
          rss: Math.round(process.memoryUsage().rss / 1024 / 1024) + ' MB',
          heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB',
          heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
        },
      },
      dependencies: {
        nodejs: process.version,
        npm: process.env.npm_package_version || 'N/A',
      },
      database: {
        status: databaseStatus,
        connectionTime: new Date().toISOString(),
      },
    }

    res.status(200).json(status)
  } catch (error) {
    res.status(500).json({
      service: 'Repair Management API',
      status: 'error',
      message: 'Unable to retrieve system status',
    })
  }
}
