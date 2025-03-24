import { container } from 'tsyringe'
import { TaskUseCase } from '@application/useCases/TaskUseCase'
import { TaskRepository } from '@domain/repositories/TaskRepository'
import { AppError } from '@infrastructure/http/middleware/errorHandler'

describe('TaskUseCase', () => {
  let taskUseCase: TaskUseCase
  let taskRepository: TaskRepository // eslint-disable-line @typescript-eslint/no-unused-vars

  beforeEach(() => {
    taskUseCase = container.resolve(TaskUseCase)
    taskRepository = container.resolve<TaskRepository>('TaskRepository')
  })

  describe('createTask', () => {
    it('should create a task successfully', async () => {
      const taskData = {
        title: 'Test Task',
        description: 'Test Description'
      }

      const task = await taskUseCase.createTask(taskData)

      expect(task).toBeDefined()
      expect(task.id).toBeDefined()
      expect(task.title).toBe(taskData.title)
      expect(task.description).toBe(taskData.description)
      expect(task.completed).toBe(false)
    })
  })

  describe('getAllTasks', () => {
    it('should return empty array when no tasks exist', async () => {
      const tasks = await taskUseCase.getAllTasks()
      expect(tasks).toEqual([])
    })

    it('should return all created tasks', async () => {
      const taskData = { title: 'Test Task', description: 'Test Description' }
      await taskUseCase.createTask(taskData)
      await taskUseCase.createTask({ ...taskData, title: 'Test Task 2' })

      const tasks = await taskUseCase.getAllTasks()
      expect(tasks).toHaveLength(2)
    })
  })

  describe('getTaskById', () => {
    it('should return task when it exists', async () => {
      const taskData = { title: 'Test Task', description: 'Test Description' }
      const createdTask = await taskUseCase.createTask(taskData)

      const task = await taskUseCase.getTaskById(createdTask.id)
      expect(task).toBeDefined()
      expect(task.id).toBe(createdTask.id)
    })

    it('should throw AppError when task does not exist', async () => {
      await expect(taskUseCase.getTaskById('non-existent-id')).rejects.toThrow(AppError)
    })
  })

  describe('updateTask', () => {
    it('should update task successfully', async () => {
      const taskData = { title: 'Test Task', description: 'Test Description' }
      const createdTask = await taskUseCase.createTask(taskData)

      const updateData = { title: 'Updated Title' }
      const updatedTask = await taskUseCase.updateTask(createdTask.id, updateData)

      expect(updatedTask.title).toBe(updateData.title)
      expect(updatedTask.description).toBe(taskData.description)
    })

    it('should throw AppError when updating non-existent task', async () => {
      await expect(
        taskUseCase.updateTask('non-existent-id', { title: 'Updated Title' })
      ).rejects.toThrow(AppError)
    })
  })

  describe('deleteTask', () => {
    it('should delete task successfully', async () => {
      const taskData = { title: 'Test Task', description: 'Test Description' }
      const createdTask = await taskUseCase.createTask(taskData)

      await taskUseCase.deleteTask(createdTask.id)

      await expect(taskUseCase.getTaskById(createdTask.id)).rejects.toThrow(AppError)
    })

    it('should throw AppError when deleting non-existent task', async () => {
      await expect(taskUseCase.deleteTask('non-existent-id')).rejects.toThrow(AppError)
    })
  })
})
