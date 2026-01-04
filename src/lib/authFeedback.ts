import type { ApiError } from '@/lib/apiClient'
import type { TerminalNotification } from '@/providers/ToastProvider'

export type AuthMode = 'login' | 'signup'
export type AuthField = 'email' | 'password' | 'codename'
export type FieldErrors = Partial<Record<AuthField, string>>

export function getEmailSector(email: string): string {
  const domain = email.split('@')[1]?.split('.')[0] || 'EMAIL'
  return domain.toUpperCase()
}

export function isApiError(error: unknown): error is ApiError {
  return typeof error === 'object' && error !== null && 'error' in error
}

export function extractFieldErrors(details: unknown): FieldErrors {
  if (!Array.isArray(details)) return {}

  const result: FieldErrors = {}
  for (const issue of details as any[]) {
    const path = Array.isArray(issue?.path) ? issue.path : []
    const field = typeof path[0] === 'string' ? path[0] : undefined
    if (!field) continue

    const message =
      typeof issue?.message === 'string' && issue.message.trim().length > 0
        ? issue.message
        : 'Invalid value'

    if (field === 'email') result.email ||= message
    if (field === 'password') result.password ||= message
    if (field === 'display_name') result.codename ||= message
  }

  return result
}

function firstFieldError(fieldErrors: FieldErrors): string | undefined {
  return fieldErrors.email || fieldErrors.password || fieldErrors.codename
}

export function getRetryAfterSeconds(error: ApiError): number | undefined {
  const candidate = error?.meta?.retryAfterSeconds
  return typeof candidate === 'number' && Number.isFinite(candidate) ? candidate : undefined
}

export function mapAuthErrorToToast(params: {
  mode: AuthMode
  email?: string
  error: unknown
}): { toast: Omit<TerminalNotification, 'id'>; fieldErrors?: FieldErrors; retryAfterSeconds?: number } {
  const sector = params.email ? getEmailSector(params.email) : 'AUTH'

  if (!isApiError(params.error)) {
    return {
      toast: {
        status: 'ERROR',
        title: 'AUTHENTICATION FAILED',
        message: 'Unexpected error. Please try again.',
        sector: 'AUTH',
      },
    }
  }

  const apiError = params.error
  const status = apiError.status

  if (status === 0) {
    return {
      toast: {
        status: 'ERROR',
        title: 'CONNECTION LOST',
        message: 'Backend unreachable. Start the server and try again.',
        sector: 'SYSTEM',
      },
    }
  }

  if (status === 429) {
    const retryAfterSeconds = getRetryAfterSeconds(apiError)
    return {
      toast: {
        status: 'WARN',
        title: 'TOO MANY ATTEMPTS',
        message: retryAfterSeconds
          ? `Cooldown active. Try again in ${retryAfterSeconds}s.`
          : 'Cooldown active. Try again shortly.',
        sector: 'AUTH',
      },
      retryAfterSeconds,
    }
  }

  if (status === 400 && apiError.error?.toLowerCase().includes('validation')) {
    const fieldErrors = extractFieldErrors(apiError.details)
    return {
      toast: {
        status: 'WARN',
        title: 'VALIDATION ERROR',
        message: firstFieldError(fieldErrors) || 'Check your inputs and try again.',
        sector: 'AUTH',
      },
      fieldErrors,
    }
  }

  if (apiError.error?.toLowerCase().includes('already registered')) {
    return {
      toast: {
        status: 'WARN',
        title: 'OPERATIVE EXISTS',
        message: 'This email is already registered. Switch to login to proceed.',
        sector,
      },
      fieldErrors: { email: 'Email already registered' },
    }
  }

  if (status === 401 && apiError.error?.toLowerCase().includes('invalid credentials')) {
    return {
      toast: {
        status: 'ERROR',
        title: 'ACCESS DENIED',
        message:
          params.mode === 'login'
            ? 'Email or password incorrect. If you are new, create an account.'
            : 'Credentials rejected. Double-check your inputs and try again.',
        sector: 'AUTH',
      },
      fieldErrors:
        params.mode === 'login' ? { password: 'Email or password incorrect' } : undefined,
    }
  }

  if (status && status >= 500) {
    return {
      toast: {
        status: 'ERROR',
        title: 'AUTH SERVICE DOWN',
        message: 'Server error. Please try again in a moment.',
        sector: 'SYSTEM',
      },
    }
  }

  return {
    toast: {
      status: 'ERROR',
      title: 'AUTHENTICATION FAILED',
      message: apiError.error || apiError.message || 'Authentication protocol failed',
      sector: 'AUTH',
    },
  }
}
