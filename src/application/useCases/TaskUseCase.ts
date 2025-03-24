import { CreateTaskDTO, UpdateTaskDTO } from '@application/dtos/TaskDTO'
import { Task } from '@domain/entities/Task'
import { TaskRepository } from '@domain/repositories/TaskRepository'
import { AppError } from '@infrastructure/http/middleware/errorHandler'
import { inject, injectable } from 'tsyringe'

@injectable()
export class TaskUseCase {
  constructor(
    @inject('TaskRepository')
    private taskRepository: TaskRepository
  ) {}

  async getAllTasks(): Promise<Task[]> {
    return this.taskRepository.findAll()
  }

  async getTaskById(id: string): Promise<Task> {
    const task = await this.taskRepository.findById(id)
    if (!task) {
      throw new AppError('Task not found', 404)
    }
    return task
  }

  async createTask(data: CreateTaskDTO): Promise<Task> {
    const task = new Task({
      title: data.title,
      description: data.description
    })
    return this.taskRepository.save(task)
  }

  async updateTask(id: string, data: UpdateTaskDTO): Promise<Task> {
    const task = await this.taskRepository.findById(id)
    if (!task) {
      throw new AppError('Task not found', 404)
    }

    if (data.title) task.title = data.title
    if (data.description) task.description = data.description
    if (data.completed !== undefined) task.completed = data.completed

    return this.taskRepository.update(task)
  }

  async deleteTask(id: string): Promise<void> {
    const task = await this.taskRepository.findById(id)
    if (!task) {
      throw new AppError('Task not found', 404)
    }
    await this.taskRepository.delete(id)
  }
}
