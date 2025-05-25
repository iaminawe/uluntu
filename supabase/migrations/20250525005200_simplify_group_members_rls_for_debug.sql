-- Migration to simplify group_members RLS policies for debugging recursion

BEGIN;

-- Disable RLS on group_members to modify policies
ALTER TABLE public.group_members DISABLE ROW LEVEL SECURITY;

-- Drop the policies suspected of causing recursion.
-- These were last defined in 20250525004500_fix_group_members_recursion_with_functions.sql
DROP POLICY IF EXISTS "Members can see other members in their closed or secret groups" ON public.group_members;
DROP POLICY IF EXISTS "Group admins can manage group members" ON public.group_members;

-- The following policies should remain from previous migrations and are considered safe:
-- 1. "Users can see their own group_memberships" (SELECT)
-- 2. "Users can see members of open groups" (SELECT)
-- 3. "Users can join open groups" (INSERT)
-- 4. "Superadmins can manage all group members" (FOR ALL)

-- The helper functions is_member_of_group and is_admin_of_group will remain.

-- Re-enable RLS on group_members
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members FORCE ROW LEVEL SECURITY;

COMMIT;
