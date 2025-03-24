import 'reflect-metadata'
import './infrastructure/config/container'
import { container } from 'tsyringe'
import { Server } from '@infrastructure/http/Server'
import { logger } from '@shared/logger'

async function bootstrap(): Promise<void> {
  try {
    const server = container.resolve(Server)
    await server.start()
  } catch (error) {
    logger.error('Failed to bootstrap application:', error)
    process.exit(1)
  }
}

bootstrap()
