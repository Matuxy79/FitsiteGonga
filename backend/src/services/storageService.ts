import fs from 'fs/promises';
import path from 'path';

const STORAGE_ROOT = path.resolve(
  process.env.LOCAL_STORAGE_DIR || path.resolve(__dirname, '../../uploads')
);

export const isStorageConfigured = true;

function normalizeKey(key: string): string {
  const normalized = key.replace(/\\/g, '/').replace(/^\/+/, '');
  if (!normalized || normalized.includes('\0')) {
    throw new Error('Invalid storage key');
  }
  return normalized;
}

function resolveStoragePath(key: string): string {
  const normalized = normalizeKey(key);
  const filePath = path.resolve(STORAGE_ROOT, normalized);
  const rootWithSeparator = STORAGE_ROOT.endsWith(path.sep) ? STORAGE_ROOT : `${STORAGE_ROOT}${path.sep}`;

  if (filePath !== STORAGE_ROOT && !filePath.startsWith(rootWithSeparator)) {
    throw new Error('Invalid storage key');
  }

  return filePath;
}

export function getPublicUrl(key: string): string {
  return `/api/media/${normalizeKey(key)}`;
}

export interface UploadUrlOptions {
  key: string;
  contentType: string;
  expiresIn?: number;
}

export const storageService = {
  async generateUploadUrl(options: UploadUrlOptions): Promise<string> {
    const key = normalizeKey(options.key);
    return `/api/storage/upload?key=${encodeURIComponent(key)}`;
  },

  async getFilePath(key: string): Promise<string> {
    const filePath = resolveStoragePath(key);
    await fs.access(filePath);
    return filePath;
  },

  async generateDownloadUrl(key: string): Promise<string> {
    return getPublicUrl(key);
  },

  async deleteFile(key: string): Promise<void> {
    const filePath = resolveStoragePath(key);
    await fs.rm(filePath, { force: true });
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

  async uploadFile(key: string, body: Buffer, _contentType: string): Promise<void> {
    const filePath = resolveStoragePath(key);
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, body);
  },
};
