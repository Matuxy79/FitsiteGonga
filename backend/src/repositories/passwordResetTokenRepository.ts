import prisma from '../db/client';
import { PasswordResetToken } from '@prisma/client';

export const passwordResetTokenRepository = {
  async deleteActiveForUser(userId: string): Promise<void> {
    await prisma.passwordResetToken.deleteMany({
      where: {
        user_id: userId,
        used_at: null,
      },
    });
  },

  async createForUser(params: {
    userId: string;
    tokenHash: string;
    expiresAt: Date;
  }): Promise<PasswordResetToken> {
    return prisma.passwordResetToken.create({
      data: {
        user_id: params.userId,
        token_hash: params.tokenHash,
        expires_at: params.expiresAt,
      },
    });
  },

  async findValidByHash(tokenHash: string, now: Date): Promise<PasswordResetToken | null> {
    return prisma.passwordResetToken.findFirst({
      where: {
        token_hash: tokenHash,
        used_at: null,
        expires_at: {
          gt: now,
        },
      },
    });
  },

  async markUsed(id: string, usedAt: Date): Promise<void> {
    await prisma.passwordResetToken.update({
      where: { id },
      data: { used_at: usedAt },
    });
  },
};

