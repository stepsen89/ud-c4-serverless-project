import { ImageUploadAccess } from '../dataLayer/imageUploadAccess'
import { TodoAccess } from '../dataLayer/todosAccess'

import { createLogger } from '../utils/logger'

const logger = createLogger('todosBusinessLogic')

const imageUploadAccess = new ImageUploadAccess()
const todosAccess = new TodoAccess()

export async function getAttachementUrl(
  todoId: string,
  userId: string
): Promise<string> {
  logger.info('Business Logic: Get Attachement Url')

  const attachementUrl = await imageUploadAccess.getAttachementUrl(todoId)

  await todosAccess.updateTodoAttachementUrl(todoId, userId)

  console.log(attachementUrl)

  return attachementUrl
}
