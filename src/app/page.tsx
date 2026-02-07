'use client';

import { Suspense, useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  Zap,
  ChevronRight,
  Upload,
  Settings,
  X,
  Lock,
  Loader2
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { AuthRepository } from '@/repositories/AuthRepository';
import { getEmailSector, mapAuthErrorToToast, type FieldErrors } from '@/lib/authFeedback';

type AuthMode = 'login' | 'signup';

export default function ObsidianLanding() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <ObsidianLandingInner />
    </Suspense>
  );
}

function ObsidianLandingInner() {
  const [mode, setMode] = useState<AuthMode>('login');
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [bgImage, setBgImage] = useState(
    'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2070&auto=format&fit=crop'
  );
  const [tempBgInput, setTempBgInput] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [codename, setCodename] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [capsLockOn, setCapsLockOn] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState<number | null>(null);
  const [redirecting, setRedirecting] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSending, setResetSending] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const handledReasonRef = useRef(false);
  const { login, register, loading, user } = useAuth();
  const { toast } = useToast();
  const isAdmin = user?.role === 'admin';

  const isLockedOut = cooldownSeconds !== null && cooldownSeconds > 0;

  useEffect(() => {
    if (handledReasonRef.current) return;
    const reason = searchParams.get('reason');
    if (!reason) return;

    handledReasonRef.current = true;

    if (reason === 'session-expired') {
      toast({
        status: 'WARN',
        title: 'SESSION EXPIRED',
        message: 'Sign in again to continue.',
        sector: 'AUTH',
      });
    } else if (reason === 'login-required') {
      toast({
        status: 'INFO',
        title: 'LOGIN REQUIRED',
        message: 'Authenticate to access the command center.',
        sector: 'AUTH',
      });
    } else if (reason === 'signed-out') {
      toast({
        status: 'OK',
        title: 'SIGNED OUT',
        message: 'Credentials cleared.',
        sector: 'AUTH',
      });
    } else if (reason === 'password-reset') {
      toast({
        status: 'OK',
        title: 'PASSWORD UPDATED',
        message: 'Sign in with your new password.',
        sector: 'AUTH',
      });
    }

    router.replace('/');
  }, [router, searchParams, toast]);

  useEffect(() => {
    if (redirecting) return;
    if (loading) return;
    if (!user) return;

    toast({
      status: 'INFO',
      title: 'SESSION ACTIVE',
      message: 'Redirecting to command center...',
      sector: 'AUTH',
    });

    setRedirecting(true);
    router.replace('/dashboard');
  }, [loading, redirecting, router, toast, user]);

  const handleAdminSave = () => {
    if (tempBgInput) setBgImage(tempBgInput);
    setIsAdminOpen(false);
  };

  const openResetModal = () => {
    setResetEmail(email.trim());
    setResetSent(false);
    setResetOpen(true);
  };

  const handleSendReset = async () => {
    if (resetSending) return;

    const trimmed = resetEmail.trim();
    if (!trimmed) {
      toast({
        status: 'WARN',
        title: 'EMAIL REQUIRED',
        message: 'Enter the email tied to your account.',
        sector: 'AUTH',
      });
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      toast({
        status: 'WARN',
        title: 'INVALID EMAIL',
        message: 'Enter a valid email address.',
        sector: 'AUTH',
      });
      return;
    }

    try {
      setResetSending(true);
      await AuthRepository.requestPasswordReset(trimmed);
      setResetSent(true);
      toast({
        status: 'OK',
        title: 'RESET LINK SENT',
        message: 'If that email exists, check your inbox for a reset link.',
        sector: 'AUTH',
      });
    } catch (error: any) {
      const mapped = mapAuthErrorToToast({ mode: 'login', email: trimmed, error });
      toast(mapped.toast);
    } finally {
      setResetSending(false);
    }
  };

  const submitDisabled = useMemo(() => {
    return loading || redirecting || isLockedOut;
  }, [loading, redirecting, isLockedOut]);

  useEffect(() => {
    if (!isLockedOut) return;
    const interval = setInterval(() => {
      setCooldownSeconds((prev) => {
        if (prev === null) return prev;
        if (prev <= 1) return null;
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isLockedOut]);

  const clearFieldError = (field: keyof FieldErrors) => {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const validateInputs = (): { ok: true; email: string; password: string; codename: string } | { ok: false } => {
    const nextErrors: FieldErrors = {};

    const trimmedEmail = email.trim();
    const trimmedCodename = codename.trim();

    if (!trimmedEmail) nextErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) nextErrors.email = 'Enter a valid email address';

    if (!password) nextErrors.password = 'Password is required';
    else if (mode === 'signup' && password.length < 8) nextErrors.password = 'Password must be at least 8 characters';

    if (mode === 'signup' && !trimmedCodename) nextErrors.codename = 'Codename is required';

    setFieldErrors(nextErrors);

    const firstError = nextErrors.email || nextErrors.password || nextErrors.codename;
    if (firstError) {
      toast({
        status: 'WARN',
        title: 'CHECK YOUR INPUTS',
        message: firstError,
        sector: 'AUTH',
      });
      return { ok: false };
    }

    return { ok: true, email: trimmedEmail, password, codename: trimmedCodename };
  };

  const handleSubmit = async () => {
    if (submitDisabled) return;

    const validated = validateInputs();
    if (!validated.ok) return;

    try {
      if (mode === 'login') {
        await login(validated.email, validated.password);
        toast({
          status: 'OK',
          title: 'IDENTITY VERIFIED',
          message: 'Access granted. Redirecting to command center...',
          sector: 'AUTH',
        });
      } else {
        await register(validated.email, validated.password, validated.codename);
        toast({
          status: 'OK',
          title: 'IDENTITY CONFIRMED',
          message: 'Account created. Redirecting to command center...',
          sector: getEmailSector(validated.email),
        });
      }
      setRedirecting(true);
      router.push('/dashboard');
    } catch (error: any) {
      const mapped = mapAuthErrorToToast({ mode, email: validated.email, error });
      if (mode === 'signup' && mapped.toast.title === 'OPERATIVE EXISTS') {
        setMode('login');
        setCodename('');
        setCapsLockOn(false);
      }
      if (mapped.fieldErrors) setFieldErrors((prev) => ({ ...prev, ...mapped.fieldErrors }));
      if (mapped.retryAfterSeconds) setCooldownSeconds(mapped.retryAfterSeconds);
      toast(mapped.toast);
    }
  };

  const handleEnterSubmit = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') handleSubmit();
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
      <div className="absolute inset-0 z-0">
        <motion.div
          key={bgImage}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0 bg-cover bg-center grayscale contrast-[1.2] brightness-50"
          style={{ backgroundImage: `url(${bgImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40" />
      </div>
      <div className="relative z-10 w-full h-screen flex flex-col md:flex-row">
        <div className="flex-1 flex flex-col justify-center px-8 md:px-20 lg:px-32 relative">
          <div className="absolute top-10 left-8 md:left-20 flex items-center space-x-3 opacity-80">
            <div className="w-10 h-10 bg-emerald-600 flex items-center justify-center transform -skew-x-12 border border-emerald-400/30">
              <Zap className="text-black w-6 h-6 fill-current" />
            </div>
            <span className="font-black text-xl tracking-[0.3em] text-slate-400">
              FITSITE<span className="text-emerald-500">GONGA</span>
            </span>
          </div>
          <div className="space-y-2 mt-20 md:mt-0">
            <motion.h1
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="text-6xl md:text-8xl lg:text-9xl font-black leading-[0.85] tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-slate-100 to-slate-600 drop-shadow-2xl"
            >
              DOMINATE.
            </motion.h1>
            <motion.h1
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
              className="text-6xl md:text-8xl lg:text-9xl font-black leading-[0.85] tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-slate-400 to-slate-800 drop-shadow-2xl"
            >
              NO EXCUSES.
            </motion.h1>
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8 max-w-md"
          >
            <div className="h-1 w-12 bg-emerald-500/60 rounded-full mb-4" />
            <p className="text-xs font-mono text-slate-500 uppercase tracking-[0.4em] mb-2">
              {'// Activity Log'}
            </p>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-slate-300 font-semibold">Realtime Progress Amplified</p>
                <p className="text-slate-400 font-mono text-[11px]">
                  `progressRoutes.ts` emits <span className="text-emerald-400">progress:new</span> after each log so other clients immediately see the new reps/metrics.
                </p>
              </div>
              <div>
                <p className="text-slate-300 font-semibold">Challenge Lifecycle Flow</p>
                <p className="text-slate-400 font-mono text-[11px]">
                  `challengeRoutes.ts` broadcasts <span className="text-emerald-400">challenge:created/updated</span> and <span className="text-emerald-400">challenge:deleted</span> when trainers author new missions.
                </p>
              </div>
              <div>
                <p className="text-slate-300 font-semibold">Progress Photos Staged</p>
                <p className="text-slate-400 font-mono text-[11px]">
                  `storageRoutes.ts` signs each upload to AWS S3, keeping photo metadata ready for the progress feed.
                </p>
              </div>
            </div>
          </motion.div>
          {isAdmin && (
            <div className="absolute bottom-10 left-8 md:left-20">
              <button
                onClick={() => setIsAdminOpen(true)}
                className="group flex items-center space-x-2 text-slate-700 hover:text-emerald-500 transition-colors"
              >
                <Settings className="w-5 h-5 group-hover:rotate-90 transition-transform duration-500" />
                <span className="text-[10px] uppercase font-bold tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                  Admin Protocol
                </span>
              </button>
            </div>
          )}
        </div>
        <div className="w-full md:w-[500px] h-full bg-zinc-900/95 backdrop-blur-xl border-l border-white/5 shadow-2xl flex flex-col relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[1px] h-full bg-gradient-to-b from-transparent via-emerald-500/20 to-transparent" />
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          <div className="p-12 pb-8 pt-20">
            <h2 className="text-2xl font-bold tracking-widest text-slate-200 uppercase flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-emerald-600" />
              {mode === 'login' ? 'Identify' : 'Enlist'}
            </h2>
            <p className="text-xs font-mono text-slate-500 mt-2 uppercase tracking-wide">
              {mode === 'login'
                ? 'Present Credentials for Access.'
                : 'Begin your initiation.'}
            </p>
          </div>
          <div className="flex-1 px-12 space-y-8">
            <div className="group">
              <label className="block text-[10px] uppercase tracking-widest text-slate-500 mb-2 group-focus-within:text-emerald-500 transition-colors">
                Email
              </label>
              <div className="relative">
                <input
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    clearFieldError('email');
                  }}
                  onKeyDown={handleEnterSubmit}
                  type="email"
                  autoComplete="email"
                  aria-invalid={fieldErrors.email ? true : undefined}
                  className={`w-full bg-black/40 border-b-2 ${fieldErrors.email ? 'border-red-500' : 'border-slate-700'} text-slate-200 py-4 px-2 font-mono text-sm focus:outline-none focus:border-emerald-500 transition-all placeholder:text-slate-700`}
                  placeholder="Email address"
                />
                <div className="absolute bottom-0 left-0 w-full h-[1px] bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] opacity-0 group-focus-within:opacity-100 transition-opacity" />
              </div>
              {fieldErrors.email && (
                <p className="mt-2 text-[10px] font-mono text-red-400 tracking-wide">
                  {fieldErrors.email}
                </p>
              )}
            </div>
            <div className="group">
              <label className="block text-[10px] uppercase tracking-widest text-slate-500 mb-2 group-focus-within:text-emerald-500 transition-colors">
                Password
              </label>
              <div className="relative">
                <input
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    clearFieldError('password');
                  }}
                  onKeyDown={(event) => {
                    setCapsLockOn(event.getModifierState('CapsLock'));
                    handleEnterSubmit(event);
                  }}
                  type="password"
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  aria-invalid={fieldErrors.password ? true : undefined}
                  className={`w-full bg-black/40 border-b-2 ${fieldErrors.password ? 'border-red-500' : 'border-slate-700'} text-slate-200 py-4 px-2 font-mono text-sm focus:outline-none focus:border-emerald-500 transition-all placeholder:text-slate-700`}
                  placeholder="Password"
                />
                <div className="absolute bottom-0 left-0 w-full h-[1px] bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] opacity-0 group-focus-within:opacity-100 transition-opacity" />
              </div>
              <div className="mt-2 space-y-1">
                {capsLockOn && (
                  <p className="text-[10px] font-mono text-amber-400 tracking-wide">
                    CAPS LOCK IS ON
                  </p>
                )}
                {mode === 'signup' && (
                  <p className="text-[10px] font-mono text-slate-500 tracking-wide">
                    Minimum 8 characters
                  </p>
                )}
                {fieldErrors.password && (
                  <p className="text-[10px] font-mono text-red-400 tracking-wide">
                    {fieldErrors.password}
                  </p>
                )}
                {mode === 'login' && (
                  <div className="pt-1 flex justify-end">
                    <button
                      type="button"
                      onClick={openResetModal}
                      className="text-[10px] font-mono text-slate-500 hover:text-emerald-300 tracking-[0.35em] uppercase transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>
                )}
              </div>
            </div>
            <AnimatePresence>
              {mode === 'signup' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden group"
                >
                  <label className="block text-[10px] uppercase tracking-widest text-slate-500 mb-2 group-focus-within:text-emerald-500 transition-colors">
                    Codename
                  </label>
                  <div className="relative">
                    <input
                      value={codename}
                      onChange={(event) => {
                        setCodename(event.target.value);
                        clearFieldError('codename');
                      }}
                      onKeyDown={handleEnterSubmit}
                      type="text"
                      autoComplete="nickname"
                      aria-invalid={fieldErrors.codename ? true : undefined}
                      className={`w-full bg-black/40 border-b-2 ${fieldErrors.codename ? 'border-red-500' : 'border-slate-700'} text-slate-200 py-4 px-2 font-mono text-sm focus:outline-none focus:border-emerald-500 transition-all placeholder:text-slate-700`}
                      placeholder="Codename (display name)"
                    />
                    <div className="absolute bottom-0 left-0 w-full h-[1px] bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] opacity-0 group-focus-within:opacity-100 transition-opacity" />
                  </div>
                  {fieldErrors.codename && (
                    <p className="mt-2 text-[10px] font-mono text-red-400 tracking-wide">
                      {fieldErrors.codename}
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
            <div className="pt-8">
              <button
                onClick={handleSubmit}
                disabled={submitDisabled}
                className="w-full relative group overflow-hidden bg-slate-800 hover:bg-emerald-900 transition-all duration-300 h-16 clip-corner-br disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
                <div className="absolute bottom-0 left-0 h-1 w-full bg-emerald-600 group-hover:h-full transition-all duration-300 opacity-20" />
                <div className="relative z-10 flex items-center justify-between px-6 h-full border border-slate-700 group-hover:border-emerald-500/50 transition-colors">
                  <span className="font-black text-lg tracking-widest uppercase text-slate-300 group-hover:text-white">
                    {redirecting
                      ? 'Redirecting...'
                      : isLockedOut
                        ? `Wait ${cooldownSeconds}s`
                        : loading
                          ? 'Processing...'
                          : mode === 'login'
                            ? 'Engage'
                            : 'Initialize'}
                  </span>
                  {submitDisabled ? (
                    <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
                  ) : (
                    <ChevronRight className="w-6 h-6 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
                  )}
                </div>
              </button>
            </div>
          </div>
          <div className="p-8 border-t border-slate-800 bg-black/20">
            <div className="flex justify-between items-center text-xs font-mono text-slate-500">
              <button
                onClick={() => {
                  setMode((m) => (m === 'login' ? 'signup' : 'login'));
                  setFieldErrors({});
                  setCooldownSeconds(null);
                  setCapsLockOn(false);
                  setResetOpen(false);
                  setResetSent(false);
                }}
                className="text-[10px] tracking-[0.6em] font-black uppercase px-3 py-2 border border-emerald-500/40 rounded-sm bg-white/5 hover:bg-emerald-500/10 transition-colors text-slate-100 shadow-[0_0_25px_rgba(16,185,129,0.25)] flex items-center gap-1"
              >
                {mode === 'login' ? 'NEW ACCOUNT' : 'BACK TO LOGIN'}
              </button>
              <span className="flex items-center gap-1">
                <Lock className="w-3 h-3" /> SECURE
              </span>
            </div>
          </div>
        </div>
      </div>
      <AnimatePresence>
        {resetOpen && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-lg bg-zinc-900 border border-slate-700 p-8 rounded-none shadow-2xl relative"
            >
              <button
                type="button"
                onClick={() => {
                  setResetOpen(false);
                  setResetSent(false);
                }}
                className="absolute top-4 right-4 text-slate-500 hover:text-white"
                aria-label="Close password reset"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="flex items-center gap-3 mb-6 border-b border-slate-800 pb-4">
                <ShieldCheck className="text-emerald-500 w-6 h-6" />
                <h3 className="font-bold text-xl tracking-widest uppercase">Password Reset</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">
                    Email
                  </label>
                  <input
                    value={resetEmail}
                    onChange={(event) => setResetEmail(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') handleSendReset();
                    }}
                    type="email"
                    autoComplete="email"
                    placeholder="Email address"
                    className="w-full bg-black border border-slate-700 p-3 text-sm text-emerald-400 font-mono focus:outline-none focus:border-emerald-500"
                  />
                  <p className="text-[10px] text-slate-600 mt-2 font-mono">
                    If the account exists, a reset link will be sent.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleSendReset}
                  disabled={resetSending}
                  className="w-full bg-slate-800 border border-slate-700 hover:bg-emerald-900 hover:border-emerald-500/50 transition-colors px-4 py-3 text-xs font-black tracking-[0.4em] uppercase text-slate-100 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {resetSending ? 'SENDING...' : resetSent ? 'SEND AGAIN' : 'SEND RESET LINK'}
                </button>

                {resetSent && (
                  <div className="border border-emerald-500/25 bg-emerald-500/5 p-3 text-[10px] text-emerald-300 font-mono tracking-[0.25em] uppercase">
                    Check your inbox. Link expires soon.
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isAdmin && isAdminOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-lg bg-zinc-900 border border-slate-700 p-8 rounded-none shadow-2xl relative"
            >
              <button
                onClick={() => setIsAdminOpen(false)}
                className="absolute top-4 right-4 text-slate-500 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
              <div className="flex items-center gap-3 mb-6 border-b border-slate-800 pb-4">
                <Settings className="text-emerald-500 w-6 h-6" />
                <h3 className="font-bold text-xl tracking-widest uppercase">Admin Command</h3>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">
                    Global Background Source (URL)
                  </label>
                  <div className="flex gap-2">
                    <input
                      value={tempBgInput}
                      onChange={(e) => setTempBgInput(e.target.value)}
                      placeholder="https://..."
                      className="flex-1 bg-black border border-slate-700 p-3 text-sm text-emerald-400 font-mono focus:outline-none focus:border-emerald-500"
                    />
                    <button className="bg-slate-800 p-3 border border-slate-700 hover:bg-slate-700">
                      <Upload className="w-5 h-5 text-slate-300" />
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-600 mt-2">
                    Paste a high-res image URL to override the facility backdrop.
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div
                    className="h-16 bg-slate-800 cursor-pointer hover:ring-2 ring-emerald-500 bg-cover bg-center opacity-50 hover:opacity-100 transition-all"
                    onClick={() =>
                      setBgImage(
                        'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop'
                      )
                    }
                    style={{
                      backgroundImage:
                        'url(https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop)'
                    }}
                  />
                  <div
                    className="h-16 bg-slate-800 cursor-pointer hover:ring-2 ring-emerald-500 bg-cover bg-center opacity-50 hover:opacity-100 transition-all"
                    onClick={() =>
                      setBgImage(
                        'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2070&auto=format&fit=crop'
                      )
                    }
                    style={{
                      backgroundImage:
                        'url(https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2070&auto=format&fit=crop)'
                    }}
                  />
                  <div
                    className="h-16 bg-slate-800 cursor-pointer hover:ring-2 ring-emerald-500 bg-cover bg-center opacity-50 hover:opacity-100 transition-all"
                    onClick={() =>
                      setBgImage(
                        'https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?q=80&w=2069&auto=format&fit=crop'
                      )
                    }
                    style={{
                      backgroundImage:
                        'url(https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?q=80&w=2069&auto=format&fit=crop)'
                    }}
                  />
                </div>
              </div>
              <button
                onClick={handleAdminSave}
                className="w-full mt-8 bg-emerald-600 hover:bg-emerald-500 text-black font-black uppercase py-4 tracking-widest transition-all"
              >
                Execute Update
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
