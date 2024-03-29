import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { getAttachmentUrl } from '../../businessLogic/imageUpload'
import { getUserId } from '../utils'

import { createLogger } from '../../utils/logger'

const logger = createLogger('generateUploadUrl')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('GenerateUploadUrl Lambda: Processing event :', { event })

    const todoId = event.pathParameters.todoId
    const userId = getUserId(event)

    const attachmentUrl = await getAttachmentUrl(todoId, userId)

    try {
      logger.info('GenerateUploadUrl Lambda: Attachment Url Success :', {
        attachmentUrl
      })

      return {
        statusCode: 201,
        body: JSON.stringify({
          uploadUrl: attachmentUrl
        })
      }
    } catch (error) {
      logger.info('GenerateUploadUrl Lambda: Attachment Url Error :', {
        error
      })
    }
  }
)

handler.use(httpErrorHandler()).use(
  cors({
    credentials: true
  })
)
