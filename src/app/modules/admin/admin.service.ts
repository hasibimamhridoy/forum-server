import httpStatus from 'http-status'
import ApiError from '../../../error/ApiError'
import { logger } from '../../../logger/winston'
import { emitPostUpdate } from '../../../sockets/sockets'
import type { IPost } from '../post/post.interface'
import { Post } from '../post/post.model'
import type { IThread, ThreadSummary } from '../thread/thread.interface'
import { Thread } from '../thread/thread.model'
import { generateThreadSummary } from '../thread/thread.worker'
import { TUser } from '../user/user.interface'
import { User } from '../user/user.model'
import type { IAdminStats, IFlagPayload } from './admin.interface'

// Thread Management Services
const flagThread = async (threadId: string, payload: IFlagPayload, adminId: string): Promise<IThread> => {
  const thread = await Thread.findById(threadId)

  if (!thread) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Thread not found')
  }

  thread.isFlagged = true
  thread.flagReason = payload.reason || 'Flagged by moderator'
  await thread.save()

  logger.info(`Thread ${threadId} flagged by admin ${adminId}`)

  return thread
}

const unflagThread = async (threadId: string, adminId: string): Promise<IThread> => {
  const thread = await Thread.findById(threadId)

  if (!thread) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Thread not found')
  }

  thread.isFlagged = false
  thread.flagReason = undefined
  await thread.save()

  logger.info(`Thread ${threadId} unflagged by admin ${adminId}`)

  return thread
}

const lockThread = async (threadId: string, adminId: string): Promise<IThread> => {
  const thread = await Thread.findById(threadId)

  if (!thread) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Thread not found')
  }

  thread.isLocked = true
  await thread.save()

  logger.info(`Thread ${threadId} locked by admin ${adminId}`)

  return thread
}

const unlockThread = async (threadId: string, adminId: string): Promise<IThread> => {
  const thread = await Thread.findById(threadId)

  if (!thread) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Thread not found')
  }

  thread.isLocked = false
  await thread.save()

  logger.info(`Thread ${threadId} unlocked by admin ${adminId}`)

  return thread
}

const pinThread = async (threadId: string, adminId: string): Promise<IThread> => {
  const thread = await Thread.findById(threadId)

  if (!thread) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Thread not found')
  }

  thread.isPinned = true
  await thread.save()

  logger.info(`Thread ${threadId} pinned by admin ${adminId}`)

  return thread
}

const unpinThread = async (threadId: string, adminId: string): Promise<IThread> => {
  const thread = await Thread.findById(threadId)

  if (!thread) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Thread not found')
  }

  thread.isPinned = false
  await thread.save()

  logger.info(`Thread ${threadId} unpinned by admin ${adminId}`)

  return thread
}

// Post Management Services
const flagPost = async (postId: string, payload: IFlagPayload, adminId: string): Promise<IPost> => {
  const post = await Post.findById(postId)

  if (!post) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Post not found')
  }

  post.isFlagged = true
  post.flagReason = payload?.reason || 'Flagged by admin'
  await post.save()

  emitPostUpdate(post.thread.toString(), 'post:updated', post)

  logger.info(`Post ${postId} flagged by admin ${adminId}`)

  return post
}

const unflagPost = async (postId: string, adminId: string): Promise<IPost> => {
  const post = await Post.findById(postId)

  if (!post) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Post not found')
  }

  post.isFlagged = false
  post.flagReason = undefined
  await post.save()
  emitPostUpdate(post.thread.toString(), 'post:updated', post)

  logger.info(`Post ${postId} unflagged by admin ${adminId}`)

  return post
}

// User Management Services
const deactivateUser = async (userId: string, adminId: string): Promise<TUser> => {
  const user = await User.findById(userId)

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found')
  }

  if (user.role === 'admin') {
    throw new ApiError(httpStatus.FORBIDDEN, 'Cannot deactivate admin users')
  }

  user.isActive = false
  await user.save()

  logger.info(`User ${userId} deactivated by admin ${adminId}`)

  return user
}

const activateUser = async (userId: string, adminId: string): Promise<TUser> => {
  const user = await User.findById(userId)

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found')
  }

  user.isActive = true
  await user.save()

  logger.info(`User ${userId} activated by admin ${adminId}`)

  return user
}

// Analytics Services
const getThreadSummary = async (threadId: string): Promise<ThreadSummary> => {
  const thread = await Thread.findById(threadId)

  if (!thread) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Thread not found')
  }

  const posts = await Post.find({ thread: threadId }).limit(100).sort('createdAt')

  const postContents = posts.map(post => post.content)

  const summary = await generateThreadSummary(thread.title, postContents)

  return summary
}

const getDashboardStats = async (): Promise<IAdminStats> => {
  const totalUsers = await User.countDocuments()
  const activeUsers = await User.countDocuments({ isActive: true })
  const totalThreads = await Thread.countDocuments()
  const flaggedThreads = await Thread.countDocuments({ isFlagged: true })
  const totalPosts = await Post.countDocuments()
  const flaggedPosts = await Post.countDocuments({ isFlagged: true })

  return {
    users: {
      total: totalUsers,
      active: activeUsers,
      inactive: totalUsers - activeUsers
    },
    threads: {
      total: totalThreads,
      flagged: flaggedThreads
    },
    posts: {
      total: totalPosts,
      flagged: flaggedPosts
    }
  }
}

export const AdminServices = {
  flagThread,
  unflagThread,
  lockThread,
  unlockThread,
  pinThread,
  unpinThread,
  flagPost,
  unflagPost,
  deactivateUser,
  activateUser,
  getThreadSummary,
  getDashboardStats
}
