import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { createServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'

// Load environment variables
dotenv.config()

import authRoutes from './routes/auth.js'
import listingRoutes from './routes/listings.js'
import exchangeRoutes from './routes/exchanges.js'
import userRoutes from './routes/users.js'
import adminRoutes from './routes/admin.js'

const app = express()
const httpServer = createServer(app)
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
})

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Routes
app.use('/auth', authRoutes)
app.use('/listings', listingRoutes)
app.use('/exchanges', exchangeRoutes)
app.use('/users', userRoutes)
app.use('/admin', adminRoutes)

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK' })
})

// Socket.io events
io.on('connection', (socket) => {
  console.log('User connected:', socket.id)

  socket.on('join_exchange', (exchangeId) => {
    socket.join(`exchange_${exchangeId}`)
  })

  socket.on('send_message', (data) => {
    io.to(`exchange_${data.exchangeId}`).emit('new_message', data)
  })

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id)
  })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err)
  res.status(err.status || 500).json({
    message: 'Une erreur est survenue, merci de réessayer',
  })
})

// Start server
const PORT = process.env.PORT || 3000
httpServer.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`)
})
