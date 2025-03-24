import { v4 as uuidv4 } from 'uuid'

interface TaskProps {
  id?: string
  title: string
  description: string
  completed?: boolean
  createdAt?: Date
  updatedAt?: Date
}

export class Task {
  public readonly id: string
  public title: string
  public description: string
  public completed: boolean
  public readonly createdAt: Date
  public updatedAt: Date

  constructor(props: TaskProps) {
    this.id = props.id || uuidv4()
    this.title = props.title
    this.description = props.description
    this.completed = props.completed || false
    this.createdAt = props.createdAt || new Date()
    this.updatedAt = props.updatedAt || new Date()
  }

  public markAsCompleted(): void {
    this.completed = true
    this.updatedAt = new Date()
  }

  public update(title: string, description: string): void {
    this.title = title
    this.description = description
    this.updatedAt = new Date()
  }
}
