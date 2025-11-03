import { Router } from 'express';
import { z } from 'zod';
import { s3Service } from '../services/s3Service';
import { authenticateJWT } from '../middleware/authMiddleware';

const router = Router();

const presignedUrlSchema = z.object({
  key: z.string().min(1),
  contentType: z.string().regex(/^(image|video)\//),
  expiresIn: z.number().positive().max(3600).optional(), // max 1 hour
});

/**
 * POST /api/storage/presigned-url
 * Generate presigned URL for file upload
 */
router.post('/presigned-url', authenticateJWT, async (req, res) => {
  try {
    const validated = presignedUrlSchema.parse(req.body);
    const { key, contentType, expiresIn = 300 } = validated;

    const url = await s3Service.generatePresignedUploadUrl({
      key,
      contentType,
      expiresIn,
    });

    res.json({
      uploadUrl: url,
      key,
      expiresIn,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Generate presigned URL error:', error);
    res.status(500).json({ error: 'Failed to generate presigned URL' });
  }
});

/**
 * POST /api/storage/presigned-url/progress-photo
 * Generate presigned URL for progress photo (convenience endpoint)
 */
router.post('/presigned-url/progress-photo', authenticateJWT, async (req, res) => {
  try {
    const { challengeId, filename } = z.object({
      challengeId: z.string().uuid(),
      filename: z.string().min(1),
    }).parse(req.body);

    const key = s3Service.generateProgressPhotoKey(
      req.user!.userId,
      challengeId,
      filename
    );

    // Determine content type from filename
    const ext = filename.split('.').pop()?.toLowerCase();
    const contentType = ext === 'png' ? 'image/png' : 'image/jpeg';

    const url = await s3Service.generatePresignedUploadUrl({
      key,
      contentType,
      expiresIn: 300, // 5 minutes
    });

    res.json({
      uploadUrl: url,
      key,
      contentType,
      expiresIn: 300,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Generate progress photo URL error:', error);
    res.status(500).json({ error: 'Failed to generate presigned URL' });
  }
});

/**
 * DELETE /api/storage/:key
 * Delete file from S3 (admin only or owner)
 */
router.delete('/:key', authenticateJWT, async (req, res) => {
  try {
    const key = decodeURIComponent(req.params.key);

    // Basic ownership check: key should contain user ID
    if (!key.includes(req.user!.userId) && req.user!.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    await s3Service.deleteFile(key);
    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({ error: 'Failed to delete file' });
  }
});

export default router;


