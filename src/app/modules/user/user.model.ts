/* eslint-disable @typescript-eslint/no-this-alias */
import { Schema, model } from 'mongoose'
import { BcryptHelper } from '../../../helper/bcrypt'
import { TUser, UserRole, UserStatus } from './user.interface'
const userSchema = new Schema<TUser>(
  {
    username: {
      type: String,
      required: true,
      unique: true
    },
    email: {
      type: String,
      required: true,
      unique: true
    },
    password: {
      type: String,
      required: true,
      select: 1
    },

    role: {
      type: String,
      enum: UserRole,
      default: UserRole.USER
    },
    status: {
      type: String,
      enum: UserStatus,
      default: UserStatus.ACTIVE
    },
    isActive: {
      type: Boolean,
      default: true
    },
    bio: {
      type: String,
      default: ''
    },
    avatar: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
)

userSchema.pre('save', async function (next) {
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const user = this // doc
  // hashing password and save into DB
  console.log('in')
  user.password = await BcryptHelper.hashPassword(user.password)
  next()
})

export const User = model<TUser>('User', userSchema)
