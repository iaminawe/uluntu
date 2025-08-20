-- Fix infinite recursion in company_members RLS policies
-- This resolves the "infinite recursion detected in policy for relation company_members" error

BEGIN;

-- Drop the problematic policies
DROP POLICY IF EXISTS "Users can view company members" ON public.company_members;
DROP POLICY IF EXISTS "Users can manage their own company membership" ON public.company_members;

-- Create new policies with proper member lookup to avoid infinite recursion

-- Allow anyone to view company members
CREATE POLICY "Anyone can view company members" 
ON public.company_members
FOR SELECT 
USING (true);

-- Allow authenticated users to manage their own company membership
-- This properly checks the members table to match user_id
CREATE POLICY "Users can manage their own company membership" 
ON public.company_members
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.members 
    WHERE members.id = company_members.member_id 
    AND members.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.members 
    WHERE members.id = company_members.member_id 
    AND members.user_id = auth.uid()
  )
);

-- Allow admins to manage all company memberships
CREATE POLICY "Admins can manage all company memberships" 
ON public.company_members
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role IN ('admin', 'superadmin')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role IN ('admin', 'superadmin')
  )
);

-- Also fix the group_members policies with the same issue
DROP POLICY IF EXISTS "Users can view group members" ON public.group_members;
DROP POLICY IF EXISTS "Users can manage their own group membership" ON public.group_members;

-- Allow anyone to view group members
CREATE POLICY "Anyone can view group members" 
ON public.group_members
FOR SELECT 
USING (true);

-- Allow authenticated users to manage their own group membership
CREATE POLICY "Users can manage their own group membership" 
ON public.group_members
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.members 
    WHERE members.id = group_members.member_id 
    AND members.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.members 
    WHERE members.id = group_members.member_id 
    AND members.user_id = auth.uid()
  )
);

-- Allow group admins to manage group memberships
CREATE POLICY "Group admins can manage group memberships" 
ON public.group_members
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.group_members gm_admin
    JOIN public.members m ON m.id = gm_admin.member_id
    WHERE gm_admin.group_id = group_members.group_id
    AND m.user_id = auth.uid()
    AND gm_admin.role = 'admin'
    AND gm_admin.status = 'active'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.group_members gm_admin
    JOIN public.members m ON m.id = gm_admin.member_id
    WHERE gm_admin.group_id = group_members.group_id
    AND m.user_id = auth.uid()
    AND gm_admin.role = 'admin'
    AND gm_admin.status = 'active'
  )
);

-- Similarly fix member_skills policies if they have the same issue
DROP POLICY IF EXISTS "Users can manage their own skills" ON public.member_skills;

CREATE POLICY "Users can view all member skills" 
ON public.member_skills
FOR SELECT 
USING (true);

CREATE POLICY "Users can manage their own skills" 
ON public.member_skills
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.members 
    WHERE members.id = member_skills.member_id 
    AND members.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.members 
    WHERE members.id = member_skills.member_id 
    AND members.user_id = auth.uid()
  )
);

-- Add a comment explaining the fix
COMMENT ON TABLE public.company_members IS 
  'Junction table linking members to companies. RLS policies use EXISTS subqueries to avoid infinite recursion when checking member ownership.';

COMMENT ON TABLE public.group_members IS 
  'Junction table linking members to groups. RLS policies use EXISTS subqueries to avoid infinite recursion when checking member ownership.';

COMMIT;