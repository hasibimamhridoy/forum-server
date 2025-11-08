/* eslint-disable @typescript-eslint/no-this-alias */
import { Schema, model } from 'mongoose'
import { IThread } from './thread.interface'

const threadSchema = new Schema<IThread>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 5,
      maxlength: 200,
      index: 'text'
    },
    content: {
      type: String,
      required: true,
      minlength: 10,
      index: 'text'
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    category: {
      type: String,
      trim: true,
      index: true
    },
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true
      }
    ],
    views: {
      type: Number,
      default: 0
    },
    isPinned: {
      type: Boolean,
      default: false,
      index: true
    },
    isLocked: {
      type: Boolean,
      default: false
    },
    isFlagged: {
      type: Boolean,
      default: false,
      index: true
    },
    flagReason: {
      type: String,
      default: null
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
)

// Compound index for efficient queries
threadSchema.index({ createdAt: -1, isPinned: -1 })
threadSchema.index({ author: 1, createdAt: -1 })

export const Thread = model<IThread>('Thread', threadSchema)
