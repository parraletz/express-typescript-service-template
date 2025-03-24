import dotenv from 'dotenv'
import { z } from 'zod'

dotenv.config()

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3000'),
  API_PREFIX: z.string().default('/api'),
  RATE_LIMIT_WINDOW_MS: z.string().default('900000'),
  RATE_LIMIT_MAX_REQUESTS: z.string().default('100'),
  IS_CONTAINERIZED: z.string().default('true'),
  LOG_PATH: z.string().default('./logs')
})

const envValidation = envSchema.safeParse(process.env)

if (!envValidation.success) {
  console.error('❌ Invalid environment variables:', envValidation.error.format())
  throw new Error('Invalid environment variables')
}

export const config = {
  env: envValidation.data.NODE_ENV,
  port: parseInt(envValidation.data.PORT, 10),
  apiPrefix: envValidation.data.API_PREFIX,
  isDev: envValidation.data.NODE_ENV === 'development',
  isProd: envValidation.data.NODE_ENV === 'production',
  isTest: envValidation.data.NODE_ENV === 'test',
  isContainerized: envValidation.data.IS_CONTAINERIZED === 'true',
  logPath: envValidation.data.LOG_PATH,
  rateLimit: {
    windowMs: parseInt(envValidation.data.RATE_LIMIT_WINDOW_MS, 10),
    maxRequests: parseInt(envValidation.data.RATE_LIMIT_MAX_REQUESTS, 10)
  }
}
