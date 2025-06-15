-- Add missing fields to members table for profile editing

-- Add company column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'members' 
                   AND column_name = 'company') THEN
        ALTER TABLE public.members ADD COLUMN company text;
    END IF;
END $$;

-- Add social column if it doesn't exist (for storing social links as JSON)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'members' 
                   AND column_name = 'social') THEN
        ALTER TABLE public.members ADD COLUMN social jsonb;
    END IF;
END $$;

-- Create member_skills table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.member_skills (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    member_id uuid NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
    skill text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE(member_id, skill)
);

-- Enable RLS on member_skills
ALTER TABLE public.member_skills ENABLE ROW LEVEL SECURITY;

-- Create policies for member_skills
CREATE POLICY "Anyone can view member skills" ON public.member_skills
    FOR SELECT USING (true);

CREATE POLICY "Members can manage their own skills" ON public.member_skills
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.members 
            WHERE members.id = member_skills.member_id 
            AND members.user_id = auth.uid()
        )
    );

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_member_skills_member_id ON public.member_skills(member_id);
CREATE INDEX IF NOT EXISTS idx_member_skills_skill ON public.member_skills(skill);

-- Add comment
COMMENT ON TABLE public.member_skills IS 'Skills associated with community members';
COMMENT ON COLUMN public.members.company IS 'Company or organization the member works for';
COMMENT ON COLUMN public.members.social IS 'Social media links (LinkedIn, Twitter, GitHub, etc.) stored as JSON';