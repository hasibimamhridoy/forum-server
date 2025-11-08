import { NextFunction, Request, Response } from 'express'
import httpStatus from 'http-status'
import { JwtPayload } from 'jsonwebtoken'
import ApiError from '../../error/ApiError'
import { JwtHelper } from '../../helper/jwt'
import catchAsync from '../../shared/catchAsync'
import { UserRole, UserStatus } from '../modules/user/user.interface'
import { User } from '../modules/user/user.model'

const auth = (...requiredRoles: UserRole[]) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization

    // checking if the token is missing
    if (!token) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'You are not authorized!')
    }

    // checking if the given token is valid
    const decoded = (await JwtHelper.verifyToken(token)) as JwtPayload

    const { role, userId } = decoded

    // checking if the user is exist
    const user = await User.findById(userId)

    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, 'This user is not found !')
    }

    // checking if the user is blocked
    const userStatus = user?.status

    if (userStatus === UserStatus.BLOCK) {
      throw new ApiError(httpStatus.FORBIDDEN, 'This user is blocked ! !')
    }

    if (requiredRoles && !requiredRoles.includes(role)) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'You are not authorized  hi!')
    }

    req.user = decoded as JwtPayload
    next()
  })
}

export default auth
