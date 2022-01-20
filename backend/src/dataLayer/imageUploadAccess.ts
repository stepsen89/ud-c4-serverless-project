import * as AWS from 'aws-sdk'
const AWSXRay = require('aws-xray-sdk')

const XAWS = AWSXRay.captureAWS(AWS)

import { createLogger } from '../utils/logger'

const logger = createLogger('TodosAccess')

export class ImageUploadAccess {
  constructor(
    private readonly s3Client = new XAWS.S3({ signatureVersion: 'v4' }),
    private readonly bucket = process.env.ATTACHMENT_S3_BUCKET,
    private readonly expirationTime = Number(process.env.SIGNED_URL_EXPIRATION)
  ) {}

  async getAttachmentUrl(imageId: string): Promise<any> {
    logger.info('DataLayer: Get Attachment Url')

    const result = this.s3Client.getSignedUrl('putObject', {
      Bucket: this.bucket,
      Key: imageId,
      Expires: this.expirationTime
    })

    logger.info('DataLayer: Get Attachment Url result', { result })

    return result
  }
}
