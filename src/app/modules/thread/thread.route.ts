/* eslint-disable @typescript-eslint/no-explicit-any */
import express from 'express'
import auth from '../../middleware/auth'
import { UserRole } from '../user/user.interface'
import { ThreadControllers } from './thread.controller'

const router = express.Router()

router.post('/', auth(UserRole.USER, UserRole.ADMIN), ThreadControllers.createThread)
router.get('/', ThreadControllers.getThreads)
router.get('/:id', ThreadControllers.getThread)

export const ThreadRoutes = router
