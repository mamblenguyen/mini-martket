import { S3 } from 'aws-sdk';
import { extname } from 'path';

const s3 = new S3();

export const uploadToS3 = async (file: Express.Multer.File , nameModule): Promise<string> => {
  const fileKey = `${nameModule}/${Date.now()}-${Math.round(Math.random() * 1e9)}${extname(file.originalname)}`;

  const result = await s3.upload({
    Bucket: process.env.AWS_S3_BUCKET!,
    Key: fileKey,
    Body: file.buffer,
    ContentType: file.mimetype,
  }).promise();

  return result.Location;
};
