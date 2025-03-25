import express, { Application } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import swaggerJsdoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'
import { createTerminus } from '@godaddy/terminus'
import { config } from '@infrastructure/config/app.config'
import { swaggerOptions } from '@infrastructure/config/swagger.config'
import { rateLimitConfig } from '@infrastructure/config/rateLimit.config'
import { errorHandler } from './middleware/errorHandler'
import { correlationIdMiddleware } from './middleware/correlationId'
import { logger } from '@shared/logger'
import { injectable } from 'tsyringe'
import { TaskRepository } from '@domain/repositories/TaskRepository'
import { InMemoryTaskRepository } from '@infrastructure/persistence/InMemoryTaskRepository'
import { TaskUseCase } from '@application/useCases/TaskUseCase'
import { TaskController } from './controllers/TaskController'
import { container } from 'tsyringe'
import { healthChecks, onSignal, onShutdown } from './health/healthChecks'
import { Server as HttpServer } from 'http'

@injectable()
export class Server {
  private app: Application
  private server: HttpServer

  constructor() {
    this.app = express()
    this.server = new HttpServer(this.app)
    this.setupMiddleware()
    this.setupDependencies()
    this.setupRoutes()
    this.setupErrorHandler()
    this.setupHealthChecks()
  }

  private setupMiddleware(): void {
    // Correlation ID middleware
    this.app.use(correlationIdMiddleware)

    // Security
    this.app.use(
      helmet({
        contentSecurityPolicy: {
          directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", 'data:', 'https:']
          }
        }
      })
    )
    this.app.use(cors())

    // Rate limiting
    this.app.use(rateLimitConfig())

    // Body parsing
    this.app.use(express.json())
    this.app.use(express.urlencoded({ extended: true }))

    // Swagger documentation
    const specs = swaggerJsdoc(swaggerOptions)
    this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs))

    // Health check
  }

  private setupDependencies(): void {
    container.registerSingleton<TaskRepository>('TaskRepository', InMemoryTaskRepository)
    container.registerSingleton(TaskUseCase)
    container.registerSingleton(TaskController)
  }

  private setupRoutes(): void {
    const taskRoutes = require('./routes/task.routes').default // eslint-disable-line @typescript-eslint/no-require-imports
    this.app.use(`${config.apiPrefix}/tasks`, taskRoutes)
  }

  private setupErrorHandler(): void {
    this.app.use(errorHandler)
  }

  private setupHealthChecks(): void {
    createTerminus(this.server, {
      healthChecks,
      onSignal,
      onShutdown,
      logger: (msg, err) => {
        if (err) {
          logger.error(msg, err)
        } else {
          logger.info(msg)
        }
      }
    })
  }

  public getApp(): Application {
    return this.app
  }

  public start(): void {
    this.server.listen(config.port, () => {
      logger.info(`🚀 Server running on port ${config.port}`)
      logger.info(`📚 API Documentation available at http://localhost:${config.port}/api-docs`)
      logger.info(`🏥 Health check available at http://localhost:${config.port}/healthz`)
      logger.info(`✅ Readiness check available at http://localhost:${config.port}/ready`)
    })
  }
}
