import { createHash, randomBytes } from 'crypto';
import { passwordResetTokenRepository } from '../repositories/passwordResetTokenRepository';

type PasswordResetLink = {
  resetUrl: string;
  expiresAt: Date;
};

function getFrontendUrl(): string {
  return process.env.FRONTEND_URL || process.env.CORS_ORIGIN || 'http://localhost:3000';
}

function getResetTtlMinutes(): number {
  const ttlCandidate = Number(process.env.PASSWORD_RESET_TTL_MINUTES);
  return Number.isFinite(ttlCandidate) && ttlCandidate > 0 ? ttlCandidate : 60;
}

export const passwordResetService = {
  async createResetLinkForUser(userId: string): Promise<PasswordResetLink> {
    const rawToken = randomBytes(32).toString('hex');
    const tokenHash = createHash('sha256').update(rawToken).digest('hex');
    const ttlMinutes = getResetTtlMinutes();
    const expiresAt = new Date(Date.now() + Math.max(5, ttlMinutes) * 60 * 1000);

    await passwordResetTokenRepository.deleteActiveForUser(userId);
    await passwordResetTokenRepository.createForUser({
      userId,
      tokenHash,
      expiresAt,
    });

    const frontendUrl = getFrontendUrl().replace(/\/$/, '');
    const resetUrl = `${frontendUrl}/reset-password?token=${encodeURIComponent(rawToken)}`;

    return { resetUrl, expiresAt };
  },
};
