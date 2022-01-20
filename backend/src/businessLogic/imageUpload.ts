import { ImageUploadAccess } from '../dataLayer/imageUploadAccess'
import { TodoAccess } from '../dataLayer/todosAccess'

import { createLogger } from '../utils/logger'

const logger = createLogger('todosBusinessLogic')

const imageUploadAccess = new ImageUploadAccess()
const todosAccess = new TodoAccess()

export async function getAttachmentUrl(
  todoId: string,
  userId: string
): Promise<string> {
  logger.info('Business Logic: Get Attachment Url')

  const attachmentUrl = await imageUploadAccess.getAttachmentUrl(todoId)

  await todosAccess.updateTodoAttachmentUrl(todoId, userId)

  logger.info('Business Logic: Get Attachment Url url result', {
    attachmentUrl
  })

  return attachmentUrl
}
