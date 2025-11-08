/* eslint-disable @typescript-eslint/no-this-alias */
import { Schema, model } from 'mongoose'
import { IPost } from './post.interface'

const postSchema = new Schema<IPost>(
  {
    content: {
      type: String,
      required: true,
      minlength: 1,
      maxlength: 5000
    },
    thread: {
      type: Schema.Types.ObjectId,
      ref: 'Thread',
      required: true,
      index: true
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: false,
      index: true
    },
    parentPost: {
      type: Schema.Types.ObjectId,
      ref: 'Post',
      default: null,
      index: true
    },
    isEdited: {
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

// Compound indexes for efficient queries
postSchema.index({ thread: 1, createdAt: 1 })
postSchema.index({ thread: 1, parentPost: 1 })
export const Post = model<IPost>('Post', postSchema)
