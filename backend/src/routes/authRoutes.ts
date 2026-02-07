import { Router } from 'express';
import { z } from 'zod';
import rateLimit from 'express-rate-limit';
import { randomBytes, createHash } from 'crypto';
import { userRepository } from '../repositories/userRepository';
import { passwordResetTokenRepository } from '../repositories/passwordResetTokenRepository';
import { authService } from '../services/authService';
import { emailService } from '../services/emailService';
import { authenticateJWT } from '../middleware/authMiddleware';
import prisma from '../db/client';

const router: Router = Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  display_name: z.string().min(1),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const loginLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  limit: 12,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: (_req, res, _next, options) => {
    res.status(options.statusCode).json({
      error: 'Too many login attempts',
      retryAfterSeconds: Math.ceil(options.windowMs / 1000),
    });
  },
});

const registerLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  limit: 6,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: (_req, res, _next, options) => {
    res.status(options.statusCode).json({
      error: 'Too many registration attempts',
      retryAfterSeconds: Math.ceil(options.windowMs / 1000),
    });
  },
});

const forgotPasswordLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  limit: 6,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: (_req, res, _next, options) => {
    res.status(options.statusCode).json({
      error: 'Too many reset requests',
      retryAfterSeconds: Math.ceil(options.windowMs / 1000),
    });
  },
});

const resetPasswordLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  limit: 12,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
});

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

const resetPasswordSchema = z.object({
  token: z.string().min(32),
  password: z.string().min(8),
});

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post('/register', registerLimiter, async (req, res) => {
  try {
    const validated = registerSchema.parse(req.body);
    const { email, password, display_name } = validated;

    // Check if user already exists
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const password_hash = await authService.hashPassword(password);

    // Create user
    const user = await userRepository.create({
      email,
      password_hash,
      display_name,
    });

    // Generate tokens
    const tokens = authService.generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Set httpOnly cookies
    res.cookie('accessToken', tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        display_name: user.display_name,
        role: user.role,
      },
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Register error:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
});

/**
 * POST /api/auth/login
 * Login user
 */
router.post('/login', loginLimiter, async (req, res) => {
  try {
    const validated = loginSchema.parse(req.body);
    const { email, password } = validated;

    // Find user
    const user = await userRepository.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isValid = await authService.comparePassword(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate tokens
    const tokens = authService.generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Set httpOnly cookies
    res.cookie('accessToken', tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000,
    });

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      user: {
        id: user.id,
        email: user.email,
        display_name: user.display_name,
        role: user.role,
      },
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
});

/**
 * POST /api/auth/refresh
 * Refresh access token
 */
router.post('/refresh', async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ error: 'No refresh token provided' });
    }

    // Verify refresh token
    const { userId } = authService.verifyRefreshToken(refreshToken);

    // Get user
    const user = await userRepository.findById(userId);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Generate new access token
    const accessToken = authService.generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000,
    });

    res.json({ accessToken });
  } catch (error: any) {
    console.error('Refresh error:', error);
    res.status(401).json({ error: 'Invalid refresh token' });
  }
});

/**
 * POST /api/auth/logout
 * Logout user (clear cookies)
 */
router.post('/logout', (req, res) => {
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
  res.json({ message: 'Logged out successfully' });
});

/**
 * GET /api/auth/me
 * Get current user
 */
router.get('/me', authenticateJWT, async (req, res) => {
  try {
    const user = await userRepository.findById(req.user!.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

/**
 * POST /api/auth/forgot-password
 * Request password reset email (always responds 200 to prevent account enumeration)
 */
router.post('/forgot-password', forgotPasswordLimiter, async (req, res) => {
  try {
    const validated = forgotPasswordSchema.parse(req.body);
    const email = validated.email.trim();

    const user = await userRepository.findByEmail(email);

    if (user) {
      const rawToken = randomBytes(32).toString('hex');
      const tokenHash = createHash('sha256').update(rawToken).digest('hex');

      const ttlCandidate = Number(process.env.PASSWORD_RESET_TTL_MINUTES);
      const ttlMinutes = Number.isFinite(ttlCandidate) && ttlCandidate > 0 ? ttlCandidate : 60;
      const expiresAt = new Date(Date.now() + Math.max(5, ttlMinutes) * 60 * 1000);

      await passwordResetTokenRepository.deleteActiveForUser(user.id);
      await passwordResetTokenRepository.createForUser({
        userId: user.id,
        tokenHash,
        expiresAt,
      });

      const frontendUrl = emailService.getFrontendUrl().replace(/\/$/, '');
      const resetUrl = `${frontendUrl}/reset-password?token=${encodeURIComponent(rawToken)}`;

      try {
        await emailService.sendPasswordResetEmail({ to: user.email, resetUrl });
      } catch (error) {
        console.error('Forgot password email failed:', error);
      }
    }

    res.json({
      message: 'If that email exists, a reset link has been sent.',
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Failed to request password reset' });
  }
});

/**
 * POST /api/auth/reset-password
 * Reset password using emailed token
 */
router.post('/reset-password', resetPasswordLimiter, async (req, res) => {
  try {
    const validated = resetPasswordSchema.parse(req.body);
    const tokenHash = createHash('sha256').update(validated.token).digest('hex');
    const now = new Date();

    const passwordHash = await authService.hashPassword(validated.password);

    const updated = await prisma.$transaction(async (tx) => {
      const tokenRecord = await tx.passwordResetToken.findFirst({
        where: {
          token_hash: tokenHash,
          used_at: null,
          expires_at: { gt: now },
        },
      });

      if (!tokenRecord) return null;

      await tx.user.update({
        where: { id: tokenRecord.user_id },
        data: { password_hash: passwordHash },
      });

      await tx.passwordResetToken.update({
        where: { id: tokenRecord.id },
        data: { used_at: now },
      });

      await tx.passwordResetToken.deleteMany({
        where: { user_id: tokenRecord.user_id, used_at: null },
      });

      return tokenRecord.user_id;
    });

    if (!updated) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    res.json({ message: 'Password updated successfully' });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

export default router;


