/* eslint-disable no-unused-vars */
import { Schema } from 'mongoose'

export interface IThread {
  _id: string
  title: string
  content: string
  author: Schema.Types.ObjectId
  category?: string
  tags: string[]
  views: number
  isPinned: boolean
  isLocked: boolean
  isFlagged: boolean
  flagReason?: string
  createdAt: Date
  updatedAt: Date
}

export interface AIAnalysisResult {
  isSpam: boolean
  confidence: number
  reason?: string
  suggestedAction?: 'approve' | 'flag' | 'reject'
  threadId: string
  postId?: string
}

export interface ThreadSummary {
  summary: string
  keyPoints: string[]
  sentiment: 'positive' | 'neutral' | 'negative'
}
