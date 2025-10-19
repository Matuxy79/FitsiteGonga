'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEmailVerification } from '@/hooks/useEmailVerification';

interface VerifyEmailDialogProps {
  onClose: () => void;
}

export function VerifyEmailDialog({ onClose }: VerifyEmailDialogProps) {
  const { isOpen, email, resending, cooldown, resendEmail } = useEmailVerification();

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: 'spring', duration: 0.3 }}
          className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
          onClick={e => e.stopPropagation()}
        >
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
              <svg
                className="h-6 w-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>

            <h2 className="text-xl font-semibold text-gray-900 mb-2">Check your email</h2>

            <p className="text-gray-600 mb-4">
              We&apos;ve sent a verification link to{' '}
              <span className="font-medium text-gray-900">{email}</span>.
            </p>

            <p className="text-sm text-gray-500 mb-6">
              Click the link in your email to confirm your account, then return here to sign in.
            </p>

            <div className="space-y-3">
              <button
                onClick={resendEmail}
                disabled={resending || cooldown > 0}
                className="w-full rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {resending
                  ? 'Sending...'
                  : cooldown > 0
                    ? `Resend in ${cooldown}s`
                    : 'Resend email'}
              </button>

              <button
                onClick={onClose}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                I verified — take me to Sign in
              </button>
            </div>

            <p className="mt-4 text-xs text-gray-500">
              💡 Check your spam/promotions folder. If you used Apple &quot;Hide My Email&quot;, the
              link goes to that inbox.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
