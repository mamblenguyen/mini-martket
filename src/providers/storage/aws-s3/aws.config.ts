// src/providers/storage/aws-s3/aws.config.ts
import { S3 } from '@aws-sdk/client-s3'; // Sử dụng AWS SDK v3

export const s3Client = new S3({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});
