/* eslint-disable @typescript-eslint/no-explicit-any */

import httpStatus from 'http-status'
import ApiError from '../../../error/ApiError'
import { logger } from '../../../logger/winston'
import { emitPostUpdate } from '../../../sockets/sockets'
import { createNotification } from '../notification/notification.service'
import { aiQueueForPost } from '../thread/thread.ai.queue'
import { IThread } from '../thread/thread.interface'
import { Thread } from '../thread/thread.model'
import { IPost } from './post.interface'
import { Post } from './post.model'

const createPost = async (
  payload: {
    content: string
    threadId: string
    parentPostId?: string
  },
  userId: string
): Promise<IPost> => {
  const { content, threadId, parentPostId } = payload

  // Check if thread exists and is not locked
  const thread = await Thread.findById(threadId)
  if (!thread) {
    new ApiError(httpStatus.NOT_FOUND, 'Thread not found')
  }
  if (thread?.isLocked) {
    new ApiError(httpStatus.FORBIDDEN, 'Thread is locked')
  }

  // AI moderation check
  // const aiAnalysis = await analyzeContent(content)
  // if (aiAnalysis.isSpam && aiAnalysis.confidence > 0.8) {
  //   // logger.warn(`Spam detected in post creation by user ${req.user!.id}`)
  //   // return next(new AppError('Content flagged as spam', 400))
  // }

  // Check parent post if provided
  if (parentPostId) {
    const parentPost = await Post.findById(parentPostId)
    if (!parentPost || parentPost.thread.toString() !== threadId) {
      new ApiError(httpStatus.BAD_REQUEST, 'Invalid parent post')
    }
  }

  const post = await Post.create({
    content,
    thread: threadId,
    author: userId,
    parentPost: parentPostId || null,
    // isFlagged: aiAnalysis.isSpam && aiAnalysis.confidence > 0.5,
    // flagReason: aiAnalysis.reason
    isFlagged: false,
    flagReason: 'No reason'
  })

  await createAiAnalizeForPost({ content: content, threadId: threadId, userId, postId: post._id })

  await post.populate('author', 'username')

  // Create notification for thread author
  if (thread?.author.toString() !== userId) {
    await createNotification({
      recipient: (thread as IThread).author.toString(),
      sender: userId,
      type: 'reply',
      content: `New reply in your thread: ${thread?.title}`,
      relatedThread: threadId,
      relatedPost: post._id.toString()
    })
  }

  // Create notification for parent post author
  if (parentPostId) {
    const parentPost = await Post.findById(parentPostId)
    if (parentPost && parentPost.author.toString() !== userId) {
      await createNotification({
        recipient: parentPost.author.toString(),
        sender: userId,
        type: 'reply',
        content: `${(post.author as any).username} replied to your post : ${parentPost.content.substring(
          0,
          30
        )}...`,
        relatedThread: threadId,
        relatedPost: post._id.toString()
      })
    }
  }

  // Check for mentions (@username)
  const mentions = content.match(/@(\w+)/g)
  if (mentions) {
    // Handle mentions (simplified)
    logger.info(`Mentions detected: ${mentions.join(', ')}`)
  }
  if (mentions) {
    // Handle mentions (simplified)
    logger.info(`Mentions detected: ${mentions.join(', ')}`)
  }
  // Emit socket event
  emitPostUpdate(threadId, 'post:created', post)
  logger.info(`Post created: ${post._id} in thread ${threadId}`)
  return post
}

const getPosts = async (
  threadId: string,
  query: {
    limit?: number
    page?: number
  }
): Promise<{
  posts: IPost[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}> => {
  const { page = 1, limit = 50 } = query

  // Check if thread exists
  const thread = await Thread.findById(threadId)
  if (!thread) {
    new ApiError(httpStatus.NOT_FOUND, 'Thread not found')
  }

  const posts = await Post.find({ thread: threadId })
    .populate('author', 'username avatar')
    .populate('parentPost', 'content author')
    .sort('createdAt')
    .limit(Number(limit))
    .skip((Number(page) - 1) * Number(limit))

  const total = await Post.countDocuments({ thread: threadId })

  return {
    posts,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit))
    }
  }
}

const updatePost = async (id: string, payload: IPost, userId: string): Promise<IPost | unknown> => {
  const post = await Post.findById(id)
  const { content } = payload

  if (!post) {
    return new ApiError(httpStatus.NOT_FOUND, 'Post not found')
  }

  // Check ownership
  if (post.author.toString() !== userId) {
    new ApiError(httpStatus.FORBIDDEN, 'Not authorized to update this post')
  }

  post.content = content
  post.isEdited = true
  await post.save()

  // Emit socket event
  emitPostUpdate(post.thread.toString(), 'post:updated', post)

  return post
}

const deletePost = async (id: string, userId: string): Promise<IPost | unknown> => {
  const post = await Post.findById(id)

  if (!post) {
    return new ApiError(httpStatus.NOT_FOUND, 'Post not found')
  }

  // Check ownership
  // if (post.author.toString() !== userId) {
  //   return new ApiError(httpStatus.FORBIDDEN, 'Not authorized to update this post')
  // }

  const threadId = post.thread.toString()

  async function deletePostAndChildren(postId: string) {
    // Find all child posts
    const childPosts = await Post.find({ parentPost: postId })

    // Recursively delete each child's children
    for (const child of childPosts) {
      await deletePostAndChildren(child._id.toString())
    }

    // Delete the post itself
    await Post.findByIdAndDelete(postId)

    // Emit socket event for each deleted post
    emitPostUpdate(threadId, 'post:deleted', { id: postId })
  }

  await deletePostAndChildren(id)

  logger.info(`Post ${id} and all its children deleted by user id ${userId}`)

  return {
    deletedCoutnt: 1 // This is a placeholder. You can enhance it to return the actual count if needed.
  }
}

export const createAiAnalizeForPost = async (data: any) => {
  try {
    // Add to queue for async processing
    const result = await aiQueueForPost.add('aiQueueForPost', data)

    logger.info(`AiQueue queued for user ${data?.userId.toString()}`)
    return result
  } catch (error) {
    logger.error('Error creating AiQueue:', error)
  }
}

export const PostServices = {
  createPost,
  getPosts,
  updatePost,
  deletePost
}
