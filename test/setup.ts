import 'reflect-metadata'
import { container } from 'tsyringe'
import { TaskRepository } from '@domain/repositories/TaskRepository'
import { InMemoryTaskRepository } from '@infrastructure/persistence/InMemoryTaskRepository'
import { TaskUseCase } from '@application/useCases/TaskUseCase'
import { TaskController } from '@infrastructure/http/controllers/TaskController'
import { beforeEach } from '@jest/globals'

// Reset container and repository before each test
beforeEach(() => {
  // Clear all instances
  container.clearInstances()

  // Register test dependencies
  container.registerSingleton<TaskRepository>('TaskRepository', InMemoryTaskRepository)
  container.registerSingleton(TaskUseCase)
  container.registerSingleton(TaskController)

  // Clear the repository
  const repository = container.resolve<TaskRepository>('TaskRepository')
  if (repository instanceof InMemoryTaskRepository) {
    repository.clear()
  }
})
