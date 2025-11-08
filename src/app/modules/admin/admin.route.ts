/* eslint-disable @typescript-eslint/no-explicit-any */
import express from 'express'
import auth from '../../middleware/auth'
import { UserRole } from '../user/user.interface'
import { AdminControllers } from './admin.controller'

const router = express.Router()

// All admin routes require moderator or admin role
router.use(auth(UserRole.ADMIN, UserRole.USER))

// Dashboard stats
router.get('/stats', AdminControllers.getDashboardStats)

// Thread management
router.get('/threads/:id/summary', AdminControllers.getThreadSummary)
router.patch('/threads/:id/flag', AdminControllers.flagThread)
router.patch('/threads/:id/unflag', AdminControllers.unflagThread)
router.patch('/threads/:id/lock', AdminControllers.lockThread)
router.patch('/threads/:id/unlock', AdminControllers.unlockThread)
router.patch('/threads/:id/pin', AdminControllers.pinThread)
router.patch('/threads/:id/unpin', AdminControllers.unpinThread)

// Post management
router.patch('/posts/:id/flag', AdminControllers.flagPost)
router.patch('/posts/:id/unflag', AdminControllers.unflagPost)

// User management
router.patch('/users/:id/deactivate', AdminControllers.deactivateUser)
router.patch('/users/:id/activate', AdminControllers.activateUser)

export const AdminRoutes = router
