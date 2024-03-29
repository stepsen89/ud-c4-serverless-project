import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { getUserId } from '../utils'
import { getAllTodosByUserId } from '../../businessLogic/todos'

import { createLogger } from '../../utils/logger'

const logger = createLogger('getTodos')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('GetTodos: Processing event:', { event })

    const userId = getUserId(event)
    let items

    try {
      items = await getAllTodosByUserId(userId)
      logger.info('GetTodos: Fetching todos successfully returned:', { items })

      return {
        statusCode: 200,
        body: JSON.stringify({
          items: items
        })
      }
    } catch (error) {
      logger.error('GetTodos: Failure:', { error })

      return {
        statusCode: 500,
        body: JSON.stringify({
          error: error
        })
      }
    }
  }
)

handler.use(
  cors({
    credentials: true
  })
)
