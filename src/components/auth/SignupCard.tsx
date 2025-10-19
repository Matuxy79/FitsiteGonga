'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { signupSchema, type SignupDTO } from '@/schema/auth';
import { FormField } from '@/components/ui/FormField';
import { useToast } from '@/hooks/useToast';
// Removed useEmailVerification import - now using local state
import { supabase } from '@/lib/supabase';
import { parseAuthError, getEmailRedirectUrl, generateDisplayName } from '@/lib/auth/auth-utils';
import { AUTH_MESSAGES } from '@/lib/auth/auth-constants';
import { getPostAuthRedirect } from '@/lib/auth/profile-redirect';
import { VerifyEmailDialog } from './VerifyEmailDialog';

interface SignupCardProps {
  onSuccess: () => void;
  onSwitchToLogin: () => void;
}

type FormState = 'idle' | 'validating' | 'loading' | 'success' | 'error';

export function SignupCard({ onSuccess, onSwitchToLogin }: SignupCardProps) {
  const [formState, setFormState] = useState<FormState>('idle');
  const [verifying, setVerifying] = useState<{ open: boolean; email: string }>({
    open: false,
    email: '',
  });
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    trigger,
  } = useForm<SignupDTO>({
    resolver: zodResolver(signupSchema),
    mode: 'onChange',
  });

  const onSubmit = async (data: SignupDTO) => {
    try {
      setFormState('loading');

      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            display_name: generateDisplayName(data.email),
          },
          emailRedirectTo: getEmailRedirectUrl(),
        },
      });

      if (error) {
        throw error;
      }

      // Handle email verification required
      if (authData?.user && !authData.session) {
        setVerifying({ open: true, email: data.email });
        setFormState('idle');
        return;
      }

      // Handle immediate success (email verification disabled)
      if (authData?.user && authData.session) {
        setFormState('success');

        // Check profile completion and redirect accordingly
        const redirectPath = await getPostAuthRedirect();

        toast({
          title: AUTH_MESSAGES.SIGNUP_SUCCESS,
          description:
            redirectPath === '/account-setup'
              ? 'Welcome! Please complete your profile setup...'
              : 'Welcome to FitsiteGonga!',
          variant: 'success',
        });

        setTimeout(() => {
          if (redirectPath === '/account-setup') {
            window.location.href = '/account-setup';
          } else {
            onSuccess();
          }
        }, 1000);
      }
    } catch (error) {
      setFormState('error');
      const authError = parseAuthError(error);

      toast({
        title: 'Signup failed',
        description: authError.message,
        variant: 'destructive',
      });

      console.error('Signup error:', error);
    }
  };

  const handleBlur = async (field: keyof SignupDTO) => {
    setFormState('validating');
    await trigger(field);
    setFormState('idle');
  };

  const handleVerificationComplete = () => {
    setVerifying({ open: false, email: '' });
    onSwitchToLogin();
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -10 }}
        transition={{ duration: 0.25 }}
        className="w-full max-w-md mx-auto bg-white rounded-lg shadow-lg p-6"
      >
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Create account</h1>
          <p className="text-gray-600 mt-2">Sign up to get started</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            id="email"
            label="Email"
            type="email"
            placeholder="Enter your email"
            error={errors.email?.message}
            {...register('email')}
            onBlur={() => handleBlur('email')}
          />

          <FormField
            id="password"
            label="Password"
            type="password"
            placeholder="Enter your password"
            error={errors.password?.message}
            {...register('password')}
            onBlur={() => handleBlur('password')}
          />

          <FormField
            id="confirmPassword"
            label="Confirm Password"
            type="password"
            placeholder="Confirm your password"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
            onBlur={() => handleBlur('confirmPassword')}
          />

          <button
            type="submit"
            disabled={formState === 'loading' || formState === 'validating'}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {formState === 'loading' ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Already have an account? Sign in
          </button>
        </div>
      </motion.div>

      {verifying.open && (
        <VerifyEmailDialog email={verifying.email} onClose={handleVerificationComplete} />
      )}
    </>
  );
}
