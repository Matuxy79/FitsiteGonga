'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence } from 'framer-motion';
import { LoginCard } from './LoginCard';
import { SignupCard } from './SignupCard';
import { ToastProvider } from '@/components/ui/Toast';
import { useToast } from '@/hooks/useToast';

type AuthMode = 'login' | 'signup';

export function AuthContainer() {
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const { toasts, dismiss } = useToast();
  const router = useRouter();

  const handleAuthSuccess = () => {
    router.push('/dashboard');
  };

  const switchToSignup = () => {
    setAuthMode('signup');
  };

  const switchToLogin = () => {
    setAuthMode('login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
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
      <ToastProvider toasts={toasts} onDismiss={dismiss} />
    </div>
  );
}
