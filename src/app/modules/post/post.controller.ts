import httpStatus from 'http-status'
import catchAsync from '../../../shared/catchAsync'
import sendResponse from '../../../shared/sendResponse'
import { PostServices } from './post.service'

const createPost = catchAsync(async (req, res) => {
  console.log('hit ', req.body)
  console.log('req.user ', req.user)

  const userId = req.user?.userId
  const result = await PostServices.createPost(req.body, userId)

  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Thread is created succesfully.',
    data: result
  })
})

const getPosts = catchAsync(async (req, res) => {
  const threadId = req.params.threadId as string
  const query = req.query
  const result = await PostServices.getPosts(threadId, query)

  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Thread fetch succesfully.',
    data: result
  })
})

const updatePost = catchAsync(async (req, res) => {
  const postId = req.params.postId as string
  const result = await PostServices.updatePost(postId, req.body, req.user.userId)

  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Post updated succesfully.',
    data: result
  })
})
const deletePost = catchAsync(async (req, res) => {
  const postId = req.params.postId as string
  const result = await PostServices.deletePost(postId, req.user.userId)

  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Post updated succesfully.',
    data: result
  })
})

export const PostControllers = {
  createPost,
  getPosts,
  deletePost,
  updatePost
}
