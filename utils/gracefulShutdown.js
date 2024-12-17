/**
 * Graceful shutdown utility for Node.js server
 * @param {http.Server} server - HTTP server instance
 * @param {Object} options - Shutdown options
 */
const gracefulShutdown = (server, options = {}) => {
    const { 
      logger = console, 
      timeout = 10000,
      database = {},
      callbacks = [] 
    } = options;
  
    const shutdown = async (signal) => {
      logger.info(`Received ${signal}. Starting graceful shutdown...`);
      
      try {
        // Stop accepting new connections
        server.close(() => {
          logger.info('HTTP server closed');
        });
  
        // Disconnect from database if method provided
        if (typeof database.disconnect === 'function') {
          await database.disconnect();
          logger.info('Database disconnected');
        }
  
        // Run any additional cleanup callbacks
        for (const callback of callbacks) {
          await callback();
        }
  
        // Force close after timeout
        const forceClose = setTimeout(() => {
          logger.warn('Could not close connections in time, forcefully shutting down');
          process.exit(1);
        }, timeout);
  
        // Clear timeout if successful
        clearTimeout(forceClose);
        process.exit(0);
  
      } catch (error) {
        logger.error('Error during shutdown', error);
        process.exit(1);
      }
    };
  
    // Listen for termination signals
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  };
  
  export default gracefulShutdown;