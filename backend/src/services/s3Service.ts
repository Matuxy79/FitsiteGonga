import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME!;

if (!BUCKET_NAME) {
  throw new Error('AWS_S3_BUCKET_NAME must be set');
}

export interface PresignedUrlOptions {
  key: string;
  contentType: string;
  expiresIn?: number; // seconds, default 300 (5 minutes)
}

export const s3Service = {
  /**
   * Generate presigned URL for uploading file to S3
   * @param options - Upload options
   * @returns Presigned URL that allows PUT operation
   */
  async generatePresignedUploadUrl(options: PresignedUrlOptions): Promise<string> {
    const { key, contentType, expiresIn = 300 } = options;

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      ContentType: contentType,
      // Optional: Add metadata or ACL settings
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn });
    return url;
  },

  /**
   * Generate presigned URL for downloading file from S3
   * @param key - S3 object key
   * @param expiresIn - URL expiry in seconds (default: 1 hour)
   * @returns Presigned URL that allows GET operation
   */
  async generatePresignedDownloadUrl(key: string, expiresIn: number = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn });
    return url;
  },

  /**
   * Delete file from S3
   * @param key - S3 object key
   */
  async deleteFile(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    await s3Client.send(command);
  },

  /**
   * Generate S3 key for progress photos
   * Format: progress-photos/{userId}/{challengeId}/{timestamp}-{randomId}.{ext}
   */
  generateProgressPhotoKey(userId: string, challengeId: string, filename: string): string {
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 9);
    const ext = filename.split('.').pop() || 'jpg';
    return `progress-photos/${userId}/${challengeId}/${timestamp}-${randomId}.${ext}`;
  },

  /**
   * Generate S3 key for avatar
   * Format: avatars/{userId}.{ext}
   */
  generateAvatarKey(userId: string, filename: string): string {
    const ext = filename.split('.').pop() || 'jpg';
    return `avatars/${userId}.${ext}`;
  },
};


