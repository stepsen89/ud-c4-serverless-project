import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { getUserId } from '../utils'
import { deleteTodo } from '../../businessLogic/todos'

import { createLogger } from '../../utils/logger'

const logger = createLogger('getTodos')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('Delete Todo Lambda: Processing event:', { event })

    const todoId = event.pathParameters.todoId
    const userId = getUserId(event)

    try {
      await deleteTodo(todoId, userId)
      logger.info('Delete todo lambda success')

      return {
        statusCode: 204,
        headers: {
          'Access-Control-Allow-Origin': '*'
        },
        body: ''
      }
    } catch (e) {
      logger.error('Delete todo lambda failure', { error: e })

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
