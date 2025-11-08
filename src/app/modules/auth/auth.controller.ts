import httpStatus from 'http-status'
import config from '../../../config'
import catchAsync from '../../../shared/catchAsync'
import sendResponse from '../../../shared/sendResponse'
import { AuthServices } from './auth.service'

const loginUser = catchAsync(async (req, res) => {
  const result = await AuthServices.loginUser(req.body)
  const { refreshToken } = result

  res.cookie('refreshToken', refreshToken, {
    secure: config.NODE_ENV === 'production',
    httpOnly: true
  })

  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'User is logged in succesfully!',
    data: {
      ...result
    }
  })
})

export const AuthControllers = {
  loginUser
}
