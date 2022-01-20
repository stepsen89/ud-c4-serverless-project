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

    console.log(result)
    const items = result.Items
    return items as TodoItem[]
  }

  async createTodo(item: TodoItem): Promise<TodoItem> {
    await this.docClient
      .put({
        TableName: this.todosTable,
        Item: item
      })
      .promise()

    return item
  }

  async updateTodo(item: TodoUpdate, userId: string): Promise<TodoUpdate> {
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

    console.log('Updating the item...')
    const result = await this.docClient.update(params).promise()
    console.log('Result after update: ', result)
    return result
  }

  async deleteTodo(todoId: string, userId: string) {
    var params = {
      TableName: this.todosTable,
      Key: {
        todoId: todoId,
        userId: userId
      }
    }
    console.log('Deleting the item...')
    return await this.docClient.delete(params).promise()
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
