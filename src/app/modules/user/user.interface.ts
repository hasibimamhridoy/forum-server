/* eslint-disable no-unused-vars */

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin'
}
export enum UserStatus {
  ACTIVE = 'active',
  BLOCK = 'block',
  IN_PROGRESS = 'in-progress'
}

export interface TUser {
  username: string
  email: string
  password: string
  role: UserRole
  status: UserStatus
  isActive: boolean
  bio?: string
  avatar?: string
}
