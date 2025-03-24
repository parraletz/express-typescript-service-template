import { Request, Response, NextFunction } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { logger } from '@shared/logger'

declare global {
  namespace Express {
    interface Request {
      correlationId: string
    }
  }
}

export const correlationIdMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  // Use the correlation ID from the header if it exists, or generate a new one
  const correlationId = (req.headers['x-correlation-id'] as string) || uuidv4()

  // Add the correlation ID to the request
  req.correlationId = correlationId

  // Add the correlation ID to the response header
  res.setHeader('x-correlation-id', correlationId)

  // Log of the incoming request
  logger.log({
    level: 'http',
    message: 'Incoming HTTP request',
    correlation_id: correlationId,
    request: {
      method: req.method,
      path: req.path,
      remote_address: req.ip,
      user_agent: req.get('user-agent')
    }
  })

  // Log of the outgoing response
  const originalSend = res.send
  res.send = function (body: any): Response {
    logger.log({
      level: 'http',
      message: 'Outgoing HTTP response',
      correlation_id: correlationId,
      response: {
        status_code: res.statusCode,
        content_length: Buffer.from(JSON.stringify(body)).length
      }
    })
    return originalSend.call(this, body)
  }

  next()
}
