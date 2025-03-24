import { HealthCheck } from '@godaddy/terminus'
import { container } from 'tsyringe'
import { TaskRepository } from '@domain/repositories/TaskRepository'
import { logger } from '@shared/logger'

export const healthChecks: { [key: string]: HealthCheck } = {
  // Verifies that the service is responding
  '/healthz': async () => {
    return { status: 'ok' }
  },

  // Verifies the connection with the repository
  '/ready': async () => {
    try {
      const repository = container.resolve<TaskRepository>('TaskRepository')
      await repository.findAll() // Try to perform a basic operation
      return { status: 'ok', repository: 'connected' }
    } catch (error) {
      logger.error('Repository health check failed:', error)
      throw new Error('Repository health check failed')
    }
  }
}

// Function that runs before the server shuts down
export const onSignal = async () => {
  logger.info('Server is starting cleanup')
  // TODO: Add cleanup logic here
  return Promise.resolve()
}

// Function that runs when the server is ready to accept connections
export const onReady = async () => {
  logger.info('Server is ready to accept connections')
}

// Function that runs when the server is shutting down
export const onShutdown = async () => {
  logger.info('Cleanup finished, server is shutting down')
}
