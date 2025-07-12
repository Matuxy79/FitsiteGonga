'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { loginSchema, type LoginDTO } from '@/schema/auth'
import { FormField } from '@/components/ui/FormField'
import { useToast } from '@/hooks/useToast'
import { supabase } from '@/lib/supabase'
import { generateErrorRef } from '@/lib/utils'

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
      
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })

      if (error) {
        throw error
      }

      if (authData?.user) {
        setFormState('success')
        toast({
          title: 'Login successful',
          description: 'Redirecting to dashboard...',
          variant: 'success'
        })
        
        setTimeout(() => {
          onSuccess()
        }, 500)
      }
    } catch (error) {
      setFormState('error')
      const errorRef = generateErrorRef()
      
      toast({
        title: 'Login failed',
        description: `Something went wrong (REF-${errorRef})`,
        variant: 'destructive'
      })
      
      console.error('Login error:', error, `REF-${errorRef}`)
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
      className="w-full max-w-md mx-auto bg-white rounded-lg shadow-lg p-6"
    >
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
        <p className="text-gray-600 mt-2">Sign in to your account</p>
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

        <button
          type="submit"
          disabled={formState === 'loading' || formState === 'validating'}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {formState === 'loading' ? 'Signing in...' : 'Sign in'}
        </button>
      </form>

      <div className="mt-4 text-center">
        <button
          type="button"
          onClick={onSwitchToSignup}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          Don't have an account? Sign up
        </button>
      </div>
    </motion.div>
  )
}