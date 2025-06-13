-- Fix resources RLS to allow public access to published resources
-- Remove complex policies and add simple ones that work for anonymous users

-- Drop all existing policies on resources
DROP POLICY IF EXISTS "Anyone can read published resources without group" ON public.resources;
DROP POLICY IF EXISTS "Anyone can read published resources for open or closed groups" ON public.resources;
DROP POLICY IF EXISTS "Group members can read resources for their groups" ON public.resources;
DROP POLICY IF EXISTS "Contributors can read their own resources" ON public.resources;
DROP POLICY IF EXISTS "Contributors can update their own resources" ON public.resources;
DROP POLICY IF EXISTS "Contributors can delete their own resources" ON public.resources;
DROP POLICY IF EXISTS "Authenticated users can create resources" ON public.resources;
DROP POLICY IF EXISTS "Superadmins can manage all resources" ON public.resources;

-- Create simple policy for public read access to published resources
CREATE POLICY "Public can read published resources"
  ON public.resources
  FOR SELECT
  USING (
    status = 'published'
  );

-- Create policy for authenticated users to read group-specific resources
CREATE POLICY "Members can read resources for their groups"
  ON public.resources
  FOR SELECT
  TO authenticated
  USING (
    status = 'published' AND
    group_id IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM public.group_members gm 
      WHERE gm.group_id = resources.group_id 
      AND gm.member_id::text = auth.uid()::text
    )
  );

-- Keep other necessary policies for write operations
CREATE POLICY "Authenticated users can create resources"
  ON public.resources
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Contributors can update their own resources"
  ON public.resources
  FOR UPDATE
  TO authenticated
  USING (
    contributor_id IN (
      SELECT id FROM public.members WHERE user_id::text = auth.uid()::text
    )
  );

CREATE POLICY "Contributors can delete their own resources"
  ON public.resources
  FOR DELETE
  TO authenticated
  USING (
    contributor_id IN (
      SELECT id FROM public.members WHERE user_id::text = auth.uid()::text
    )
  );