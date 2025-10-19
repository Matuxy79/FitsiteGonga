// Auth-specific types for FitsiteGonga
export interface AuthUser {
  id: string;
  email: string;
  display_name?: string;
  avatar_url?: string;
  email_confirmed_at?: string;
}

export interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
}

export interface EmailVerificationState {
  isOpen: boolean;
  email: string;
  resending: boolean;
  cooldown: number;
}

export interface AuthError {
  code: string;
  message: string;
  field?: string;
}

export interface AuthFormState {
  state: 'idle' | 'validating' | 'loading' | 'success' | 'error';
  error?: string;
}

export interface AuthCallbackState {
  status: 'loading' | 'success' | 'error';
  message?: string;
}
