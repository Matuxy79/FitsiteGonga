import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Railway Object Storage (S3-compatible via Tigris)
const ENDPOINT = process.env.RAILWAY_OBJECT_STORAGE_ENDPOINT;
const BUCKET_NAME =
  process.env.RAILWAY_OBJECT_STORAGE_BUCKET_NAME ||
  process.env.RAILWAY_BUCKET_NAME ||
  process.env.BUCKET_NAME;
const ACCESS_KEY_ID = process.env.RAILWAY_OBJECT_STORAGE_ACCESS_KEY_ID;
const SECRET_ACCESS_KEY = process.env.RAILWAY_OBJECT_STORAGE_SECRET_ACCESS_KEY;

export const isStorageConfigured = Boolean(
  ENDPOINT && BUCKET_NAME && ACCESS_KEY_ID && SECRET_ACCESS_KEY
);

if (!isStorageConfigured) {
  console.warn(
    '[storage] Object storage is not configured. Storage endpoints will return 503 until RAILWAY_OBJECT_STORAGE_* env vars are set.'
  );
}

const s3Client = isStorageConfigured
  ? new S3Client({
      region: 'auto',
      endpoint: ENDPOINT,
      credentials: {
        accessKeyId: ACCESS_KEY_ID!,
        secretAccessKey: SECRET_ACCESS_KEY!,
      },
    })
  : null;

function assertStorageConfigured(): void {
  if (!isStorageConfigured || !s3Client || !BUCKET_NAME) {
    const err = new Error('Object storage is not configured');
    (err as any).statusCode = 503;
    throw err;
  }
}

/**
 * Build public URL for a stored object.
 * Railway/Tigris uses virtual-hosted-style: https://{bucket}.{host}/{key}
 */
export function getPublicUrl(key: string): string {
  assertStorageConfigured();
  const host = ENDPOINT!.replace('https://', '');
  return `https://${BUCKET_NAME}.${host}/${key}`;
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
    assertStorageConfigured();
    const { key, contentType, expiresIn = 300 } = options;

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME!,
      Key: key,
      ContentType: contentType,
      ACL: 'public-read',
      CacheControl: 'public, max-age=31536000, immutable',
    });

    const url = await getSignedUrl(s3Client!, command, { expiresIn });
    return url;
  },

  /**
   * Generate presigned URL for downloading file from S3
   * @param key - S3 object key
   * @param expiresIn - URL expiry in seconds (default: 1 hour)
   * @returns Presigned URL that allows GET operation
   */
  async generatePresignedDownloadUrl(key: string, expiresIn: number = 3600): Promise<string> {
    assertStorageConfigured();
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME!,
      Key: key,
    });

    const url = await getSignedUrl(s3Client!, command, { expiresIn });
    return url;
  },

  /**
   * Delete file from S3
   * @param key - S3 object key
   */
  async deleteFile(key: string): Promise<void> {
    assertStorageConfigured();
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME!,
      Key: key,
    });

    await s3Client!.send(command);
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

  /**
   * Upload a file buffer directly to storage (server-side, no CORS issues)
   */
  async uploadFile(key: string, body: Buffer, contentType: string): Promise<void> {
    assertStorageConfigured();
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME!,
      Key: key,
      Body: body,
      ContentType: contentType,
      ACL: 'public-read',
      CacheControl: 'public, max-age=31536000, immutable',
    });
    await s3Client!.send(command);
  },
};
