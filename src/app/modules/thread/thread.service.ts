/* eslint-disable @typescript-eslint/no-explicit-any */

import { Request } from 'express'
import httpStatus from 'http-status'
import redisClient from '../../../config/redis'
import ApiError from '../../../error/ApiError'
import { logger } from '../../../logger/winston'
import { emitThreadUpdate } from '../../../sockets/sockets'
import { aiQueue } from './thread.ai.queue'
import { IThread } from './thread.interface'
import { Thread } from './thread.model'

const CACHE_TTL = 300 // 5 minutes

const invalidateThreadListCache = async () => {
  try {
    // Get all keys matching the pattern threads:list:*
    const keys = await redisClient.keys('threads:list:*')
    if (keys.length > 0) {
      await redisClient.del(keys)
      logger.info(`Invalidated ${keys.length} thread list cache entries`)
    }
  } catch (error) {
    logger.error('Error invalidating thread list cache:', error)
  }
}

const createThread = async (payload: IThread, userId: string): Promise<IThread> => {
  const { title, content, category, tags } = payload

  const thread = await Thread.create({
    title,
    content,
    author: userId,
    category,
    tags: tags || [],
    isFlagged: false,
    flagReason: 'No reason'
  })

  // AI moderation check asynchronously
  await createAiAnalize({ content: content, threadId: thread._id, userId })

  await thread.populate('author', 'username avatar')
  await invalidateThreadListCache()

  emitThreadUpdate('thread:created', thread)

  logger.info(`Thread created with ID: ${thread._id} by user 'userid'`)
  return thread
}
// const getThreads = async (): Promise<IThread[]> => {
//   const threads = await Thread.find().populate('author', 'username avatar').sort({ createdAt: -1 })
//   return threads
// }
export const getThreads = async (req: Request) => {
  const { page = 1, limit = 20, search, category, sort = '-createdAt' } = req.query

  const cacheKey = `threads:list:${page}:${limit}:${search || ''}:${category || ''}:${sort}`

  // Check cache
  const cached = await redisClient.get(cacheKey)
  if (cached) {
    // return res.json({
    //   success: true,
    //   data: JSON.parse(cached),
    //   cached: true,
    // })
    return JSON.parse(cached)
  }

  const query: any = {}

  if (search) {
    const searchRegex = new RegExp(search as string, 'i') // Case-insensitive search
    query.$or = [{ title: searchRegex }, { content: searchRegex }, { tags: searchRegex }]
  }

  if (category) {
    query.category = category
  }

  const threads = await Thread.find(query)
    .populate('author', 'username avatar')
    .sort(sort as string)
    .limit(Number(limit))
    .skip((Number(page) - 1) * Number(limit))

  const total = await Thread.countDocuments(query)

  const result = {
    threads,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit))
    }
  }

  // Cache result
  await redisClient.setEx(cacheKey, CACHE_TTL, JSON.stringify(result))
  return result
}

const getThread = async (id: string): Promise<any> => {
  // const { id } = req.params

  // const cacheKey = `thread:${id}`

  // // Check cache
  // const cached = await redisClient.get(cacheKey)
  // if (cached) {

  //   return JSON.parse(cached)
  // }

  const thread = await Thread.findById(id).populate('author', 'username avatar')

  if (!thread) {
    // return next(new AppError("Thread not found", 404))
    new ApiError(httpStatus.NOT_FOUND, 'Thread not found')
  }

  // Increment views
  if (thread) {
    thread.views += 1
    await thread.save()
  }

  // Cache result
  // await redisClient.setEx(cacheKey, CACHE_TTL, JSON.stringify(thread))
  return thread
}

export const createAiAnalize = async (data: any) => {
  try {
    // Add to queue for async processing
    const result = await aiQueue.add('aiQueue', data)

    logger.info(`AiQueue queued for user ${data?.userId.toString()}`)
    return result
  } catch (error) {
    logger.error('Error creating AiQueue:', error)
  }
}

export const ThreadServices = {
  createThread,
  getThreads,
  getThread
}
