import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'
import winston from 'winston'

import authRoutes from './routes/auth.routes.js'
import customerRoutes from './routes/customer.routes.js'
import repairRoutes from './routes/repair.routes.js'
import statRoutes from './routes/stats.routes.js'

import errorHandlerMiddleware from './middleware/errorHandler.middleware.js'
import { apiStatus } from './controllers/status.controller.js'
import connectDB from './config/database.js'
import gracefulShutdown from './utils/gracefulShutdown.js'

dotenv.config()
const PORT = process.env.PORT || 3000

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
    new winston.transports.File({
      filename: 'error.log',
      level: 'error',
    }),
    new winston.transports.File({
      filename: 'combined.log',
    }),
  ],
})

const createApp = () => {
  const app = express()

  app.use(helmet())
  app.disable('x-powered-by')

  const ALLOWED_ORIGINS = ['http://localhost:3000', 'http://localhost:5173', process.env.FRONTEND_URL].filter(Boolean)

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || ALLOWED_ORIGINS.includes(origin)) {
          callback(null, true)
        } else {
          callback(new Error('Not allowed by CORS'))
        }
      },
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Origin', 'X-Requested-With', 'Accept', 'Authorization'],
      credentials: true,
      optionsSuccessStatus: 200,
    })
  )

  app.use(
    express.json({
      limit: '10kb',
      verify: (req, res, buf) => {
        req.rawBody = buf.toString()
      },
    })
  )
  app.use(express.urlencoded({ extended: true, limit: '10kb' }))
  app.use(cookieParser(process.env.COOKIE_SECRET))

  // Routes
  app.get('/', apiStatus)
  app.use('/api/repair/auth', authRoutes)
  app.use('/api/repair/customer', customerRoutes)
  app.use('/api/repair/repair', repairRoutes)
  app.use('/api/repair/stats', statRoutes)

  app.use(errorHandlerMiddleware)

  return app
}

const startServer = async () => {
  try {
    await connectDB()
    logger.info('Database connected successfully')

    const app = createApp()

    const server = app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`)
    })

    gracefulShutdown(server, {
      logger,
      database: { disconnect: connectDB.disconnect },
    })
  } catch (error) {
    logger.error('Failed to start server', { error })
    process.exit(1)
  }
}

startServer()

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', { error })
  process.exit(1)
})
