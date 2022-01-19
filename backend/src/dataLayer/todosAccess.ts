import * as AWS from 'aws-sdk'
const AWSXRay = require('aws-xray-sdk')

import { TodoItem } from '../models/TodoItem'
// import { createLogger } from '../utils/logger'

const XAWS = AWSXRay.captureAWS(AWS)

// const logger = createLogger('TodosAccess')

export class TodoAccess {
  constructor(
    private readonly docClient = createDynamoDBClient(),
    private readonly todosTable = process.env.TODOS_TABLE // private readonly todosIndex = process.env.TODOS_CREATED_AT_INDEX
  ) {}

  async getAllTodosByUserId(userId: string): Promise<TodoItem[]> {
    console.log('Getting all todos for user with id ', userId)
    console.log('docClient', this.docClient)
    console.log('todosTable :', this.todosTable)
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
