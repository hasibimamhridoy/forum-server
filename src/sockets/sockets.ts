import jwt from 'jsonwebtoken'
import type { Server, Socket } from 'socket.io'
import { logger } from '../logger/winston'
export interface SocketUser {
  userId: string
  socketId: string
  username: string
}

const connectedUsers = new Map<string, SocketUser>()
const threadRooms = new Map<string, Set<string>>() // threadId -> Set of socketIds

export let io: Server

export const setupSocketIO = (socketServer: Server) => {
  io = socketServer

  io.use((socket, next) => {
    const token = socket.handshake.auth.token

    console.log('handshake auth:', socket.handshake.auth.token)

    if (!token) {
      return next(new Error('Authentication error'))
    }

    const decoded = jwt.verify(token, 'JWT_SECRET_KEY') as any

    console.log('decoded', decoded)

    socket.data.userId = decoded.userId
    next()

    // next()

    // try {
    //   const decoded = jwt.verify(token, 'JWT_SECRET_KEY') as any
    //   socket.data.userId = decoded.id
    //   next()
    //   console.log('hello ', decoded.id)
    // } catch (error) {
    //   next(new Error('Authentication error'))
    // }
  })

  io.on('connection', (socket: Socket) => {
    const userId = socket.data.userId

    logger.info(`User connected: ${userId}`)

    console.log('socket.handshake.auth ', socket.handshake.auth)

    connectedUsers.set(socket.id, {
      userId,
      socketId: socket.id,
      username: socket.handshake.auth.username || 'Anonymous'
    })

    // Join user's personal room for notifications
    socket.join(`user:${userId}`)

    socket.on('join:thread', (threadId: string) => {
      socket.join(`thread:${threadId}`)

      // Track user in thread room
      if (!threadRooms.has(threadId)) {
        threadRooms.set(threadId, new Set())
      }
      threadRooms.get(threadId)!.add(socket.id)

      // Get all users in this thread
      const usersInThread = Array.from(threadRooms.get(threadId) || [])
        .map(socketId => connectedUsers.get(socketId))
        .filter(Boolean)

      io.to(`thread:${threadId}`).emit('thread:users', {
        threadId,
        users: usersInThread
      })

      logger.info(`User ${userId} joined thread ${threadId}. Total users: ${usersInThread.length}`)
    })

    socket.on('thread:request-users', (threadId: string) => {
      const usersInThread = Array.from(threadRooms.get(threadId) || [])
        .map(socketId => connectedUsers.get(socketId))
        .filter(Boolean)

      // Send users list only to the requesting socket
      socket.emit('thread:users', {
        threadId,
        users: usersInThread
      })

      logger.info(`User ${userId} requested users for thread ${threadId}. Sent ${usersInThread.length} users`)
    })

    socket.on('leave:thread', (threadId: string) => {
      socket.leave(`thread:${threadId}`)

      // Remove user from thread room tracking
      if (threadRooms.has(threadId)) {
        threadRooms.get(threadId)!.delete(socket.id)

        // Clean up empty thread rooms
        if (threadRooms.get(threadId)!.size === 0) {
          threadRooms.delete(threadId)
        } else {
          // Emit updated user list to remaining users
          const usersInThread = Array.from(threadRooms.get(threadId) || [])
            .map(socketId => connectedUsers.get(socketId))
            .filter(Boolean)

          io.to(`thread:${threadId}`).emit('thread:users', {
            threadId,
            users: usersInThread
          })
        }
      }

      logger.info(`User ${userId} left thread ${threadId}`)
    })

    // Handle typing indicators
    socket.on('typing:start', (threadId: string) => {
      socket.to(`thread:${threadId}`).emit('user:typing', {
        userId,
        username: socket.handshake.auth.username
      })
    })

    socket.on('typing:stop', (threadId: string) => {
      socket.to(`thread:${threadId}`).emit('user:stopped-typing', {
        userId
      })
    })

    socket.on('disconnect', () => {
      connectedUsers.delete(socket.id)

      // Remove user from all thread rooms
      threadRooms.forEach((socketIds, threadId) => {
        if (socketIds.has(socket.id)) {
          socketIds.delete(socket.id)

          // Emit updated user list to remaining users
          const usersInThread = Array.from(socketIds)
            .map(socketId => connectedUsers.get(socketId))
            .filter(Boolean)

          io.to(`thread:${threadId}`).emit('thread:users', {
            threadId,
            users: usersInThread
          })

          // Clean up empty thread rooms
          if (socketIds.size === 0) {
            threadRooms.delete(threadId)
          }
        }
      })

      logger.info(`User disconnected: ${userId}`)
    })
  })

  logger.info('Socket.IO initialized')
}

export const emitThreadUpdate = (event: string, data: any) => {
  if (io) {
    io.emit(event, data)
  }
}

export const emitPostUpdate = (threadId: string, event: string, data: any) => {
  if (io) {
    io.to(`thread:${threadId}`).emit(event, data)
  }
}

export const emitNotification = (userId: string, notification: any) => {
  if (io) {
    io.to(`user:${userId}`).emit('notification:new', notification)
  }
}

export const getConnectedUsers = () => {
  return Array.from(connectedUsers.values())
}
