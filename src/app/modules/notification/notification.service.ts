import { Request } from 'express'
import { logger } from '../../../logger/winston'
import { emitNotification } from '../../../sockets/sockets'
import { ICreateNotificationData } from './notification.interface'
import { Notification } from './notification.model'
import { notificationQueue } from './notification.queue'

export const createNotification = async (data: ICreateNotificationData) => {
  try {
    // Add to queue for async processing
    await notificationQueue.add('send-notification', data)
    logger.info(`Notification queued for user ${data.recipient}`)
  } catch (error) {
    logger.error('Error creating notification:', error)
  }
}

export const processNotification = async (data: ICreateNotificationData) => {
  try {
    const notification = await Notification.create(data)

    await notification.populate('sender', 'username avatar')

    // Emit real-time notification
    emitNotification(data.recipient, notification)

    logger.info(`Notification sent to user ${data.recipient}`)

    return notification
  } catch (error) {
    logger.error('Error processing notification:', error)
    throw error
  }
}

export const getNotifications = async (req: Request) => {
  const { page = 1, limit = 20, unreadOnly = false } = req.query

  const query: any = { recipient: req.user!.userId }

  if (unreadOnly === 'true') {
    query.isRead = false
  }

  const notifications = await Notification.find(query)
    .populate('sender', 'username avatar')
    .sort('-createdAt')
    .limit(Number(limit))
    .skip((Number(page) - 1) * Number(limit))

  const total = await Notification.countDocuments(query)
  const unreadCount = await Notification.countDocuments({
    recipient: req.user!.userId,
    isRead: false
  })

  return {
    notifications,
    unreadCount,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit))
    }
  }
}

export const NotificationServices = {
  createNotification,
  processNotification,
  getNotifications
}
