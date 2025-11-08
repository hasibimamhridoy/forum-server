import Bull from 'bull'
import { logger } from '../../../logger/winston'
import { emitThreadUpdate } from '../../../sockets/sockets'
import { Post } from '../post/post.model'
import { Thread } from './thread.model'
import { analyzeContent } from './thread.worker'
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379'
export const aiQueue = new Bull('aiQueue', redisUrl)
export const aiQueueForPost = new Bull('aiQueueForPost', redisUrl)

// Notification queue processor
aiQueue.process('aiQueue', async job => {
  try {
    console.log('job.data in aiQueue processor -------- ', job)

    const aiAnalysis = await analyzeContent(job.data)
    if (aiAnalysis.isSpam && aiAnalysis.confidence > 0.8) {
      logger.warn(`Spam detected in thread creation by user 'userid'`)
      const thread = await Thread.findByIdAndUpdate(
        job.data.threadId,
        {
          isFlagged: true,
          flagReason: aiAnalysis.reason
        },
        { new: true }
      )
      emitThreadUpdate('post:created', thread)

      console.log('updateThreadAspammed -------- ', thread)
      // throw new ApiError(400, 'Content flagged as spam')
      // return next(new AppError("Content flagged as spam", 400))
    }

    console.log('aiAnalysis ------------ ', aiAnalysis)
    logger.info(`aiQueue job ${job.id} completed`)
  } catch (error) {
    logger.error(`aiQueue job ${job.id} failed:`, error)
    throw error
  }
})
aiQueueForPost.process('aiQueueForPost', async job => {
  try {
    console.log('job.data in aiQueue processor -------- ', job)

    const aiAnalysis = await analyzeContent(job.data)
    if (aiAnalysis.isSpam && aiAnalysis.confidence > 0.8) {
      logger.warn(`Spam detected in thread creation by user 'userid'`)
      const thread = await Post.findByIdAndUpdate(
        job.data.postId,
        {
          isFlagged: true,
          flagReason: aiAnalysis.reason
        },
        { new: true }
      )
      emitThreadUpdate('post:updated', thread)

      console.log('updateThreadAspammed -------- ', thread)
      // throw new ApiError(400, 'Content flagged as spam')
      // return next(new AppError("Content flagged as spam", 400))
    }

    console.log('aiAnalysis ------------ ', aiAnalysis)
    logger.info(`aiQueue job ${job.id} completed`)
  } catch (error) {
    logger.error(`aiQueue job ${job.id} failed:`, error)
    throw error
  }
})

// Error handlers
aiQueue.on('failed', (job, err) => {
  logger.error(`aiQueue job ${job.id} failed:`, err)
})

logger.info('Queue processors initialized for aiQueue')
