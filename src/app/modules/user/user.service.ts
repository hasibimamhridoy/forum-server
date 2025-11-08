/* eslint-disable @typescript-eslint/no-explicit-any */
import { TUser } from './user.interface'

import { User } from './user.model'

const createUserIntoDb = async (password: string, payload: TUser): Promise<TUser> => {
  payload.password = password
  const newUser = await User.create(payload)
  return newUser
}

const updateProfile = async (
  payload: {
    username: string
    email: string
  },
  userId: string
): Promise<TUser> => {
  const updatedUser = await User.findByIdAndUpdate(userId, payload, { new: true })
  return updatedUser as TUser
}

const getMe = async (userId: string): Promise<TUser> => {
  const user = await User.findById(userId)
  return user as TUser
}

export const UserServices = {
  createUserIntoDb,
  getMe,
  updateProfile
}
