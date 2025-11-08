import httpStatus from 'http-status'
import jwt, { JsonWebTokenError, JwtPayload, Secret } from 'jsonwebtoken'
import config from '../config'
import ApiError from '../error/ApiError'

const createToken = (payload: JwtPayload, secretKey: Secret, expiresIn: string) => {
  if (typeof payload !== 'object' || !payload) {
    throw new Error('Payload must be a non-empty object.Error From : createJSONWebToken Function')
  }

  if (typeof secretKey !== 'string' || secretKey === '') {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Jwt Secret key must be a non-empty string.')
  }

  try {
    const token = jwt.sign(
      {
        data: payload
      },
      secretKey,
      { expiresIn }
    )
    return token
  } catch (error: unknown) {
    if (error instanceof JsonWebTokenError) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        `Failed to create token from Jwt. Error is: ${error.message}`
      )
    } else {
      // Handle or rethrow other types of errors
      throw error
    }
  }
}

const verifyToken = async (token: string) => {
  try {
    if (!token) throw new ApiError(httpStatus.NOT_FOUND, 'Token not found')
    const decoded = jwt.verify(token, config.jwt.JWT_SECRET_KEY)
    if (!decoded) throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid Token')
    return decoded
  } catch (error: unknown) {
    if (error instanceof JsonWebTokenError) {
      if (error.name === 'TokenExpiredError') {
        throw new ApiError(401, 'Token Expired.')
      } else if (error.name === 'JsonWebTokenError') {
        throw new ApiError(401, 'Invalid Token')
      } else {
        throw new ApiError(401, error.message)
      }
    }
    throw new ApiError(401, 'UNAUTHORIZED Error')
  }
}

export const JwtHelper = {
  createToken,
  verifyToken
}
