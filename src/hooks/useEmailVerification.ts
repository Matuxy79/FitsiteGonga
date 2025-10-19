import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from './useToast';
import { getEmailRedirectUrl } from '@/lib/auth/auth-utils';
import { EMAIL_VERIFICATION, AUTH_MESSAGES } from '@/lib/auth/auth-constants';
import { parseAuthError } from '@/lib/auth/auth-utils';

export function useEmailVerification() {
  const { toast } = useToast();
  const [state, setState] = useState({
    isOpen: false,
    email: '',
    resending: false,
    cooldown: 0,
  });

  const openVerification = (email: string) => {
    setState(prev => ({ ...prev, isOpen: true, email }));
  };

  const closeVerification = () => {
    setState(prev => ({ ...prev, isOpen: false, email: '', cooldown: 0 }));
  };

  const resendEmail = async () => {
    if (state.resending || state.cooldown > 0) return;

    setState(prev => ({ ...prev, resending: true }));

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: state.email,
        options: {
          emailRedirectTo: getEmailRedirectUrl(),
        },
      });

      if (error) {
        const authError = parseAuthError(error);
        toast({
          title: 'Could not resend email',
          description: authError.message,
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: AUTH_MESSAGES.EMAIL_RESEND_SUCCESS,
        description: `We've re-sent a verification link to ${state.email}`,
        variant: 'success',
      });

      setState(prev => ({ ...prev, cooldown: EMAIL_VERIFICATION.RESEND_COOLDOWN }));
    } catch (error) {
      const authError = parseAuthError(error);
      toast({
        title: 'Error',
        description: authError.message,
        variant: 'destructive',
      });
    } finally {
      setState(prev => ({ ...prev, resending: false }));
    }
  };

  // Cooldown timer
  useEffect(() => {
    if (state.cooldown > 0) {
      const timer = setTimeout(() => {
        setState(prev => ({ ...prev, cooldown: prev.cooldown - 1 }));
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [state.cooldown]);

  return {
    ...state,
    openVerification,
    closeVerification,
    resendEmail,
  };
}
