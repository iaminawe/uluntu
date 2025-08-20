-- Fix RLS policies for member_topics table
-- This resolves the issue where users can't add topics to their profile

-- Drop existing policies
DROP POLICY IF EXISTS "Users can manage their own member topics" ON public.member_topics;
DROP POLICY IF EXISTS "Admins can manage member topics" ON public.member_topics;
DROP POLICY IF EXISTS "Anyone can view member topics" ON public.member_topics;

-- Recreate policies with correct logic

-- Allow anyone to view member topics (for browsing interests)
CREATE POLICY "Anyone can view member topics" 
ON public.member_topics
FOR SELECT 
USING (true);

-- Allow users to manage their own member's topics
-- This checks both user_id and id fields to handle different member identification methods
CREATE POLICY "Users can manage their own member topics" 
ON public.member_topics
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.members 
    WHERE members.id = member_topics.member_id 
    AND (
      members.user_id = auth.uid() 
      OR members.id = auth.uid()::text
    )
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.members 
    WHERE members.id = member_topics.member_id 
    AND (
      members.user_id = auth.uid() 
      OR members.id = auth.uid()::text
    )
  )
);

-- Allow admins to manage all member topics
CREATE POLICY "Admins can manage all member topics" 
ON public.member_topics
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'superadmin')
  )
);

-- Also ensure authenticated users can insert their own topics during onboarding
CREATE POLICY "Authenticated users can add topics for their member" 
ON public.member_topics
FOR INSERT 
WITH CHECK (
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM public.members 
    WHERE members.id = member_topics.member_id 
    AND (
      members.user_id = auth.uid() 
      OR members.id = auth.uid()::text
    )
  )
);

-- Add helpful comment
COMMENT ON TABLE public.member_topics IS 
  'Junction table linking members to their topics/interests. RLS policies allow users to manage their own topics.';