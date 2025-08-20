-- Add missing columns for onboarding system

-- Add 'level' column to member_skills table
ALTER TABLE public.member_skills
ADD COLUMN IF NOT EXISTS level TEXT DEFAULT 'intermediate';

-- Add constraint for level values
ALTER TABLE public.member_skills
DROP CONSTRAINT IF EXISTS member_skills_level_check;

ALTER TABLE public.member_skills
ADD CONSTRAINT member_skills_level_check
CHECK (level IN ('beginner', 'intermediate', 'advanced', 'expert'));

-- Add 'verified' column to company_members table
ALTER TABLE public.company_members
ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT false;

-- Add 'status' column to group_members table
ALTER TABLE public.group_members
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

-- Add constraint for status values
ALTER TABLE public.group_members
DROP CONSTRAINT IF EXISTS group_members_status_check;

ALTER TABLE public.group_members
ADD CONSTRAINT group_members_status_check
CHECK (status IN ('active', 'inactive', 'pending', 'suspended'));

-- Update RLS policies for member_skills
DROP POLICY IF EXISTS "Users can manage their own skills" ON public.member_skills;
CREATE POLICY "Users can manage their own skills" ON public.member_skills
    FOR ALL USING (auth.uid() = member_id)
    WITH CHECK (auth.uid() = member_id);

-- Update RLS policies for company_members
DROP POLICY IF EXISTS "Users can view company members" ON public.company_members;
CREATE POLICY "Users can view company members" ON public.company_members
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can manage their own company membership" ON public.company_members;
CREATE POLICY "Users can manage their own company membership" ON public.company_members
    FOR ALL USING (auth.uid() = member_id)
    WITH CHECK (auth.uid() = member_id);

-- Update RLS policies for group_members
DROP POLICY IF EXISTS "Users can view group members" ON public.group_members;
CREATE POLICY "Users can view group members" ON public.group_members
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can manage their own group membership" ON public.group_members;
CREATE POLICY "Users can manage their own group membership" ON public.group_members
    FOR ALL USING (auth.uid() = member_id)
    WITH CHECK (auth.uid() = member_id);