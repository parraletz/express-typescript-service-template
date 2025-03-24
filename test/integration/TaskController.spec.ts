import request from 'supertest'
import { container } from 'tsyringe'
import { Application } from 'express'
import express from 'express'
import { config } from '@infrastructure/config/app.config'
import { TaskRepository } from '@domain/repositories/TaskRepository'
import { InMemoryTaskRepository } from '@infrastructure/persistence/InMemoryTaskRepository'
import { TaskUseCase } from '@application/useCases/TaskUseCase'
import { TaskController } from '@infrastructure/http/controllers/TaskController'
import { errorHandler } from '@infrastructure/http/middleware/errorHandler'

describe('TaskController Integration Tests', () => {
  let app: Application

  beforeEach(async () => {
    // Reset container and create a new Express app
    container.reset()
    app = express()

    // Setup basic middleware
    app.use(express.json())
    app.use(express.urlencoded({ extended: true }))

    // Setup dependencies
    const repository = new InMemoryTaskRepository()
    container.registerInstance<TaskRepository>('TaskRepository', repository)
    container.registerInstance(TaskUseCase, new TaskUseCase(repository))
    const taskController = container.resolve(TaskController)

    // Setup routes
    const router = express.Router()
    router.post('/', taskController.createTask.bind(taskController))
    router.get('/', taskController.getAllTasks.bind(taskController))
    router.get('/:id', taskController.getTaskById.bind(taskController))
    router.put('/:id', taskController.updateTask.bind(taskController))
    router.delete('/:id', taskController.deleteTask.bind(taskController))
    app.use(`${config.apiPrefix}/tasks`, router)

    // Setup error handler
    app.use(errorHandler)
  })

  describe('POST /api/tasks', () => {
    it('should create a new task', async () => {
      const taskData = {
        title: 'Integration Test Task',
        description: 'Test Description'
      }

      const response = await request(app).post(`${config.apiPrefix}/tasks`).send(taskData)

      expect(response.status).toBe(201)
      expect(response.body).toHaveProperty('id')
      expect(response.body.title).toBe(taskData.title)
      expect(response.body.description).toBe(taskData.description)
    })

    it('should return 400 when title is missing', async () => {
      const response = await request(app)
        .post(`${config.apiPrefix}/tasks`)
        .send({ description: 'Test Description' })

      expect(response.status).toBe(400)
      expect(response.body).toHaveProperty('error')
    })
  })

  describe('GET /api/tasks', () => {
    it('should return empty array when no tasks exist', async () => {
      const response = await request(app).get(`${config.apiPrefix}/tasks`)

      expect(response.status).toBe(200)
      expect(response.body).toEqual([])
    })

    it('should return all tasks', async () => {
      // Create a task first
      const taskData = {
        title: 'Test Task',
        description: 'Test Description'
      }

      await request(app).post(`${config.apiPrefix}/tasks`).send(taskData)

      const response = await request(app).get(`${config.apiPrefix}/tasks`)

      expect(response.status).toBe(200)
      expect(Array.isArray(response.body)).toBe(true)
      expect(response.body).toHaveLength(1)
      expect(response.body[0].title).toBe(taskData.title)
    })
  })

  describe('GET /api/tasks/:id', () => {
    it('should return task by id', async () => {
      // Create a task first
      const taskData = {
        title: 'Test Task',
        description: 'Test Description'
      }

      const createResponse = await request(app).post(`${config.apiPrefix}/tasks`).send(taskData)

      const response = await request(app).get(`${config.apiPrefix}/tasks/${createResponse.body.id}`)

      expect(response.status).toBe(200)
      expect(response.body.id).toBe(createResponse.body.id)
      expect(response.body.title).toBe(taskData.title)
    })

    it('should return 404 when task does not exist', async () => {
      const response = await request(app).get(`${config.apiPrefix}/tasks/non-existent-id`)

      expect(response.status).toBe(404)
    })
  })

  describe('PUT /api/tasks/:id', () => {
    it('should update task', async () => {
      // Create a task first
      const taskData = {
        title: 'Test Task',
        description: 'Test Description'
      }

      const createResponse = await request(app).post(`${config.apiPrefix}/tasks`).send(taskData)

      const updateData = {
        title: 'Updated Task'
      }

      const response = await request(app)
        .put(`${config.apiPrefix}/tasks/${createResponse.body.id}`)
        .send(updateData)

      expect(response.status).toBe(200)
      expect(response.body.title).toBe(updateData.title)
      expect(response.body.description).toBe(taskData.description)
    })

    it('should return 404 when updating non-existent task', async () => {
      const response = await request(app)
        .put(`${config.apiPrefix}/tasks/non-existent-id`)
        .send({ title: 'Updated Task' })

      expect(response.status).toBe(404)
    })
  })

  describe('DELETE /api/tasks/:id', () => {
    it('should delete task', async () => {
      // Create a task first
      const taskData = {
        title: 'Test Task',
        description: 'Test Description'
      }

      const createResponse = await request(app).post(`${config.apiPrefix}/tasks`).send(taskData)

      const response = await request(app).delete(
        `${config.apiPrefix}/tasks/${createResponse.body.id}`
      )

      expect(response.status).toBe(204)

      // Verify task is deleted
      const getResponse = await request(app).get(
        `${config.apiPrefix}/tasks/${createResponse.body.id}`
      )
      expect(getResponse.status).toBe(404)
    })

    it('should return 404 when deleting non-existent task', async () => {
      const response = await request(app).delete(`${config.apiPrefix}/tasks/non-existent-id`)

      expect(response.status).toBe(404)
    })
  })
})
