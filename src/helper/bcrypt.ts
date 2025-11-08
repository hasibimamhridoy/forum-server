import bcrypt from 'bcrypt'
import httpStatus from 'http-status'
import config from '../config'
import ApiError from '../error/ApiError'

// Function to hash a password
export async function hashPassword(plainPassword: string): Promise<string> {
  try {
    const hashedPassword = await bcrypt.hash(plainPassword, Number(config.bcrypt.SALT_ROUNDS))
    return hashedPassword
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Error hashing password')
  }
}
// Function to verify a password
export async function verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
  try {
    const isMatch = await bcrypt.compare(plainPassword, hashedPassword)
    return isMatch
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Error verify password')
  }
}

export const BcryptHelper = {
  hashPassword,
  verifyPassword
}
