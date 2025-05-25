-- Migration to fix RLS on public.groups to prevent recursion with group_members policies

BEGIN;

-- The function public.is_member_of_group(UUID, UUID) is assumed to exist
-- from migration 20250525004500_fix_group_members_recursion_with_functions.sql.

ALTER TABLE public.groups DISABLE ROW LEVEL SECURITY;

-- Drop the existing policy on groups that reads group_members directly
DROP POLICY IF EXISTS "Group members can read their secret groups" ON public.groups;

-- Re-create the policy using the SECURITY DEFINER helper function
CREATE POLICY "Group members can read their secret groups"
ON public.groups FOR SELECT
USING (
  public.is_member_of_group(auth.uid(), groups.id) 
  AND groups.visibility = 'secret' 
  AND groups.status = 'published'
);

ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups FORCE ROW LEVEL SECURITY;

COMMIT;
