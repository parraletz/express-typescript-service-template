import { config } from './app.config'

export const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'TypeScript DDD API',
      version: '1.0.0',
      description: 'API Documentation using Swagger',
      contact: {
        name: 'API Support'
      }
    },
    servers: [
      {
        url: `http://localhost:${config.port}${config.apiPrefix}`,
        description: 'Local server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  },
  apis: ['./src/infrastructure/http/routes/*.ts', './src/infrastructure/http/controllers/*.ts']
}
