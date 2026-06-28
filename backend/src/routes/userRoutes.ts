import { Router } from 'express';
import multer from 'multer';
import { z } from 'zod';
import { authenticateJWT, requireAdmin } from '../middleware/authMiddleware';
import { userRepository } from '../repositories/userRepository';
import { s3Service } from '../services/s3Service';

const router: Router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

const updateProfileSchema = z.object({
  display_name: z.string().min(1).optional(),
  fitness_level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).optional(),
  goals: z.array(z.string()).optional(),
});

const updateMembershipSchema = z.object({
  membership_tier: z.enum(['FREE', 'PAID']),
  subscription_status: z.enum(['ACTIVE', 'CANCELLED', 'PAST_DUE', 'EXPIRED']).optional(),
});

/**
 * GET /api/users/me
 * Get current user full profile
 */
router.get('/me', authenticateJWT, async (req, res) => {
  try {
    const user = await userRepository.findById(req.user!.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

/**
 * PATCH /api/users/me
 * Update current user profile
 */
router.patch('/me', authenticateJWT, async (req, res) => {
  try {
    const validated = updateProfileSchema.parse(req.body);
    const user = await userRepository.update(req.user!.userId, validated);
    res.json({ user });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

/**
 * POST /api/users/me/avatar
 * Upload avatar image
 */
router.post('/me/avatar', authenticateJWT, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image provided' });
    }

    const key = s3Service.generateAvatarKey(req.user!.userId, req.file.originalname);
    await s3Service.uploadFile(key, req.file.buffer, req.file.mimetype);

    const user = await userRepository.update(req.user!.userId, { avatar_url: key });
    res.json({ user, key });
  } catch (error: any) {
    console.error('Avatar upload error:', error);
    res.status(500).json({ error: 'Failed to upload avatar', message: error.message });
  }
});

/**
 * PUT /api/users/:id/membership (admin only)
 * Update a user's membership tier
 */
router.put('/:id/membership', authenticateJWT, requireAdmin, async (req, res) => {
  try {
    const validated = updateMembershipSchema.parse(req.body);
    const user = await userRepository.updateMembership(
      req.params.id,
      validated.membership_tier,
      validated.subscription_status
    );
    res.json({ user });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Update membership error:', error);
    res.status(500).json({ error: 'Failed to update membership' });
  }
});

export default router;
