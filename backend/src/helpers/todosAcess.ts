import * as AWS from 'aws-sdk'
const AWSXRay = require('aws-xray-sdk')

import { TodoItem } from '../models/TodoItem'
// import { createLogger } from '../utils/logger'

const XAWS = AWSXRay.captureAWS(AWS)

// const logger = createLogger('TodosAccess')

export class TodoAccess {
  constructor(
    private readonly docClient = createDynamoDBClient(),
    private readonly todosTable = process.env.TODOS_TABLE
  ) {}

  async getAllGroups(): Promise<TodoItem[]> {
    console.log('Getting all todos')

    const result = await this.docClient
      .query({
        TableName: this.todosTable,
        IndexName: 'createdAt',
        KeyConditionExpression: 'paritionKey = :paritionKey',
        ExpressionAttributeValues: {
          ':paritionKey': 1
        }
      })
      .promise()

    const items = result.Items
    return items as TodoItem[]
  }

  // async createTodo(group: Group): Promise<Group> {
  //   await this.docClient
  //     .put({
  //       TableName: this.groupsTable,
  //       Item: group
  //     })
  //     .promise()

  //   return group
  // }
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
