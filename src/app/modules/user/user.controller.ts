import httpStatus from 'http-status'
import catchAsync from '../../../shared/catchAsync'
import sendResponse from '../../../shared/sendResponse'
import { UserServices } from './user.service'

const createUser = catchAsync(async (req, res) => {
  const { password, ...userData } = req.body

  console.log('hit ', req.body)

  const result = await UserServices.createUserIntoDb(password, userData)

  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'User is created succesfully',
    data: result
  })
})

const updateProfile = catchAsync(async (req, res) => {
  const result = await UserServices.updateProfile(req.body, req.user?.userId)

  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'User is updated succesfully',
    data: result
  })
})
const getMe = catchAsync(async (req, res) => {
  const result = await UserServices.getMe(req.user?.userId)

  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'User is get succesfully',
    data: result
  })
})

export const UserControllers = {
  createUser,
  updateProfile,
  getMe
}
