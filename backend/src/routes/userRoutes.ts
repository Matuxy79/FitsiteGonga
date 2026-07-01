import { Router, Response } from 'express';
import multer from 'multer';
import { z } from 'zod';
import rateLimit from 'express-rate-limit';
import { authenticateJWT, requireAdmin } from '../middleware/authMiddleware';
import { userRepository } from '../repositories/userRepository';
import { storageService } from '../services/storageService';
import { authService } from '../services/authService';

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

const updatePlanSchema = z.object({
  membership_tier: z.enum(['FREE', 'PAID']),
});

const redeemCodeSchema = z.object({
  code: z.string().min(1).max(200),
});

const redeemCodeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: (_req, res, _next, options) => {
    res.status(options.statusCode).json({
      error: 'Too many code attempts',
      retryAfterSeconds: Math.ceil(options.windowMs / 1000),
    });
  },
});

/**
 * Reissue accessToken/refreshToken cookies. Needed whenever role/membership_tier
 * change, since authMiddleware reads those from the JWT claims, not a DB lookup.
 */
function setAuthCookies(res: Response, tokens: { accessToken: string; refreshToken: string }) {
  res.cookie('accessToken', tokens.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 15 * 60 * 1000,
  });
  res.cookie('refreshToken', tokens.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

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
 * PATCH /api/users/me/plan
 * Self-service membership tier toggle (no payment gateway -- demo stub).
 * Reissues tokens since membership_tier is embedded in the JWT claims.
 */
router.patch('/me/plan', authenticateJWT, async (req, res) => {
  try {
    const validated = updatePlanSchema.parse(req.body);
    const user = await userRepository.updateMembership(req.user!.userId, validated.membership_tier);

    const tokens = authService.generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role,
      membership_tier: user.membership_tier,
    });

    setAuthCookies(res, tokens);

    res.json({
      user,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Update plan error:', error);
    res.status(500).json({ error: 'Failed to update plan' });
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

    const key = storageService.generateAvatarKey(req.user!.userId, req.file.originalname);
    await storageService.uploadFile(key, req.file.buffer, req.file.mimetype);

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

/**
 * POST /api/users/me/redeem-code
 * Redeem a secret code to self-grant ADMIN role (demo-only stub, no real security boundary).
 * Reissues tokens since role is embedded in the JWT claims.
 */
router.post('/me/redeem-code', authenticateJWT, redeemCodeLimiter, async (req, res) => {
  try {
    const validated = redeemCodeSchema.parse(req.body);
    const secret = process.env.ADMIN_SECRET_CODE || 'nhoj-reezy';

    if (validated.code !== secret) {
      console.warn(`Failed admin code redemption attempt by user ${req.user!.userId}`);
      return res.status(400).json({ error: 'Invalid code' });
    }

    const user = await userRepository.updateRole(req.user!.userId, 'ADMIN');

    const tokens = authService.generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role,
      membership_tier: user.membership_tier,
    });

    setAuthCookies(res, tokens);

    res.json({
      user,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Redeem code error:', error);
    res.status(500).json({ error: 'Failed to redeem code' });
  }
});

export default router;
