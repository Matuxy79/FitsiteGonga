-- Add role column to profiles table to consolidate user systems
-- This migration adds the role column from the old users table to profiles

-- Add role column to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS role TEXT CHECK (role IN ('client', 'trainer', 'admin')) DEFAULT 'client';

-- Add training_prefs column for training preferences from account setup
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS training_prefs JSONB;

-- Update any existing profiles to have client role by default
UPDATE public.profiles 
SET role = 'client' 
WHERE role IS NULL;

-- Make role NOT NULL after setting defaults
ALTER TABLE public.profiles 
ALTER COLUMN role SET NOT NULL;

-- Add RLS policy for role-based access (trainers can view client profiles)
CREATE POLICY IF NOT EXISTS "profiles_trainer_view_clients"
  ON public.profiles FOR SELECT USING (
    auth.uid() = id OR 
    EXISTS (
      SELECT 1 FROM public.profiles trainer 
      WHERE trainer.id = auth.uid() 
      AND trainer.role IN ('trainer', 'admin')
    )
  );

-- Add index for role lookups
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
