import winston from 'winston'
import { config } from '@infrastructure/config/app.config'
import path from 'path'

// Tipos para el logging estructurado
interface LogInfo extends winston.Logform.TransformableInfo {
  timestamp?: string
  correlation_id?: string
  message: unknown
  source?: {
    host: string
    application: string
    class: string
    method: string
  }
  [key: string]: any
}

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4
}

// Formato para producción: JSON en una sola línea sin colores
const productionFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DDTHH:mm:ss.SSSZ'
  }),
  winston.format.errors({ stack: true }),
  winston.format(info => {
    const formatted: any = {
      level: info.level.toUpperCase(),
      time: info.timestamp,
      message: info.message,
      source: {
        host: process.env.HOSTNAME || 'unknown',
        application: 'dummy-ts-api',
        class: info.class || 'unknown',
        method: info.method || 'unknown'
      }
    }

    // Agregar correlation_id si existe
    if (info.correlation_id) {
      formatted.correlation_id = info.correlation_id
    }

    // Agregar otros metadatos que no sean campos estándar
    Object.keys(info).forEach(key => {
      if (
        ![
          'level',
          'time',
          'message',
          'source',
          'timestamp',
          'correlation_id',
          'class',
          'method'
        ].includes(key)
      ) {
        formatted[key] = info[key]
      }
    })

    return formatted
  })(),
  winston.format.json()
)

// Formato para desarrollo: Pretty print con colores
const developmentFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss.SSS'
  }),
  winston.format.colorize(),
  winston.format.printf((info: LogInfo) => {
    const metadata = Object.keys(info)
      .filter(
        key =>
          !['timestamp', 'correlation_id', 'level', 'message', 'class', 'method'].includes(key) &&
          key !== 'level'
      )
      .reduce(
        (acc, key) => {
          acc[key] = info[key]
          return acc
        },
        {} as Record<string, any>
      )

    const source = `[${info.class || 'unknown'}::${info.method || 'unknown'}]`
    const metadataStr = Object.keys(metadata).length ? `\n${JSON.stringify(metadata, null, 2)}` : ''

    return `${info.timestamp} [${info.correlation_id || 'no-correlation-id'}] ${info.level} ${source}: ${String(
      info.message
    )}${metadataStr}`
  })
)

// Configuración base para la consola
const consoleTransport = new winston.transports.Console({
  format: config.isDev ? developmentFormat : productionFormat
})

// Array de transportes
const transports: winston.transport[] = [consoleTransport]

// Si no estamos en un contenedor y estamos en producción, agregamos el transporte de archivos
if (!config.isContainerized && config.isProd) {
  // Crear transporte para todos los logs (siempre en formato JSON de una línea)
  transports.push(
    new winston.transports.File({
      filename: path.join(config.logPath, 'all.log'),
      format: productionFormat
    })
  )

  // Crear transporte solo para errores (siempre en formato JSON de una línea)
  transports.push(
    new winston.transports.File({
      filename: path.join(config.logPath, 'error.log'),
      level: 'error',
      format: productionFormat
    })
  )
}

// Crear el logger
export const logger = winston.createLogger({
  level: config.isDev ? 'debug' : 'info',
  levels,
  format: config.isDev ? developmentFormat : productionFormat,
  transports
})

// Helper para crear logs con información de la fuente
export const logWithSource = (
  level: keyof typeof levels,
  message: string,
  className: string,
  methodName: string,
  metadata?: Record<string, any>
) => {
  logger.log({
    level,
    message,
    class: className,
    method: methodName,
    ...metadata
  })
}

// Helper para crear logs con correlation ID y fuente
export const logWithCorrelation = (
  level: keyof typeof levels,
  message: string,
  correlationId: string,
  className: string,
  methodName: string,
  metadata?: Record<string, any>
) => {
  logger.log({
    level,
    message,
    correlation_id: correlationId,
    class: className,
    method: methodName,
    ...metadata
  })
}

// Si estamos en desarrollo, mostrar mensaje de configuración
if (config.isDev) {
  logger.debug('Logging configuration:', {
    environment: config.env,
    containerized: config.isContainerized,
    log_path: config.logPath,
    log_level: config.isDev ? 'debug' : 'info',
    class: 'Logger',
    method: 'initialize'
  })
}
