'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { loginSchema, type LoginDTO } from '@/schema/auth'
import { FormField } from '@/components/ui/FormField'
import { useToast } from '@/hooks/useToast'
import Button from '@/components/ui/Button'
import { AuthRepository } from '@/repositories/AuthRepository'
import { mapAuthErrorToToast } from '@/lib/authFeedback'

interface LoginCardProps {
  onSuccess: () => void
  onSwitchToSignup: () => void
}

type FormState = 'idle' | 'validating' | 'loading' | 'success' | 'error'

export function LoginCard({ onSuccess, onSwitchToSignup }: LoginCardProps) {
  const [formState, setFormState] = useState<FormState>('idle')
  const { toast } = useToast()
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    trigger
  } = useForm<LoginDTO>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange'
  })

  const onSubmit = async (data: LoginDTO) => {
    try {
      setFormState('loading')
      
      await AuthRepository.login({
        email: data.email,
        password: data.password,
      })

      setFormState('success')
      toast({
        title: 'Login successful',
        description: 'Redirecting to dashboard...',
        variant: 'success'
      })
      
      setTimeout(() => {
        onSuccess()
      }, 500)
    } catch (error) {
      setFormState('error')
      const mapped = mapAuthErrorToToast({ mode: 'login', email: data.email, error })
      toast(mapped.toast)
      console.error('Login error:', error)
    }
  }

  const handleBlur = async (field: keyof LoginDTO) => {
    setFormState('validating')
    await trigger(field)
    setFormState('idle')
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      transition={{ duration: 0.25 }}
      className="w-full max-w-md mx-auto bg-discord-dark rounded-lg border border-discord-darker p-6 shadow-xl shadow-black/10"
    >
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-white">Welcome back</h1>
        <p className="text-discord-muted mt-2">Sign in to your account</p>
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

        <Button
          type="submit"
          isLoading={formState === 'loading'}
          disabled={formState === 'loading' || formState === 'validating'}
          className="w-full"
        >
          Sign in
        </Button>
      </form>

      <div className="mt-4 text-center">
        <button
          type="button"
          onClick={onSwitchToSignup}
          className="text-discord-accent hover:text-discord-accent/90 text-sm font-medium"
        >
          Don&apos;t have an account? Sign up
        </button>
      </div>
    </motion.div>
  )
}
