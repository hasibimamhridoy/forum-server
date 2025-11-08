import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import helmet from 'helmet'
import http from 'http'
import { Server } from 'socket.io'
import { routeErrorHandle } from './app/middleware/404RouteErrorHandle'
import errorHandler from './app/middleware/errorHandler'
import router from './routes'
import { setupSocketIO } from './sockets/sockets'
dotenv.config()

const app = express()
const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:3000', 'https://chatty-phi.vercel.app', 'https://forum.machvat.com'], // Allow your front-end origin
    credentials: true
  }
})

// Middleware
app.use(
  cors({
    origin: ['http://localhost:3000', 'https://chatty-phi.vercel.app', 'https://forum.machvat.com'],
    credentials: true
  })
)

// Middleware
app.use(helmet())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(express.urlencoded())
app.use('/api/v1', router)

setupSocketIO(io)

//global
app.use(errorHandler)

// 404 Route Handler
app.use(routeErrorHandle)

export { server }
