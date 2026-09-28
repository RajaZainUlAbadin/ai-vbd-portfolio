import { env } from '@/app/config/env';
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';

export class S3Service {
  static async getEmail(
    key: string,
    bucket?: string,
    region?: string,
  ): Promise<string> {
    const s3Client = new S3Client({
      region: region ?? env.AWS_REGION,
    });

    const result = await s3Client.send(
      new GetObjectCommand({
        Bucket: bucket ?? env.AWS_SES_INBOUND_BUCKET,
        Key: key,
      }),
    );

    if (!result.Body) {
      throw new Error('Email not found in S3');
    }

    return await result.Body.transformToString();
  }
}
