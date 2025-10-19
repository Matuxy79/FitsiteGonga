'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence } from 'framer-motion';
import { LoginCard } from './LoginCard';
import { SignupCard } from './SignupCard';
import { ToastProvider } from '@/components/ui/Toast';
import { useToast } from '@/hooks/useToast';

type AuthMode = 'login' | 'signup';

interface AuthContainerProps {
  onBackToHome?: () => void;
}

export function AuthContainer({ onBackToHome }: AuthContainerProps) {
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const { toasts, dismiss } = useToast();
  const router = useRouter();

  const handleAuthSuccess = () => {
    router.push('/app');
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
        {onBackToHome && (
          <div className="text-center">
            <button
              onClick={onBackToHome}
              className="text-sm text-gray-600 hover:text-gray-800 underline"
            >
              ← Back to Home
            </button>
          </div>
        )}
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
