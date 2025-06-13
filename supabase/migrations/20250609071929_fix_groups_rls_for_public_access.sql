-- Fix groups RLS to allow public access to published groups
-- Remove complex policies and add simple ones that work for anonymous users

-- Drop all existing policies on groups
DROP POLICY IF EXISTS "Anyone can read published open and closed groups" ON public.groups;
DROP POLICY IF EXISTS "Anonymous users can read published open groups" ON public.groups;
DROP POLICY IF EXISTS "Group members can read their groups" ON public.groups;
DROP POLICY IF EXISTS "Group members can read their secret groups" ON public.groups;
DROP POLICY IF EXISTS "Group admins can update their groups" ON public.groups;
DROP POLICY IF EXISTS "Authenticated users can create groups" ON public.groups;
DROP POLICY IF EXISTS "Superadmins can manage all groups" ON public.groups;

-- Create simple policy for public read access to open and closed groups
CREATE POLICY "Public can read open and closed groups"
  ON public.groups
  FOR SELECT
  USING (
    status = 'published' AND 
    visibility IN ('open', 'closed')
  );

-- Create policy for authenticated users to read their secret groups
CREATE POLICY "Members can read secret groups they belong to"
  ON public.groups
  FOR SELECT
  TO authenticated
  USING (
    status = 'published' AND 
    visibility = 'secret' AND
    EXISTS (
      SELECT 1 FROM public.group_members gm 
      WHERE gm.group_id = groups.id 
      AND gm.member_id::text = auth.uid()::text
    )
  );

-- Keep other necessary policies for write operations
CREATE POLICY "Authenticated users can create groups"
  ON public.groups
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Group admins can update their groups"
  ON public.groups
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.group_members gm 
      WHERE gm.group_id = groups.id 
      AND gm.member_id::text = auth.uid()::text
      AND gm.role = 'admin'
    )
  );