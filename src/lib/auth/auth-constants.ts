// Auth constants for FitsiteGonga
export const AUTH_ERRORS = {
  USER_ALREADY_REGISTERED: 'User already registered',
  RATE_LIMIT: 'rate limit',
  INVALID_EMAIL: 'Invalid email',
  WEAK_PASSWORD: 'Password should be at least',
  NETWORK_ERROR: 'Network error',
  EMAIL_NOT_CONFIRMED: 'Email not confirmed',
  INVALID_CREDENTIALS: 'Invalid login credentials',
} as const;

export const EMAIL_VERIFICATION = {
  RESEND_COOLDOWN: 30, // seconds
  TOAST_DURATION: 5000, // milliseconds
  REDIRECT_DELAY: 2000, // milliseconds
} as const;

export const AUTH_MESSAGES = {
  SIGNUP_SUCCESS: 'Account created successfully',
  LOGIN_SUCCESS: 'Login successful',
  EMAIL_VERIFICATION_SENT: 'Check your email to confirm your account',
  EMAIL_VERIFICATION_SUCCESS: 'Email verified successfully!',
  EMAIL_RESEND_SUCCESS: 'Verification email sent',
  LOGOUT_SUCCESS: 'Logged out successfully',
} as const;
