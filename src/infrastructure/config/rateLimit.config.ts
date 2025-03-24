import { RateLimitRequestHandler } from 'express-rate-limit'
import rateLimit from 'express-rate-limit'
import { config } from './app.config'
import { logger } from '@shared/logger'

export const rateLimitConfig = (): RateLimitRequestHandler => {
  const limiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    limit: config.rateLimit.maxRequests,
    message: {
      status: 'error',
      message: 'Too many requests from this IP, please try again later.'
    },
    standardHeaders: true, // Return `RateLimit-*` headers
    legacyHeaders: false // Disabled headers `X-RateLimit-*`
  })

  if (config.isDev) {
    logger.debug(
      `Rate limit configured: ${config.rateLimit.maxRequests} requests per ${config.rateLimit.windowMs}ms`
    )
  }

  return limiter
}
