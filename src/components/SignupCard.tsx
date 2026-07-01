'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { signupSchema, type SignupDTO } from '@/schema/auth'
import { FormField } from '@/components/ui/FormField'
import { useToast } from '@/hooks/useToast'
import Button from '@/components/ui/Button'
import { AuthRepository } from '@/repositories/AuthRepository'
import { mapAuthErrorToToast } from '@/lib/authFeedback'

interface SignupCardProps {
  onSuccess: () => void
  onSwitchToLogin: () => void
}

type FormState = 'idle' | 'validating' | 'loading' | 'success' | 'error'

export function SignupCard({ onSuccess, onSwitchToLogin }: SignupCardProps) {
  const [formState, setFormState] = useState<FormState>('idle')
  const { toast } = useToast()
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    trigger
  } = useForm<SignupDTO>({
    resolver: zodResolver(signupSchema),
    mode: 'onChange'
  })

  const onSubmit = async (data: SignupDTO) => {
    try {
      setFormState('loading')
      
      await AuthRepository.register({
        email: data.email,
        password: data.password,
        display_name: data.displayName,
      })

      setFormState('success')
      toast({
        title: 'Account created successfully',
        description: 'Redirecting to dashboard...',
        variant: 'success'
      })
      
      setTimeout(() => {
        onSuccess()
      }, 2000)
    } catch (error) {
      setFormState('error')
      const mapped = mapAuthErrorToToast({ mode: 'signup', email: data.email, error })
      toast(mapped.toast)
      console.error('Signup error:', error)
    }
  }

  const handleBlur = async (field: keyof SignupDTO) => {
    setFormState('validating')
    await trigger(field)
    setFormState('idle')
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      transition={{ duration: 0.25 }}
      className="w-full max-w-md mx-auto bg-discord-dark rounded-lg border border-discord-darker p-6 shadow-xl shadow-black/10"
    >
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-white">Create account</h1>
        <p className="text-discord-muted mt-2">Sign up to get started</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          id="displayName"
          label="Display Name"
          type="text"
          placeholder="Choose a display name"
          error={errors.displayName?.message}
          {...register('displayName')}
          onBlur={() => handleBlur('displayName')}
        />

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

        <Button
          type="submit"
          isLoading={formState === 'loading'}
          disabled={formState === 'loading' || formState === 'validating'}
          className="w-full"
        >
          Create account
        </Button>
      </form>

      <div className="mt-4 text-center">
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="text-discord-accent hover:text-discord-accent/90 text-sm font-medium"
        >
          Already have an account? Sign in
        </button>
      </div>
    </motion.div>
  )
}
