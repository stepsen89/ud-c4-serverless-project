import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { updateTodo } from '../../businessLogic/todos'
import { getUserId } from '../utils'

import { createLogger } from '../../utils/logger'

const logger = createLogger('getTodos')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('UpdateTodo: Processing event:', { event })

    const todoId = event.pathParameters.todoId
    const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)
    const userId = getUserId(event)

    try {
      const updatedItem = await updateTodo(updatedTodo, todoId, userId)
      logger.info('Update todo lambda success', { updatedItem })

      return {
        statusCode: 200,
        body: JSON.stringify({
          items: updatedItem
        })
      }
    } catch (e) {
      logger.error('Update todo lambda failure', { error: e })

      return {
        statusCode: 500,
        body: `error ${e}`
      }
    }
  }
)

handler.use(httpErrorHandler()).use(
  cors({
    credentials: true
  })
)
