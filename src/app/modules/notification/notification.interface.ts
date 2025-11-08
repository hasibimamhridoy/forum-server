/* eslint-disable no-unused-vars */
import { Schema } from 'mongoose'

export interface INotification {
  _id: string
  recipient: Schema.Types.ObjectId
  sender?: Schema.Types.ObjectId
  type: 'mention' | 'reply' | 'thread_update' | 'system'
  content: string
  relatedThread?: Schema.Types.ObjectId
  relatedPost?: Schema.Types.ObjectId
  isRead: boolean
  createdAt: Date
}

export interface ICreateNotificationData {
  recipient: string
  sender?: string
  type: 'mention' | 'reply' | 'thread_update' | 'system'
  content: string
  relatedThread?: string
  relatedPost?: string
}
