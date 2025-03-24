import { z } from 'zod'

export const CreateTaskDTO = z.object({
  title: z.string(),
  description: z.string()
})

export const UpdateTaskDTO = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  completed: z.boolean().optional()
})

export type CreateTaskDTO = z.infer<typeof CreateTaskDTO>
export type UpdateTaskDTO = z.infer<typeof UpdateTaskDTO>
