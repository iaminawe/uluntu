-- Add onboarding-related columns to members table
-- These columns track user progress through the onboarding flow

-- Add onboarding_current_step column
ALTER TABLE public.members 
ADD COLUMN IF NOT EXISTS onboarding_current_step INTEGER DEFAULT 1;

-- Add onboarding_completed_at column
ALTER TABLE public.members 
ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ;

-- Add onboarding_skipped_steps column (array of integers)
ALTER TABLE public.members 
ADD COLUMN IF NOT EXISTS onboarding_skipped_steps INTEGER[] DEFAULT '{}';

-- Add profile_completion_percentage column
ALTER TABLE public.members 
ADD COLUMN IF NOT EXISTS profile_completion_percentage INTEGER DEFAULT 0 CHECK (profile_completion_percentage >= 0 AND profile_completion_percentage <= 100);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_members_onboarding_completed_at ON public.members(onboarding_completed_at);
CREATE INDEX IF NOT EXISTS idx_members_onboarding_current_step ON public.members(onboarding_current_step);

-- Add comments for documentation
COMMENT ON COLUMN public.members.onboarding_current_step IS 'Current step in the onboarding process (1-6)';
COMMENT ON COLUMN public.members.onboarding_completed_at IS 'Timestamp when user completed onboarding';
COMMENT ON COLUMN public.members.onboarding_skipped_steps IS 'Array of step numbers that were skipped';
COMMENT ON COLUMN public.members.profile_completion_percentage IS 'Percentage of profile completion (0-100)';