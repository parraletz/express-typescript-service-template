import { container } from 'tsyringe'
import { TaskRepository } from '@domain/repositories/TaskRepository'
import { InMemoryTaskRepository } from '@infrastructure/persistence/InMemoryTaskRepository'
import { TaskUseCase } from '@application/useCases/TaskUseCase'
import { TaskController } from '@infrastructure/http/controllers/TaskController'

container.registerSingleton<TaskRepository>('TaskRepository', InMemoryTaskRepository)

container.registerSingleton(TaskUseCase)

container.registerSingleton(TaskController)
