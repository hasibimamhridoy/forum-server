import httpStatus from 'http-status'

import catchAsync from '../../../shared/catchAsync'
import sendResponse from '../../../shared/sendResponse'
import { AdminServices } from './admin.service'

// Thread Management Controllers
const flagThread = catchAsync(async (req, res) => {
  const threadId = req.params.id as string
  const adminId = req.user?.userId
  const result = await AdminServices.flagThread(threadId, req.body, adminId)

  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Thread flagged successfully',
    data: result
  })
})

const unflagThread = catchAsync(async (req, res) => {
  const threadId = req.params.id as string
  const adminId = req.user?.userId
  const result = await AdminServices.unflagThread(threadId, adminId)

  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Thread unflagged successfully',
    data: result
  })
})

const lockThread = catchAsync(async (req, res) => {
  const threadId = req.params.id as string
  const adminId = req.user?.userId
  const result = await AdminServices.lockThread(threadId, adminId)

  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Thread locked successfully',
    data: result
  })
})

const unlockThread = catchAsync(async (req, res) => {
  const threadId = req.params.id as string
  const adminId = req.user?.userId
  const result = await AdminServices.unlockThread(threadId, adminId)

  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Thread unlocked successfully',
    data: result
  })
})

const pinThread = catchAsync(async (req, res) => {
  const threadId = req.params.id as string
  const adminId = req.user?.userId
  const result = await AdminServices.pinThread(threadId, adminId)

  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Thread pinned successfully',
    data: result
  })
})

const unpinThread = catchAsync(async (req, res) => {
  const threadId = req.params.id as string
  const adminId = req.user?.userId
  const result = await AdminServices.unpinThread(threadId, adminId)

  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Thread unpinned successfully',
    data: result
  })
})

// Post Management Controllers
const flagPost = catchAsync(async (req, res) => {
  const postId = req.params.id as string
  const adminId = req.user?.userId
  const result = await AdminServices.flagPost(postId, req.body, adminId)

  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Post flagged successfully',
    data: result
  })
})

const unflagPost = catchAsync(async (req, res) => {
  const postId = req.params.id as string
  const adminId = req.user?.userId
  const result = await AdminServices.unflagPost(postId, adminId)

  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Post unflagged successfully',
    data: result
  })
})

// User Management Controllers
const deactivateUser = catchAsync(async (req, res) => {
  const userId = req.params.id as string
  const adminId = req.user?.userId
  const result = await AdminServices.deactivateUser(userId, adminId)

  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'User deactivated successfully',
    data: result
  })
})

const activateUser = catchAsync(async (req, res) => {
  const userId = req.params.id as string
  const adminId = req.user?.userId
  const result = await AdminServices.activateUser(userId, adminId)

  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'User activated successfully',
    data: result
  })
})

// Analytics Controllers
const getThreadSummary = catchAsync(async (req, res) => {
  const threadId = req.params.id as string
  const result = await AdminServices.getThreadSummary(threadId)

  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Thread summary generated successfully',
    data: result
  })
})

const getDashboardStats = catchAsync(async (req, res) => {
  const result = await AdminServices.getDashboardStats()

  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Dashboard stats fetched successfully',
    data: result
  })
})

export const AdminControllers = {
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
