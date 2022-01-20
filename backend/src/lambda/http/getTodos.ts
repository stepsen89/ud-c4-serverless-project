import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { getUserId } from '../utils'
import { getAllTodosByUserId } from '../../businessLogic/todos'

import { createLogger } from '../../utils/logger'

const logger = createLogger('getTodos')

// TODO: Get all TODO items for a current user
export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('GetTodos: Processing event:', { event })

    const userId = getUserId(event)
    let items

    try {
      items = await getAllTodosByUserId(userId)
    } catch (error) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: error
        })
      }
    }
    return {
      statusCode: 200,
      body: JSON.stringify({
        items: items
      })
    }
  }
)

handler.use(
  cors({
    credentials: true
  })
)
