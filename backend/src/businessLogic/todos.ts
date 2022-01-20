import { TodoAccess } from '../dataLayer/todosAccess'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
// import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
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

export async function updateTodo(
  updateTodoRequest: UpdateTodoRequest,
  todoId: string,
  userId: string
): Promise<TodoUpdate> {
  return await todosAccess.updateTodo(
    {
      todoId: todoId,
      name: updateTodoRequest.name,
      done: updateTodoRequest.done,
      dueDate: updateTodoRequest.dueDate
    },
    userId
  )
}
