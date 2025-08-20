-- Add professional_goals column to members table to store goals from onboarding step 2

ALTER TABLE public.members
ADD COLUMN IF NOT EXISTS professional_goals TEXT;

-- Add comment for documentation
COMMENT ON COLUMN public.members.professional_goals IS 'Professional goals entered during onboarding step 2';

-- Also add years_of_experience column if missing
ALTER TABLE public.members
ADD COLUMN IF NOT EXISTS years_of_experience INTEGER;

COMMENT ON COLUMN public.members.years_of_experience IS 'Years of professional experience entered during onboarding';