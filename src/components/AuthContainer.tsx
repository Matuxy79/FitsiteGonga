'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence } from 'framer-motion'
import { LoginCard } from './LoginCard'
import { SignupCard } from './SignupCard'
import { AuthLayout } from './layout/AuthLayout'

type AuthMode = 'login' | 'signup'

export function AuthContainer() {
  const [authMode, setAuthMode] = useState<AuthMode>('login')
  const router = useRouter()

  const handleAuthSuccess = () => {
    router.push('/dashboard')
  }

  const switchToSignup = () => {
    setAuthMode('signup')
  }

  const switchToLogin = () => {
    setAuthMode('login')
  }

  return (
    <AuthLayout>
      <div className="flex items-center justify-center py-8">
        <div className="w-full max-w-md">
          <AnimatePresence mode="wait">
            {authMode === 'login' ? (
              <LoginCard
                key="login"
                onSuccess={handleAuthSuccess}
                onSwitchToSignup={switchToSignup}
              />
            ) : (
              <SignupCard
                key="signup"
                onSuccess={handleAuthSuccess}
                onSwitchToLogin={switchToLogin}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </AuthLayout>
  )
}
