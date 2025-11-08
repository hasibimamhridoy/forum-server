import httpStatus from 'http-status'

import config from '../../../config'
import ApiError from '../../../error/ApiError'
import { BcryptHelper } from '../../../helper/bcrypt'
import { UserStatus } from '../user/user.interface'
import { User } from '../user/user.model'
import { TLoginUser } from './auth.interface'
import { createToken } from './auth.utils'

const loginUser = async (payload: TLoginUser) => {
  // checking if the user is exist
  const user = await User.findOne({ email: payload.email })

  console.log('user', user)

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'This user is not found !')
  }

  // checking if the user is blocked
  const userStatus = user?.status

  if (userStatus === UserStatus.BLOCK) {
    throw new ApiError(httpStatus.FORBIDDEN, 'This user is blocked ! !')
  }

  //checking if the password is correct
  const isValidPassword = await BcryptHelper.verifyPassword(payload?.password, user?.password)
  if (!isValidPassword) throw new ApiError(httpStatus.FORBIDDEN, 'Password do not matched')

  //create token and sent to the  client

  const jwtPayload = {
    userId: user.id,
    role: user.role
  }

  const accessToken = createToken(
    jwtPayload,
    config.jwt.JWT_SECRET_KEY as string,
    config.jwt.JWT_ACCESS_TOKEN_EXPIRESIN
  )

  const refreshToken = createToken(
    jwtPayload,
    config.jwt.JWT_SECRET_KEY as string,
    config.jwt.JWT_REFRESS_TOKEN_EXPIRESIN
  )

  return {
    accessToken,
    refreshToken,
    userId: user._id,
    role: user.role,
    email: user.email,
    userName: user.username
  }
}

export const AuthServices = {
  loginUser
}
