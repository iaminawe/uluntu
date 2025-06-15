-- Simple fix for user_roles infinite recursion issue
-- This version assumes tables and types already exist

-- Drop existing policies that might cause recursion
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Superadmins can manage all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can read their own roles" ON public.user_roles;

-- Create a function to check if a user is a superadmin WITHOUT using RLS
CREATE OR REPLACE FUNCTION public.is_superadmin_direct(check_user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.user_roles 
    WHERE user_id = check_user_id 
    AND role::text = 'superadmin'
  );
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.is_superadmin_direct(uuid) TO authenticated;

-- Create simple, non-recursive policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- That's it! Just this one simple policy for user_roles.
-- For superadmin access, use service role key or database functions.

-- Now fix the other tables to use the direct function
-- This prevents recursion when checking permissions

-- Fix members table
DROP POLICY IF EXISTS "Superadmins can manage all members" ON public.members;
CREATE POLICY "Superadmins can manage all members"
  ON public.members FOR ALL
  USING (public.is_superadmin_direct(auth.uid()));

-- Fix events table  
DROP POLICY IF EXISTS "Superadmins can manage all events" ON public.events;
CREATE POLICY "Superadmins can manage all events"
  ON public.events FOR ALL
  USING (public.is_superadmin_direct(auth.uid()));

-- Fix news table
DROP POLICY IF EXISTS "Superadmins can manage all news" ON public.news;
CREATE POLICY "Superadmins can manage all news"
  ON public.news FOR ALL
  USING (public.is_superadmin_direct(auth.uid()));

-- Fix companies table
DROP POLICY IF EXISTS "Superadmins can manage all companies" ON public.companies;
CREATE POLICY "Superadmins can manage all companies"
  ON public.companies FOR ALL
  USING (public.is_superadmin_direct(auth.uid()));

-- Fix groups table
DROP POLICY IF EXISTS "Superadmins can manage all groups" ON public.groups;
CREATE POLICY "Superadmins can manage all groups"
  ON public.groups FOR ALL
  USING (public.is_superadmin_direct(auth.uid()));

-- Fix resources table
DROP POLICY IF EXISTS "Superadmins can manage all resources" ON public.resources;
CREATE POLICY "Superadmins can manage all resources"
  ON public.resources FOR ALL
  USING (public.is_superadmin_direct(auth.uid()));

-- Test query (should work without recursion)
-- SELECT * FROM public.members LIMIT 1;
-- SELECT * FROM public.user_roles WHERE user_id = auth.uid();