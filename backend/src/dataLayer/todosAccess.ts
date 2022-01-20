import * as AWS from 'aws-sdk'
const AWSXRay = require('aws-xray-sdk')

import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'
import { createLogger } from '../utils/logger'

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TodosAccess')

export class TodoAccess {
  constructor(
    private readonly docClient = createDynamoDBClient(),
    private readonly s3Client = new AWS.S3({ signatureVersion: 'v4' }),
    private readonly bucket = process.env.ATTACHMENT_S3_BUCKET,
    private readonly todosTable = process.env.TODOS_TABLE // private readonly todosIndex = process.env.TODOS_CREATED_AT_INDEX
  ) {}

  async getAllTodosByUserId(userId: string): Promise<TodoItem[]> {
    logger.info('DataLayer: Get All Todos By User id')

    const result = await this.docClient
      .query({
        TableName: this.todosTable,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId
        }
      })
      .promise()

    const items = result.Items
    logger.info('DataLayer: Get All Todos By User id: ', {
      items
    })
    return items as TodoItem[]
  }

  async createTodo(item: TodoItem): Promise<TodoItem> {
    logger.info('DataLayer: create todo', { item })
    await this.docClient
      .put({
        TableName: this.todosTable,
        Item: item
      })
      .promise()

    return item
  }

  async updateTodo(item: TodoUpdate, userId: string): Promise<TodoUpdate> {
    logger.info('DataLayer: update todo', { item })

    const params = {
      TableName: this.todosTable,
      Key: {
        userId: userId,
        todoId: item.todoId
      },
      ExpressionAttributeNames: {
        '#todo_name': 'name'
      },
      ExpressionAttributeValues: {
        ':name': item.name,
        ':dueDate': item.dueDate,
        ':done': item.done
      },
      UpdateExpression:
        'SET #todo_name = :name, dueDate = :dueDate, done = :done',
      ReturnValues: 'ALL_NEW'
    }

    const result = await this.docClient.update(params).promise()
    logger.info('DataLayer: update item result', { result })

    return result
  }

  async updateTodoAttachementUrl(
    todoId: string,
    userId: string
  ): Promise<TodoItem> {
    logger.info('DataLayer: update todo with attachment url', { todoId })

    const todoAttachementUrl = `https://${this.bucket}.s3.amazonaws.com/${todoId}`

    const params = {
      TableName: this.todosTable,
      Key: {
        userId: userId,
        todoId: todoId
      },
      ExpressionAttributeNames: {
        '#todo_attachmentUrl': 'attachmentUrl'
      },
      ExpressionAttributeValues: {
        ':attachmentUrl': todoAttachementUrl
      },
      UpdateExpression: 'SET #todo_attachmentUrl = :attachmentUrl',
      ReturnValues: 'ALL_NEW'
    }

    const result = await this.docClient.update(params).promise()

    logger.info(`Update statement has completed without error`, {
      result: result
    })
    return result
  }

  async deleteTodo(todoId: string, userId: string) {
    logger.info('DataLayer: delete todo ', { todoId })

    let params = {
      TableName: this.todosTable,
      Key: {
        todoId: todoId,
        userId: userId
      }
    }

    try {
      await this.docClient.delete(params).promise()

      logger.info('DataLayer: delete todo success', { todoId })

      const deleteObjectParams = { Bucket: this.bucket, Key: todoId }

      this.s3Client.deleteObject(deleteObjectParams, function (err, data) {
        if (err) {
          logger.error('DataLayer: delete associated image failure', { err })
        } else {
          logger.info('DataLayer: delete associated image success', { data })
        }
      })
    } catch (error) {
      logger.info('DataLayer: delete todo success', { todoId })
    }
  }
}

function createDynamoDBClient() {
  if (process.env.IS_OFFLINE) {
    return new XAWS.DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:8000'
    })
  }

  return new XAWS.DynamoDB.DocumentClient()
}
