import mongoose from 'mongoose'
import { logger } from '../logger/winston'

export const connectDatabase = async (): Promise<void> => {
  try {
    const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASS}@eddtech.y28jypq.mongodb.net/forum?retryWrites=true&w=majority`
    const mongoUri = uri || 'mongodb://localhost:27017/ai-chat-forum'

    await mongoose.connect(mongoUri, {
      maxPoolSize: 10,
      minPoolSize: 5,
      socketTimeoutMS: 45000
    })

    logger.info('MongoDB connected successfully')

    mongoose.connection.on('error', error => {
      logger.error('MongoDB connection error:', error)
    })

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected')
    })
  } catch (error) {
    logger.error('Failed to connect to MongoDB:', error)
    process.exit(1)
  }
}

export const disconnectDatabase = async (): Promise<void> => {
  try {
    await mongoose.disconnect()
    logger.info('MongoDB disconnected successfully')
  } catch (error) {
    logger.error('Error disconnecting from MongoDB:', error)
  }
}
