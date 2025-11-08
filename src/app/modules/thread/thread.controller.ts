import httpStatus from 'http-status'
import catchAsync from '../../../shared/catchAsync'
import sendResponse from '../../../shared/sendResponse'
import { ThreadServices } from './thread.service'

const createThread = catchAsync(async (req, res) => {
  console.log('req.user ', req.user)

  const userId = req.user?.userId
  const result = await ThreadServices.createThread(req.body, userId)

  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Thread is created succesfully.',
    data: result
  })
})
const getThreads = catchAsync(async (req, res) => {
  const result = await ThreadServices.getThreads(req)

  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Thread fetch succesfully.',
    data: result
  })
})
const getThread = catchAsync(async (req, res) => {
  const result = await ThreadServices.getThread(req.params.id as string)
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Thread fetch succesfully.',
    data: result
  })
})

export const ThreadControllers = {
  createThread,
  getThreads,
  getThread
}
