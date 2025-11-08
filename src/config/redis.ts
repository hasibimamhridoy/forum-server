import { createClient } from 'redis'
import { logger } from '../logger/winston'

const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  socket: {
    reconnectStrategy: retries => {
      if (retries > 10) {
        logger.error('Redis reconnection failed after 10 attempts')
        return new Error('Redis reconnection failed')
      }
      return retries * 100
    }
  }
})

redisClient.on('error', error => {
  logger.error('Redis Client Error:', error)
})

redisClient.on('connect', () => {
  logger.info('Redis connected successfully')
})

redisClient.on('reconnecting', () => {
  logger.warn('Redis reconnecting...')
})

export const connectRedis = async (): Promise<void> => {
  try {
    await redisClient.connect()
  } catch (error) {
    logger.error('Failed to connect to Redis:', error)
    throw error
  }
}

export const disconnectRedis = async (): Promise<void> => {
  try {
    await redisClient.quit()
    logger.info('Redis disconnected successfully')
  } catch (error) {
    logger.error('Error disconnecting from Redis:', error)
  }
}

export default redisClient
