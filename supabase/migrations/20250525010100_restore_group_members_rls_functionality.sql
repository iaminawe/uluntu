-- Migration to restore group_members RLS functionality previously removed for debugging

BEGIN;

-- Helper functions public.is_member_of_group(UUID, UUID) and 
-- public.is_admin_of_group(UUID, UUID) are assumed to exist
-- from migration 20250525004500_fix_group_members_recursion_with_functions.sql.

ALTER TABLE public.group_members DISABLE ROW LEVEL SECURITY;

-- Re-create "Members can see other members in their closed or secret groups" using the helper function
-- This policy was previously defined in 20250525004500 and removed in 20250525005200.
DROP POLICY IF EXISTS "Members can see other members in their closed or secret groups" ON public.group_members;
CREATE POLICY "Members can see other members in their closed or secret groups"
ON public.group_members FOR SELECT
USING (
  -- First, check if the group itself is of the correct type (closed/secret and published)
  EXISTS (
    SELECT 1
    FROM public.groups g_details
    WHERE g_details.id = group_members.group_id
      AND g_details.visibility IN ('closed', 'secret')
      AND g_details.status = 'published'
  )
  -- THEN, check if the current user is a member of that group using the security definer function
  AND public.is_member_of_group(auth.uid(), group_members.group_id)
);

-- Re-create "Group admins can manage group members" using the helper function
-- This policy was previously defined in 20250525004500 and removed in 20250525005200.
DROP POLICY IF EXISTS "Group admins can manage group members" ON public.group_members;
CREATE POLICY "Group admins can manage group members"
ON public.group_members FOR ALL -- Applies to SELECT, INSERT, UPDATE, DELETE
USING (
  public.is_admin_of_group(auth.uid(), group_members.group_id)
)
WITH CHECK (
  public.is_admin_of_group(auth.uid(), group_members.group_id)
);

ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members FORCE ROW LEVEL SECURITY;

COMMIT;
