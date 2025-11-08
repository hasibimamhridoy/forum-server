/* eslint-disable @typescript-eslint/no-explicit-any */
import express from 'express'
import auth from '../../middleware/auth'
import { UserRole } from '../user/user.interface'
import { PostControllers } from './post.controller'

const router = express.Router()

router.post('/', auth(UserRole.USER, UserRole.ADMIN), PostControllers.createPost)
router.get('/thread/:threadId', PostControllers.getPosts)
router.patch('/:postId', auth(UserRole.USER, UserRole.ADMIN), PostControllers.updatePost)
router.delete('/:postId', auth(UserRole.USER, UserRole.ADMIN), PostControllers.deletePost)

export const PostRoutes = router
