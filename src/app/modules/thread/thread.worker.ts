import OpenAI from 'openai'
import { logger } from '../../../logger/winston'
import { AIAnalysisResult, ThreadSummary } from './thread.interface'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export const analyzeContent = async (content: any): Promise<AIAnalysisResult> => {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are a content moderation assistant. Analyze the given text and determine if it contains spam, inappropriate content, or violates community guidelines. Respond with a JSON object containing: isSpam (boolean), confidence (0-1), reason (string), and suggestedAction (approve/flag/reject).'
        },
        {
          role: 'user',
          content: `Analyze this content: ${content.content}`
        }
      ],
      response_format: { type: 'json_object' }
    })

    const result = JSON.parse(response.choices[0].message.content || '{}')

    return {
      isSpam: result.isSpam || false,
      confidence: result.confidence || 0,
      reason: result.reason,
      suggestedAction: result.suggestedAction || 'approve',
      threadId: content.threadId,
      postId: content.postId
    }
  } catch (error) {
    logger.error('AI analysis error:', error)
    return {
      isSpam: false,
      confidence: 0,
      suggestedAction: 'approve',
      threadId: content.threadId
    }
  }
}

export const generateThreadSummary = async (title: string, posts: string[]): Promise<ThreadSummary> => {
  try {
    const postsText = posts.join('\n\n')

    console.log('object postsText:', postsText)

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are a helpful assistant that summarizes forum discussions. Provide a concise summary, key points, and overall sentiment. Respond with a JSON object containing: summary (string), keyPoints (array of strings), and sentiment (positive/neutral/negative).'
        },
        {
          role: 'user',
          content: `Summarize this thread:\n\nTitle: ${title}\n\nPosts:\n${postsText}`
        }
      ],
      response_format: { type: 'json_object' }
    })

    const result = JSON.parse(response.choices[0].message.content || '{}')

    return {
      summary: result.summary || 'No summary available',
      keyPoints: result.keyPoints || [],
      sentiment: result.sentiment || 'neutral'
    }
  } catch (error) {
    logger.error('Thread summary error:', error)
    return {
      summary: 'Unable to generate summary',
      keyPoints: [],
      sentiment: 'neutral'
    }
  }
}
