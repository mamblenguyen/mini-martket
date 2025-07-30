import { S3 } from 'aws-sdk';
import { extname } from 'path';

const s3 = new S3();

type MulterFile = {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
  fieldname?: string;
  size?: number;
  destination?: string;
  encoding?: string;
  filename?: string;
  path?: string;
};

export const uploadToS3 = async (
  file: MulterFile,
  nameModule: string
): Promise<string> => {
  const fileKey = `${nameModule}/${Date.now()}-${Math.round(
    Math.random() * 1e9
  )}${extname(file.originalname)}`;

  const result = await s3
    .upload({
      Bucket: process.env.AWS_S3_BUCKET!,
      Key: fileKey,
      Body: file.buffer,
      ContentType: file.mimetype,
    })
    .promise();

  return result.Location;
};
