/* eslint-disable @typescript-eslint/no-explicit-any */
import express from 'express'
import auth from '../../middleware/auth'
import { UserRole } from '../user/user.interface'
import { PostControllers } from './notification.controller'

const router = express.Router()

// router.post('/', PostControllers.createPost)
router.get('/', auth(UserRole.ADMIN, UserRole.USER), PostControllers.getNotifications)

export const NotificationRoute = router
