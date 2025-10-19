'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/useToast';
import { EMAIL_VERIFICATION, AUTH_MESSAGES } from '@/lib/auth/auth-constants';
import { parseAuthError } from '@/lib/auth/auth-utils';
import { AuthCallbackState } from '@/types/auth';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [state, setState] = useState<AuthCallbackState>({
    status: 'loading',
    message: 'Verifying your email...',
  });

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.exchangeCodeForSession(window.location.href);

        if (error) {
          console.error('Auth callback error:', error);
          const authError = parseAuthError(error);

          setState({
            status: 'error',
            message: 'Verification failed',
          });

          toast({
            title: 'Verification failed',
            description: authError.message,
            variant: 'destructive',
          });

          setTimeout(() => {
            router.replace('/');
          }, 3000);
          return;
        }

        if (data.session) {
          setState({
            status: 'success',
            message: 'Email verified successfully!',
          });

          toast({
            title: AUTH_MESSAGES.EMAIL_VERIFICATION_SUCCESS,
            description: 'Your account has been verified. Redirecting to dashboard...',
            variant: 'success',
          });

          setTimeout(() => {
            router.replace('/');
          }, EMAIL_VERIFICATION.REDIRECT_DELAY);
        }
      } catch (error) {
        console.error('Unexpected error:', error);
        const authError = parseAuthError(error);

        setState({
          status: 'error',
          message: 'Something went wrong',
        });

        toast({
          title: 'Something went wrong',
          description: authError.message,
          variant: 'destructive',
        });

        setTimeout(() => {
          router.replace('/');
        }, 3000);
      }
    };

    // Only run if we have search params (indicating this is a callback)
    if (searchParams && searchParams.toString()) {
      handleAuthCallback();
    } else {
      // No search params, redirect to home
      router.replace('/');
    }
  }, [searchParams, router, toast]);

  const getStatusMessage = () => {
    switch (state.status) {
      case 'loading':
        return 'Please wait while we confirm your account.';
      case 'success':
        return 'Redirecting you to the dashboard...';
      case 'error':
        return 'Please try again or contact support if the problem persists.';
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">{state.message}</h2>
        <p className="text-gray-600">{getStatusMessage()}</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading...</h2>
            <p className="text-gray-600">Please wait while we process your request.</p>
          </div>
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
