import { TodoAccess } from '../dataLayer/todosAccess'
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
// import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
// import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
// import * as createError from 'http-errors'

const todosAccess = new TodoAccess()

export async function getAllTodosByUserId(userId: string): Promise<TodoItem[]> {
  return todosAccess.getAllTodosByUserId(userId)
}

export async function createTodo(
  createTodoRequest: CreateTodoRequest,
  userId: string
): Promise<TodoItem> {
  const itemId = uuid.v4()

  return await todosAccess.createTodo({
    todoId: itemId,
    userId: userId,
    name: createTodoRequest.name,
    description: createTodoRequest.description,
    dueDate: createTodoRequest.dueDate,
    done: false,
    createdAt: new Date().toISOString()
  })
}
