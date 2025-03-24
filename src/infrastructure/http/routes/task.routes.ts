import { Router } from 'express'
import { container } from 'tsyringe'
import { TaskController } from '../controllers/TaskController'

const taskRoutes = Router()
const taskController = container.resolve(TaskController)

// Bind the methods to preserve 'this' context
taskRoutes.get('/', (req, res) => taskController.getAllTasks(req, res))
taskRoutes.get('/:id', (req, res) => taskController.getTaskById(req, res))
taskRoutes.post('/', (req, res) => taskController.createTask(req, res))
taskRoutes.put('/:id', (req, res) => taskController.updateTask(req, res))
taskRoutes.delete('/:id', (req, res) => taskController.deleteTask(req, res))

export default taskRoutes
