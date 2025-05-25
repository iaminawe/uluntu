-- Migration to further remediate RLS policies for group_members to prevent recursion

BEGIN;

ALTER TABLE public.group_members DISABLE ROW LEVEL SECURITY;

-- Drop all known potentially problematic policies for group_members
-- From original migration 20250523215238_turquoise_fog.sql:
DROP POLICY IF EXISTS "Anyone can read members of open and closed groups" ON public.group_members;
DROP POLICY IF EXISTS "Group members can read members of their groups" ON public.group_members;
DROP POLICY IF EXISTS "Group admins can manage group members" ON public.group_members;
DROP POLICY IF EXISTS "Users can join open groups" ON public.group_members;
DROP POLICY IF EXISTS "Superadmins can manage all group members" ON public.group_members;

-- From attempted fix 20250525003404_fix_recursive_rls_policies.sql:
DROP POLICY IF EXISTS "Users can see their own group_memberships" ON public.group_members;
DROP POLICY IF EXISTS "Users can see members of open groups" ON public.group_members;
DROP POLICY IF EXISTS "Members can see other members in their closed or secret groups" ON public.group_members;

-- Re-create SELECT policies (intended to be non-recursive)

-- Policy 1: Users can see their own membership entries in group_members.
CREATE POLICY "Users can see their own group_memberships" 
ON public.group_members FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.members m
    WHERE m.id = group_members.member_id AND m.user_id = auth.uid()
  )
);

-- Policy 2: Users can see members of 'open' and 'published' groups.
CREATE POLICY "Users can see members of open groups"
ON public.group_members FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.groups g
    WHERE g.id = group_members.group_id AND g.visibility = 'open' AND g.status = 'published'
  )
);

-- Policy 3: Members of a 'closed' or 'secret' (and 'published') group can see other members of THAT group.
CREATE POLICY "Members can see other members in their closed or secret groups"
ON public.group_members FOR SELECT
USING (
  EXISTS ( 
    SELECT 1
    FROM public.group_members gm_current_user_link
    JOIN public.members m_current_user ON m_current_user.id = gm_current_user_link.member_id
    JOIN public.groups g_details ON g_details.id = gm_current_user_link.group_id
    WHERE gm_current_user_link.group_id = group_members.group_id 
      AND m_current_user.user_id = auth.uid()
      AND g_details.visibility IN ('closed', 'secret') 
      AND g_details.status = 'published'
  )
);

-- Re-create INSERT policy
CREATE POLICY "Users can join open groups"
ON public.group_members FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.groups g
    WHERE g.id = group_members.group_id
      AND g.visibility = 'open'
      AND g.status = 'published'
  )
  AND group_members.member_id IN (SELECT m.id FROM public.members m WHERE m.user_id = auth.uid())
  AND group_members.role = 'member'
);

-- Re-create general USING policies (for SELECT, UPDATE, DELETE)

-- Revised "Group admins can manage group members" policy
CREATE POLICY "Group admins can manage group members"
ON public.group_members FOR ALL -- Applies to SELECT, INSERT, UPDATE, DELETE
USING ( -- For SELECT, UPDATE, DELETE: check if current user is admin of the target row's group
  EXISTS (
    SELECT 1
    FROM public.group_members gm_admin_check
    JOIN public.members m_admin ON m_admin.id = gm_admin_check.member_id
    WHERE gm_admin_check.group_id = group_members.group_id 
      AND m_admin.user_id = auth.uid()
      AND gm_admin_check.role = 'admin'
  )
)
WITH CHECK ( -- For INSERT, UPDATE: check if current user is admin of the target row's group
  EXISTS (
    SELECT 1
    FROM public.group_members gm_admin_check
    JOIN public.members m_admin ON m_admin.id = gm_admin_check.member_id
    WHERE gm_admin_check.group_id = group_members.group_id 
      AND m_admin.user_id = auth.uid()
      AND gm_admin_check.role = 'admin'
  )
);

CREATE POLICY "Superadmins can manage all group members"
ON public.group_members FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = 'superadmin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = 'superadmin'
  )
);

ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members FORCE ROW LEVEL SECURITY;

COMMIT;
