import express, { Router } from 'express';
import { z } from 'zod';
import { storageService } from '../services/storageService';
import { authenticateJWT } from '../middleware/authMiddleware';

const router: Router = Router();

const uploadUrlSchema = z.object({
  key: z.string().min(1),
  contentType: z.string().regex(/^(image|video)\//),
  expiresIn: z.number().positive().max(3600).optional(), // max 1 hour
});

/**
 * POST /api/storage/upload-url
 * Generate local upload URL for file upload
 */
router.post('/upload-url', authenticateJWT, async (req, res) => {
  try {
    const validated = uploadUrlSchema.parse(req.body);
    const { key, contentType, expiresIn = 300 } = validated;

    const uploadPath = await storageService.generateUploadUrl({
      key,
      contentType,
      expiresIn,
    });
    const baseUrl = `${req.protocol}://${req.get('host')}`;

    res.json({
      uploadUrl: `${baseUrl}${uploadPath}`,
      key,
      expiresIn,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Generate upload URL error:', error);
    res.status(500).json({ error: 'Failed to generate upload URL' });
  }
});

/**
 * POST /api/storage/upload-url/progress-photo
 * Generate local upload URL for progress photo (convenience endpoint)
 */
router.post('/upload-url/progress-photo', authenticateJWT, async (req, res) => {
  try {
    const { challengeId, filename } = z.object({
      challengeId: z.string().uuid(),
      filename: z.string().min(1),
    }).parse(req.body);

    const key = storageService.generateProgressPhotoKey(
      req.user!.userId,
      challengeId,
      filename
    );

    // Determine content type from filename
    const ext = filename.split('.').pop()?.toLowerCase();
    const contentType = ext === 'png' ? 'image/png' : 'image/jpeg';

    const uploadPath = await storageService.generateUploadUrl({
      key,
      contentType,
      expiresIn: 300, // 5 minutes
    });
    const baseUrl = `${req.protocol}://${req.get('host')}`;

    res.json({
      uploadUrl: `${baseUrl}${uploadPath}`,
      key,
      contentType,
      expiresIn: 300,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Generate progress photo URL error:', error);
    res.status(500).json({ error: 'Failed to generate upload URL' });
  }
});

/**
 * PUT /api/storage/upload?key=...
 * Store file bytes in local storage.
 */
router.put(
  '/upload',
  authenticateJWT,
  express.raw({ type: ['image/*', 'video/*', 'application/octet-stream'], limit: '10mb' }),
  async (req, res) => {
    try {
      const key = z.string().min(1).parse(req.query.key);
      const body = Buffer.isBuffer(req.body) ? req.body : Buffer.from(req.body || []);

      if (body.length === 0) {
        return res.status(400).json({ error: 'No file body provided' });
      }

      await storageService.uploadFile(key, body, req.get('content-type') || 'application/octet-stream');
      res.json({ key, publicUrl: `${req.protocol}://${req.get('host')}/api/media/${key}` });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Validation error', details: error.errors });
      }
      console.error('Local upload error:', error);
      res.status(500).json({ error: 'Failed to upload file' });
    }
  }
);

/**
 * DELETE /api/storage/:key
 * Delete file from local storage (admin only or owner)
 */
router.delete('/:key', authenticateJWT, async (req, res) => {
  try {
    const key = decodeURIComponent(req.params.key);

    // Basic ownership check: key should contain user ID
    if (!key.includes(req.user!.userId) && req.user!.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    await storageService.deleteFile(key);
    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({ error: 'Failed to delete file' });
  }
});

export default router;


