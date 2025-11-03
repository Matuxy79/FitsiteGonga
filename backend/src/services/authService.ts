import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;

if (!JWT_SECRET || !JWT_REFRESH_SECRET) {
  throw new Error('JWT_SECRET and JWT_REFRESH_SECRET must be set');
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

export const authService = {
  /**
   * Hash a password using bcrypt
   */
  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  },

  /**
   * Compare a plain password with a hash
   */
  async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  },

  /**
   * Generate JWT access token (15 minutes expiry)
   */
  generateAccessToken(payload: JWTPayload): string {
    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: '15m',
    });
  },

  /**
   * Generate JWT refresh token (7 days expiry)
   */
  generateRefreshToken(userId: string): string {
    return jwt.sign({ userId }, JWT_REFRESH_SECRET, {
      expiresIn: '7d',
    });
  },

  /**
   * Generate both access and refresh tokens
   */
  generateTokens(payload: JWTPayload) {
    return {
      accessToken: this.generateAccessToken(payload),
      refreshToken: this.generateRefreshToken(payload.userId),
    };
  },

  /**
   * Verify JWT access token
   */
  verifyAccessToken(token: string): JWTPayload {
    try {
      return jwt.verify(token, JWT_SECRET) as JWTPayload;
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  },

  /**
   * Verify JWT refresh token
   */
  verifyRefreshToken(token: string): { userId: string } {
    try {
      return jwt.verify(token, JWT_REFRESH_SECRET) as { userId: string };
    } catch (error) {
      throw new Error('Invalid or expired refresh token');
    }
  },
};


