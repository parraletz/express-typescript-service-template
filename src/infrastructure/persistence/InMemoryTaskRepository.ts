import { injectable } from 'tsyringe'
import { Task } from '@domain/entities/Task'
import { TaskRepository } from '@domain/repositories/TaskRepository'

@injectable()
export class InMemoryTaskRepository implements TaskRepository {
  private tasks: Map<string, Task> = new Map()

  async findAll(): Promise<Task[]> {
    return Array.from(this.tasks.values())
  }

  async findById(id: string): Promise<Task | null> {
    return this.tasks.get(id) || null
  }

  async save(task: Task): Promise<Task> {
    this.tasks.set(task.id, task)
    return task
  }

  async update(task: Task): Promise<Task> {
    const existingTask = await this.findById(task.id)
    if (!existingTask) {
      throw new Error('Task not found')
    }
    this.tasks.set(task.id, task)
    return task
  }

  async delete(id: string): Promise<void> {
    this.tasks.delete(id)
  }

  // Method for testing purposes
  clear(): void {
    this.tasks.clear()
  }
}
