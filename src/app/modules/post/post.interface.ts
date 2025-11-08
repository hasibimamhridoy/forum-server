/* eslint-disable no-unused-vars */
import { Schema } from 'mongoose'

export interface IPost {
  _id: string
  content: string
  thread: Schema.Types.ObjectId
  author: Schema.Types.ObjectId
  parentPost?: Schema.Types.ObjectId
  isEdited: boolean
  isFlagged: boolean
  flagReason?: string
  createdAt: Date
  updatedAt: Date
}
