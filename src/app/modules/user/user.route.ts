/* eslint-disable @typescript-eslint/no-explicit-any */
import express from 'express'

import auth from '../../middleware/auth'
import { UserControllers } from './user.controller'
import { UserRole } from './user.interface'

const router = express.Router()

router.post('/register', UserControllers.createUser)
router.patch('/', auth(UserRole.ADMIN, UserRole.USER), UserControllers.updateProfile)
router.get('/me', auth(UserRole.ADMIN, UserRole.USER), UserControllers.getMe)

export const UserRoutes = router
