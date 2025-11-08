import { server } from './app'
import config from './config'
import { connectDatabase } from './config/database'
import { connectRedis } from './config/redis'
import { logger } from './logger/winston'

const startServer = async () => {
  try {
    await connectDatabase()
    await connectRedis()
    server.listen(config.port, () => {
      logger.info(`Server running on port ${config.port}`)
      logger.info(`Environment: ${process.env.NODE_ENV}`)
    })
  } catch (error) {
    logger.error('Failed to start server:', error)
    process.exit(1)
  }
}

// Graceful shutdown
// process.on('SIGTERM', async () => {
//   logger.info('SIGTERM received, shutting down gracefully')
//   server.close(() => {
//     logger.info('Server closed')
//     process.exit(0)
//   })
// })

startServer()
