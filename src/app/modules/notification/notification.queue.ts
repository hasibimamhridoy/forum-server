import Bull from 'bull'
import { logger } from '../../../logger/winston'
import { processNotification } from './notification.service'
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379'
export const notificationQueue = new Bull('notifications', redisUrl)

// Notification queue processor
notificationQueue.process('send-notification', async job => {
  try {
    await processNotification(job.data)
    logger.info(`Notification job ${job.id} completed`)
  } catch (error) {
    logger.error(`Notification job ${job.id} failed:`, error)
    throw error
  }
})

// Error handlers
notificationQueue.on('failed', (job, err) => {
  logger.error(`Notification job ${job.id} failed:`, err)
})

logger.info('Queue processors initialized')
