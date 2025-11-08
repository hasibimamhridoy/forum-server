/* eslint-disable @typescript-eslint/no-this-alias */
import { Schema, model } from 'mongoose'
import { INotification } from './notification.interface'

const notificationSchema = new Schema<INotification>(
  {
    recipient: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    type: {
      type: String,
      enum: ['mention', 'reply', 'thread_update', 'system'],
      required: true,
      index: true
    },
    content: {
      type: String,
      required: true
    },
    relatedThread: {
      type: Schema.Types.ObjectId,
      ref: 'Thread',
      default: null
    },
    relatedPost: {
      type: Schema.Types.ObjectId,
      ref: 'Post',
      default: null
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
)

// Compound indexes for efficient queries
notificationSchema.index({ thread: 1, createdAt: 1 })
notificationSchema.index({ thread: 1, parentPost: 1 })
export const Notification = model<INotification>('Notification', notificationSchema)
