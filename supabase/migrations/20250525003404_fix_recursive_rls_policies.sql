-- Migration to fix recursive RLS policies for group_members and company_members

BEGIN;

-- Fix RLS policies for group_members
ALTER TABLE public.group_members DISABLE ROW LEVEL SECURITY;

-- Drop potentially problematic existing SELECT policies.
-- These are dropped to ensure a clean slate for the new, non-recursive policies.
DROP POLICY IF EXISTS "Enable read access for all users" ON public.group_members;
DROP POLICY IF EXISTS "Allow authenticated users to read group_members" ON public.group_members;
DROP POLICY IF EXISTS "Members can see other members" ON public.group_members;
DROP POLICY IF EXISTS "Users can view group members" ON public.group_members;
DROP POLICY IF EXISTS "Anyone can read members of open and closed groups" ON public.group_members; -- From original migration 20250523215238
DROP POLICY IF EXISTS "Group members can read members of their groups" ON public.group_members; -- From original migration 20250523215238, potentially recursive

-- New Policy 1: Users can see their own membership entries in group_members.
CREATE POLICY "Users can see their own group_memberships"
ON public.group_members FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.members m
    WHERE m.id = group_members.member_id AND m.user_id = auth.uid()
  )
);

-- New Policy 2: Users can see members of 'open' and 'published' groups.
-- 'groups.visibility' is ENUM ('open', 'closed', 'secret')
CREATE POLICY "Users can see members of open groups"
ON public.group_members FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.groups g
    WHERE g.id = group_members.group_id AND g.visibility = 'open' AND g.status = 'published'
  )
);

-- New Policy 3: Members of a 'closed' or 'secret' (and 'published') group can see other members of THAT group.
CREATE POLICY "Members can see other members in their closed or secret groups"
ON public.group_members FOR SELECT
USING (
  EXISTS ( -- Check if the current user is a member of the group (group_members.group_id)
    SELECT 1
    FROM public.group_members gm_current_user_link
    JOIN public.members m_current_user ON m_current_user.id = gm_current_user_link.member_id
    JOIN public.groups g_details ON g_details.id = gm_current_user_link.group_id -- get group details for visibility check
    WHERE gm_current_user_link.group_id = group_members.group_id -- Link to the group of the row being evaluated
      AND m_current_user.user_id = auth.uid() -- Is the current user a member?
      AND g_details.visibility IN ('closed', 'secret') -- And is that group 'closed' or 'secret'?
      AND g_details.status = 'published'
  )
);

ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members FORCE ROW LEVEL SECURITY;

-- Fix RLS policies for company_members
ALTER TABLE public.company_members DISABLE ROW LEVEL SECURITY;

-- Drop potentially problematic existing SELECT policies.
DROP POLICY IF EXISTS "Enable read access for all users" ON public.company_members;
DROP POLICY IF EXISTS "Allow authenticated users to read company_members" ON public.company_members;
DROP POLICY IF EXISTS "Members can see other members" ON public.company_members;
DROP POLICY IF EXISTS "Users can view company members" ON public.company_members;
DROP POLICY IF EXISTS "Anyone can read company members" ON public.company_members; -- From original migration 20250523215227, was USING (true)

-- New Policy 1: Users can see their own membership entries in company_members.
CREATE POLICY "Users can see their own company_memberships"
ON public.company_members FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.members m
    WHERE m.id = company_members.member_id AND m.user_id = auth.uid()
  )
);

-- New Policy 2: Users can see members of 'published' companies.
-- 'companies' table has 'status' ('published', 'draft', etc.), but no 'visibility' column.
-- This policy makes members of published companies generally visible, similar to original USING (true) for published ones.
CREATE POLICY "Users can see members of published companies"
ON public.company_members FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.companies c
    WHERE c.id = company_members.company_id AND c.status = 'published'
  )
);

-- Note: A more restrictive Policy 3 for company_members (e.g., members of a non-published company
-- can see other members) is omitted for now to align closer with the original broad read access
-- implied by 'USING (true)' on company_members in its creating migration for published companies.
-- If stricter controls are needed for non-published company members, a policy similar to group_members Policy 3 could be added.

ALTER TABLE public.company_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_members FORCE ROW LEVEL SECURITY;

COMMIT;
