import { AuthError } from '@/types/auth';
import { AUTH_ERRORS } from './auth-constants';

export function parseAuthError(error: any): AuthError {
  const message = error?.message || 'An unexpected error occurred';

  if (message.includes(AUTH_ERRORS.USER_ALREADY_REGISTERED)) {
    return {
      code: 'USER_EXISTS',
      message: 'This email is already registered. Try signing in instead.',
      field: 'email',
    };
  }

  if (message.includes(AUTH_ERRORS.RATE_LIMIT)) {
    return {
      code: 'RATE_LIMITED',
      message: 'Too many attempts. Please try again in a moment.',
    };
  }

  if (message.includes(AUTH_ERRORS.INVALID_EMAIL)) {
    return {
      code: 'INVALID_EMAIL',
      message: 'Please enter a valid email address.',
      field: 'email',
    };
  }

  if (message.includes(AUTH_ERRORS.WEAK_PASSWORD)) {
    return {
      code: 'WEAK_PASSWORD',
      message: 'Password must be at least 8 characters long.',
      field: 'password',
    };
  }

  if (message.includes(AUTH_ERRORS.EMAIL_NOT_CONFIRMED)) {
    return {
      code: 'EMAIL_NOT_CONFIRMED',
      message: 'Please check your email and click the verification link.',
      field: 'email',
    };
  }

  if (message.includes(AUTH_ERRORS.INVALID_CREDENTIALS)) {
    return {
      code: 'INVALID_CREDENTIALS',
      message: 'Invalid email or password. Please try again.',
      field: 'email',
    };
  }

  return {
    code: 'UNKNOWN',
    message: 'Something went wrong. Please try again.',
  };
}

export function getEmailRedirectUrl(): string {
  if (typeof window === 'undefined') return '';
  return `${window.location.origin}/auth/callback`;
}

export function generateDisplayName(email: string): string {
  return email.split('@')[0];
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
