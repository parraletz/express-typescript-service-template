import { Request, Response, NextFunction } from 'express'
import { ZodError } from 'zod'
import { logger } from '@shared/logger'
import { config } from '@infrastructure/config/app.config'

export class AppError extends Error {
  constructor(
    public readonly message: string,
    public readonly statusCode: number = 500,
    public readonly isOperational: boolean = true
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const correlationId = req.correlationId

  if (error instanceof AppError) {
    if (error.isOperational) {
      logger.warn('Operational error:', {
        correlation_id: correlationId,
        error_name: error.name,
        error_message: error.message,
        status_code: error.statusCode,
        path: req.path,
        method: req.method
      })
    } else {
      logger.error('Application error:', {
        correlation_id: correlationId,
        error_name: error.name,
        error_message: error.message,
        status_code: error.statusCode,
        path: req.path,
        method: req.method,
        stack: error.stack
      })
    }
    res.status(error.statusCode).json({ error: error.message })
    return
  }

  if (error instanceof ZodError) {
    logger.debug('Validation error:', {
      correlation_id: correlationId,
      error_name: 'ZodError',
      validation_errors: error.errors,
      path: req.path,
      method: req.method
    })
    res.status(400).json({ error: error.errors })
    return
  }

  logger.error('Unhandled error:', {
    correlation_id: correlationId,
    error_name: error.name,
    error_message: error.message,
    path: req.path,
    method: req.method,
    stack: error.stack
  })

  // En desarrollo, enviamos el stack trace
  if (config.isDev) {
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
      stack: error.stack
    })
  } else {
    // En producción, solo enviamos un mensaje genérico
    res.status(500).json({ error: 'Internal server error' })
  }
}
