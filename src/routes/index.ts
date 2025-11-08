import { Router } from 'express'
import { AdminRoutes } from '../app/modules/admin/admin.route'
import { AuthRoutes } from '../app/modules/auth/auth.route'
import { NotificationRoute } from '../app/modules/notification/notification.route'
import { PostRoutes } from '../app/modules/post/post.route'
import { ThreadRoutes } from '../app/modules/thread/thread.route'
import { UserRoutes } from '../app/modules/user/user.route'

const router = Router()

const moduleRoutes = [
  {
    path: '/users',
    route: UserRoutes
  },
  {
    path: '/auth',
    route: AuthRoutes
  },
  {
    path: '/threads',
    route: ThreadRoutes
  },
  {
    path: '/posts',
    route: PostRoutes
  },
  {
    path: '/admin',
    route: AdminRoutes
  },
  {
    path: '/notifications',
    route: NotificationRoute
  }
]

moduleRoutes.forEach(route => router.use(route.path, route.route))

export default router
