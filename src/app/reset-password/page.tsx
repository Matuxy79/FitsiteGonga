'use client';

import { Suspense, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, ShieldCheck } from 'lucide-react';
import { AuthRepository } from '@/repositories/AuthRepository';
import { useToast } from '@/hooks/useToast';
import { mapAuthErrorToToast } from '@/lib/authFeedback';

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <ResetPasswordPageInner />
    </Suspense>
  );
}

function ResetPasswordPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const { toast } = useToast();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const hasToken = token.length > 0;
  const mismatch = confirmPassword.length > 0 && password !== confirmPassword;

  const submitDisabled = useMemo(() => {
    if (!hasToken) return true;
    if (submitting) return true;
    if (password.length < 8) return true;
    if (password !== confirmPassword) return true;
    return false;
  }, [confirmPassword, hasToken, password, submitting]);

  const handleSubmit = async () => {
    if (submitDisabled) return;

    try {
      setSubmitting(true);
      await AuthRepository.resetPassword({ token, password });
      router.replace('/?reason=password-reset');
    } catch (error: any) {
      const mapped = mapAuthErrorToToast({ mode: 'login', error });
      toast(mapped.toast);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-black overflow-hidden font-sans text-slate-200 selection:bg-emerald-500/50 selection:text-black">
      <div
        className="absolute inset-0 z-50 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")"
        }}
      />
      <div className="absolute inset-0 z-0 bg-gradient-to-r from-black via-black/80 to-transparent" />

      <div className="relative z-10 min-h-screen flex items-center justify-center px-6">
        <div className="w-full max-w-md border border-emerald-500/15 bg-black/40 backdrop-blur-xl shadow-[0_0_30px_rgba(16,185,129,0.12)]">
          <div className="p-8 border-b border-white/5">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
              <h1 className="text-sm font-black tracking-[0.35em] uppercase">Reset Password</h1>
            </div>
            <p className="mt-3 text-xs font-mono text-slate-500 tracking-wide">
              Set a new access phrase for your account.
            </p>
          </div>

          <div className="p-8 space-y-6">
            {!hasToken ? (
              <div className="space-y-4">
                <p className="text-xs font-mono text-slate-400">
                  Missing reset token. Request a new link from the login screen.
                </p>
                <button
                  type="button"
                  onClick={() => router.replace('/')}
                  className="w-full bg-slate-800 border border-slate-700 hover:bg-emerald-900 hover:border-emerald-500/50 transition-colors px-4 py-3 text-xs font-black tracking-[0.4em] uppercase text-slate-100"
                >
                  Back to Login
                </button>
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-slate-500 mb-2">
                    New Password
                  </label>
                  <input
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    type="password"
                    autoComplete="new-password"
                    placeholder="New password"
                    className="w-full bg-black border border-slate-700 p-3 text-sm text-emerald-400 font-mono focus:outline-none focus:border-emerald-500"
                  />
                  <p className="text-[10px] text-slate-600 mt-2 font-mono">Minimum 8 characters.</p>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-slate-500 mb-2">
                    Confirm Password
                  </label>
                  <input
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    type="password"
                    autoComplete="new-password"
                    placeholder="Confirm password"
                    className="w-full bg-black border border-slate-700 p-3 text-sm text-emerald-400 font-mono focus:outline-none focus:border-emerald-500"
                  />
                  {mismatch && (
                    <p className="text-[10px] text-red-400 mt-2 font-mono tracking-wide">
                      Passwords do not match.
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitDisabled}
                  className="w-full bg-slate-800 border border-slate-700 hover:bg-emerald-900 hover:border-emerald-500/50 transition-colors px-4 py-3 text-xs font-black tracking-[0.4em] uppercase text-slate-100 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                  <span>Set New Password</span>
                  {submitting && <Loader2 className="w-4 h-4 text-emerald-400 animate-spin" />}
                </button>

                <button
                  type="button"
                  onClick={() => router.replace('/')}
                  className="w-full text-[10px] font-mono text-slate-500 hover:text-emerald-300 tracking-[0.35em] uppercase transition-colors"
                >
                  Back to Login
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
