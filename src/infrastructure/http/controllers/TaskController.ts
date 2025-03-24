import { CreateTaskDTO, UpdateTaskDTO } from '@application/dtos/TaskDTO'
import { TaskUseCase } from '@application/useCases/TaskUseCase'
import { logWithCorrelation } from '@shared/logger'
import { Request, Response } from 'express'
import { injectable } from 'tsyringe'
import { AppError } from '../middleware/errorHandler'

@injectable()
export class TaskController {
  constructor(private taskUseCase: TaskUseCase) {}

  /**
   * @swagger
   * /api/tasks:
   *   get:
   *     summary: Get all tasks
   *     tags: [Tasks]
   *     responses:
   *       200:
   *         description: List of tasks
   */
  public async getAllTasks(req: Request, res: Response): Promise<void> {
    logWithCorrelation(
      'info',
      'Getting all tasks',
      req.correlationId,
      'TaskController',
      'getAllTasks',
      {
        method: req.method,
        path: req.path
      }
    )

    const tasks = await this.taskUseCase.getAllTasks()

    logWithCorrelation(
      'info',
      'Tasks retrieved successfully',
      req.correlationId,
      'TaskController',
      'getAllTasks',
      {
        method: req.method,
        path: req.path,
        count: tasks.length
      }
    )

    res.json(tasks)
  }

  /**
   * @swagger
   * /api/tasks/{id}:
   *   get:
   *     summary: Get a task by ID
   *     tags: [Tasks]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Task found
   *       404:
   *         description: Task not found
   */
  public async getTaskById(req: Request, res: Response): Promise<void> {
    const { id } = req.params

    logWithCorrelation(
      'info',
      'Getting task by ID',
      req.correlationId,
      'TaskController',
      'getTaskById',
      {
        method: req.method,
        path: req.path,
        task_id: id
      }
    )

    try {
      const task = await this.taskUseCase.getTaskById(id)

      logWithCorrelation(
        'info',
        'Task retrieved successfully',
        req.correlationId,
        'TaskController',
        'getTaskById',
        {
          method: req.method,
          path: req.path,
          task_id: id
        }
      )

      res.json(task)
    } catch (error) {
      if (error instanceof AppError) {
        logWithCorrelation(
          'warn',
          'Task not found',
          req.correlationId,
          'TaskController',
          'getTaskById',
          {
            method: req.method,
            path: req.path,
            task_id: id,
            error_message: error.message
          }
        )
        res.status(error.statusCode).json({ error: error.message })
      } else {
        throw error
      }
    }
  }

  /**
   * @swagger
   * /api/tasks:
   *   post:
   *     summary: Create a new task
   *     tags: [Tasks]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - title
   *             properties:
   *               title:
   *                 type: string
   *               description:
   *                 type: string
   *     responses:
   *       201:
   *         description: Task created
   *       400:
   *         description: Invalid input
   */
  public async createTask(req: Request, res: Response): Promise<void> {
    logWithCorrelation(
      'info',
      'Creating new task',
      req.correlationId,
      'TaskController',
      'createTask',
      {
        method: req.method,
        path: req.path,
        body: req.body
      }
    )

    try {
      const validatedData = CreateTaskDTO.parse(req.body)
      const task = await this.taskUseCase.createTask(validatedData)

      logWithCorrelation(
        'info',
        'Task created successfully',
        req.correlationId,
        'TaskController',
        'createTask',
        {
          method: req.method,
          path: req.path,
          task_id: task.id
        }
      )

      res.status(201).json(task)
    } catch (error) {
      if (error instanceof AppError) {
        logWithCorrelation(
          'warn',
          'Failed to create task',
          req.correlationId,
          'TaskController',
          'createTask',
          {
            method: req.method,
            path: req.path,
            error_message: error.message
          }
        )
        res.status(error.statusCode).json({ error: error.message })
      } else {
        throw error
      }
    }
  }

  /**
   * @swagger
   * /api/tasks/{id}:
   *   put:
   *     summary: Update a task
   *     tags: [Tasks]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               title:
   *                 type: string
   *               description:
   *                 type: string
   *     responses:
   *       200:
   *         description: Task updated
   *       404:
   *         description: Task not found
   */
  public async updateTask(req: Request, res: Response): Promise<void> {
    const { id } = req.params

    logWithCorrelation('info', 'Updating task', req.correlationId, 'TaskController', 'updateTask', {
      method: req.method,
      path: req.path,
      task_id: id,
      body: req.body
    })

    try {
      const validatedData = UpdateTaskDTO.parse(req.body)
      const task = await this.taskUseCase.updateTask(id, validatedData)

      logWithCorrelation(
        'info',
        'Task updated successfully',
        req.correlationId,
        'TaskController',
        'updateTask',
        {
          method: req.method,
          path: req.path,
          task_id: id
        }
      )

      res.json(task)
    } catch (error) {
      if (error instanceof AppError) {
        logWithCorrelation(
          'warn',
          'Failed to update task',
          req.correlationId,
          'TaskController',
          'updateTask',
          {
            method: req.method,
            path: req.path,
            task_id: id,
            error_message: error.message
          }
        )
        res.status(error.statusCode).json({ error: error.message })
      } else {
        throw error
      }
    }
  }

  /**
   * @swagger
   * /api/tasks/{id}:
   *   delete:
   *     summary: Delete a task
   *     tags: [Tasks]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       204:
   *         description: Task deleted
   *       404:
   *         description: Task not found
   */
  public async deleteTask(req: Request, res: Response): Promise<void> {
    const { id } = req.params

    logWithCorrelation('info', 'Deleting task', req.correlationId, 'TaskController', 'deleteTask', {
      method: req.method,
      path: req.path,
      task_id: id
    })

    try {
      await this.taskUseCase.deleteTask(id)

      logWithCorrelation(
        'info',
        'Task deleted successfully',
        req.correlationId,
        'TaskController',
        'deleteTask',
        {
          method: req.method,
          path: req.path,
          task_id: id
        }
      )

      res.status(204).end()
    } catch (error) {
      if (error instanceof AppError) {
        logWithCorrelation(
          'warn',
          'Failed to delete task',
          req.correlationId,
          'TaskController',
          'deleteTask',
          {
            method: req.method,
            path: req.path,
            task_id: id,
            error_message: error.message
          }
        )
        res.status(error.statusCode).json({ error: error.message })
      } else {
        throw error
      }
    }
  }
}
