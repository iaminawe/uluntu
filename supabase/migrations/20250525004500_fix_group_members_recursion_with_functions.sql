-- Migration to fix group_members RLS recursion using SECURITY DEFINER functions

BEGIN;

-- Create helper function to check group membership (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.is_member_of_group(p_user_id UUID, p_group_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.group_members gm
    JOIN public.members m ON m.id = gm.member_id
    WHERE gm.group_id = p_group_id AND m.user_id = p_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Create helper function to check group admin status (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.is_admin_of_group(p_user_id UUID, p_group_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.group_members gm
    JOIN public.members m ON m.id = gm.member_id
    WHERE gm.group_id = p_group_id AND m.user_id = p_user_id AND gm.role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Disable RLS on group_members to modify policies
ALTER TABLE public.group_members DISABLE ROW LEVEL SECURITY;

-- Drop the problematic policies
DROP POLICY IF EXISTS "Members can see other members in their closed or secret groups" ON public.group_members;
DROP POLICY IF EXISTS "Group admins can manage group members" ON public.group_members;

-- Re-create "Members can see other members in their closed or secret groups" using the helper function
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
CREATE POLICY "Group admins can manage group members"
ON public.group_members FOR ALL -- Applies to SELECT, INSERT, UPDATE, DELETE
USING (
  public.is_admin_of_group(auth.uid(), group_members.group_id)
)
WITH CHECK (
  public.is_admin_of_group(auth.uid(), group_members.group_id)
);

-- Re-enable RLS on group_members
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members FORCE ROW LEVEL SECURITY;

COMMIT;
