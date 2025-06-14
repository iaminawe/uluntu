-- Fix user_roles infinite recursion issue
-- This script removes circular dependencies in RLS policies

-- First, drop all existing policies on user_roles
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Superadmins can manage all roles" ON public.user_roles;

-- Create a function to check if a user is a superadmin WITHOUT using RLS
-- This function uses SECURITY DEFINER to bypass RLS checks
CREATE OR REPLACE FUNCTION public.is_superadmin(check_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Direct query without RLS to avoid recursion
  RETURN EXISTS (
    SELECT 1 
    FROM public.user_roles 
    WHERE user_id = check_user_id 
    AND role = 'superadmin'
  );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.is_superadmin(uuid) TO authenticated;

-- Create new policies for user_roles that don't cause recursion
-- Policy 1: Users can view their own roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- Policy 2: Superadmins can view all roles (using the SECURITY DEFINER function)
CREATE POLICY "Superadmins can view all roles"
  ON public.user_roles FOR SELECT
  USING (public.is_superadmin(auth.uid()));

-- Policy 3: Only superadmins can insert roles (using the SECURITY DEFINER function)
CREATE POLICY "Superadmins can insert roles"
  ON public.user_roles FOR INSERT
  WITH CHECK (public.is_superadmin(auth.uid()));

-- Policy 4: Only superadmins can update roles (using the SECURITY DEFINER function)
CREATE POLICY "Superadmins can update roles"
  ON public.user_roles FOR UPDATE
  USING (public.is_superadmin(auth.uid()))
  WITH CHECK (public.is_superadmin(auth.uid()));

-- Policy 5: Only superadmins can delete roles (using the SECURITY DEFINER function)
CREATE POLICY "Superadmins can delete roles"
  ON public.user_roles FOR DELETE
  USING (public.is_superadmin(auth.uid()));

-- Now update other tables' policies to use the is_superadmin function
-- This prevents them from directly querying user_roles with RLS enabled

-- Example for members table (you'll need to do this for all tables)
DROP POLICY IF EXISTS "Superadmins can manage all members" ON public.members;
CREATE POLICY "Superadmins can manage all members"
  ON public.members FOR ALL
  USING (public.is_superadmin(auth.uid()))
  WITH CHECK (public.is_superadmin(auth.uid()));

-- Example for events table
DROP POLICY IF EXISTS "Superadmins can manage all events" ON public.events;
CREATE POLICY "Superadmins can manage all events"
  ON public.events FOR ALL
  USING (public.is_superadmin(auth.uid()))
  WITH CHECK (public.is_superadmin(auth.uid()));

-- Add a helper function to check any role (not just superadmin)
CREATE OR REPLACE FUNCTION public.has_role(check_user_id uuid, check_role app_role)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Direct query without RLS to avoid recursion
  RETURN EXISTS (
    SELECT 1 
    FROM public.user_roles 
    WHERE user_id = check_user_id 
    AND role = check_role
  );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;

-- Add an index to improve performance of role checks
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id_role ON public.user_roles(user_id, role);

-- Verify the fix by testing a simple query
-- This should not cause infinite recursion anymore
-- SELECT * FROM public.user_roles WHERE user_id = auth.uid();