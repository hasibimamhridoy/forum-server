import httpStatus from 'http-status'
import catchAsync from '../../../shared/catchAsync'
import sendResponse from '../../../shared/sendResponse'
import { NotificationServices } from './notification.service'

const getNotifications = catchAsync(async (req, res) => {
  const result = await NotificationServices.getNotifications(req)
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Notification fetch succesfully.',
    data: result
  })
})

export const PostControllers = {
  getNotifications
}
