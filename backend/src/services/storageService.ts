import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const S3_ENDPOINT = process.env.S3_ENDPOINT || 'http://minio.railway.internal:9000';
const S3_REGION = process.env.S3_REGION || 'us-east-1';
const S3_ACCESS_KEY_ID = process.env.S3_ACCESS_KEY_ID || '';
const S3_SECRET_ACCESS_KEY = process.env.S3_SECRET_ACCESS_KEY || '';
const S3_BUCKET = process.env.S3_BUCKET || 'fitsite';

const s3 = new S3Client({
  endpoint: S3_ENDPOINT,
  region: S3_REGION,
  credentials: {
    accessKeyId: S3_ACCESS_KEY_ID,
    secretAccessKey: S3_SECRET_ACCESS_KEY,
  },
  // Required for MinIO: path-style URLs (e.g. http://host:9000/bucket/key)
  forcePathStyle: true,
});

export const isStorageConfigured = Boolean(S3_ACCESS_KEY_ID && S3_SECRET_ACCESS_KEY);

export function getPublicUrl(key: string): string {
  return `${S3_ENDPOINT}/${S3_BUCKET}/${key}`;
}

export interface UploadUrlOptions {
  key: string;
  contentType: string;
  expiresIn?: number; // seconds, default 300 (5 min)
}

export const storageService = {
  /**
   * Generate a presigned PUT URL so the client can upload directly to MinIO.
   * Returns the signed URL string.
   */
  async generateUploadUrl(options: UploadUrlOptions): Promise<string> {
    const { key, contentType, expiresIn = 300 } = options;
    const command = new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
      ContentType: contentType,
    });
    try {
      return await getSignedUrl(s3, command, { expiresIn });
    } catch (err: any) {
      throw new Error(`Failed to generate presigned upload URL: ${err.message}`);
    }
  },

  /**
   * Generate a presigned GET URL so the client can download a private object.
   * Expires after 1 hour by default.
   */
  async generateDownloadUrl(key: string, expiresIn = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
    });
    try {
      return await getSignedUrl(s3, command, { expiresIn });
    } catch (err: any) {
      throw new Error(`Failed to generate presigned download URL: ${err.message}`);
    }
  },

  /**
   * Upload a file buffer directly from the server to S3/MinIO.
   */
  async uploadFile(key: string, body: Buffer, contentType: string): Promise<void> {
    const command = new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
      Body: body,
      ContentType: contentType,
    });
    try {
      await s3.send(command);
    } catch (err: any) {
      throw new Error(`Failed to upload file to S3: ${err.message}`);
    }
  },

  /**
   * Delete an object from S3/MinIO.
   */
  async deleteFile(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
    });
    try {
      await s3.send(command);
    } catch (err: any) {
      throw new Error(`Failed to delete file from S3: ${err.message}`);
    }
  },

  /**
   * Generate a presigned GET URL for serving a file (1-hour expiry).
   * Used by the /api/media/* proxy route.
   */
  async getFilePath(key: string): Promise<string> {
    return this.generateDownloadUrl(key, 3600);
  },

  generateProgressPhotoKey(userId: string, challengeId: string, filename: string): string {
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 9);
    const ext = filename.split('.').pop() || 'jpg';
    return `progress-photos/${userId}/${challengeId}/${timestamp}-${randomId}.${ext}`;
  },

  generateAvatarKey(userId: string, filename: string): string {
    const ext = filename.split('.').pop() || 'jpg';
    return `avatars/${userId}.${ext}`;
  },
};
