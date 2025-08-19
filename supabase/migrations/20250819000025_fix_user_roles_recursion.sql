-- Fix user_roles infinite recursion issue
-- This migration uses a simplified approach to avoid recursion

-- First, drop all existing policies on user_roles to start fresh
DROP POLICY IF EXISTS "Users can view own roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can manage all roles" ON user_roles;
DROP POLICY IF EXISTS "Authenticated users can view all roles" ON user_roles;
DROP POLICY IF EXISTS "Service role can manage roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can insert roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can update roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can delete roles" ON user_roles;
DROP POLICY IF EXISTS "Anyone can read roles" ON user_roles;
DROP POLICY IF EXISTS "No direct modifications" ON user_roles;
DROP POLICY IF EXISTS "No direct updates" ON user_roles;
DROP POLICY IF EXISTS "No direct deletes" ON user_roles;

-- Ensure RLS is enabled
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Create simple, non-recursive policies
-- 1. Everyone can read roles (needed for permission checks throughout the app)
CREATE POLICY "Public read access for roles" 
    ON user_roles FOR SELECT 
    USING (true);

-- 2. Only service role and security definer functions can modify
-- This prevents recursion by not checking roles within role policies
CREATE POLICY "Service role insert" 
    ON user_roles FOR INSERT 
    WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role update" 
    ON user_roles FOR UPDATE 
    USING (auth.role() = 'service_role');

CREATE POLICY "Service role delete" 
    ON user_roles FOR DELETE 
    USING (auth.role() = 'service_role');

-- Create helper function to check admin status without recursion
CREATE OR REPLACE FUNCTION is_admin_user(user_id UUID DEFAULT NULL)
RETURNS BOOLEAN AS $$
DECLARE
    check_user_id UUID;
BEGIN
    -- Use provided user_id or current user
    check_user_id := COALESCE(user_id, auth.uid());
    
    -- Return false if no user
    IF check_user_id IS NULL THEN
        RETURN false;
    END IF;
    
    -- Check if user has admin or superadmin role
    RETURN EXISTS (
        SELECT 1 FROM user_roles ur
        WHERE ur.user_id = check_user_id 
        AND ur.role IN ('admin', 'superadmin')
    );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION is_admin_user TO authenticated, anon;

-- Create function to manage user roles (bypasses RLS)
CREATE OR REPLACE FUNCTION manage_user_roles(
    target_user_id UUID,
    target_role VARCHAR(100),
    action VARCHAR(10) -- 'add' or 'remove'
)
RETURNS JSONB AS $$
DECLARE
    current_user_id UUID;
    is_authorized BOOLEAN;
    result JSONB;
BEGIN
    -- Get current user
    current_user_id := auth.uid();
    
    IF current_user_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
    END IF;
    
    -- Check if current user is admin using the helper function
    is_authorized := is_admin_user(current_user_id);
    
    IF NOT is_authorized THEN
        RETURN jsonb_build_object('success', false, 'error', 'Unauthorized: Only admins can manage roles');
    END IF;
    
    -- Prevent removing last superadmin
    IF action = 'remove' AND target_role = 'superadmin' THEN
        -- Check if this would remove the last superadmin
        IF (SELECT COUNT(*) FROM user_roles WHERE role = 'superadmin') <= 1 
           AND EXISTS (SELECT 1 FROM user_roles WHERE user_id = target_user_id AND role = 'superadmin') THEN
            RETURN jsonb_build_object('success', false, 'error', 'Cannot remove last superadmin');
        END IF;
    END IF;
    
    -- Perform the action
    IF action = 'add' THEN
        INSERT INTO user_roles (user_id, role)
        VALUES (target_user_id, target_role)
        ON CONFLICT (user_id, role) DO NOTHING;
        
        RETURN jsonb_build_object('success', true, 'message', 'Role added successfully');
    ELSIF action = 'remove' THEN
        DELETE FROM user_roles 
        WHERE user_id = target_user_id AND role = target_role;
        
        RETURN jsonb_build_object('success', true, 'message', 'Role removed successfully');
    ELSE
        RETURN jsonb_build_object('success', false, 'error', 'Invalid action: Use "add" or "remove"');
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION manage_user_roles TO authenticated;

-- Create function to bulk manage roles
CREATE OR REPLACE FUNCTION bulk_manage_user_roles(
    user_ids UUID[],
    target_role VARCHAR(100),
    action VARCHAR(10) -- 'add' or 'remove'
)
RETURNS JSONB AS $$
DECLARE
    current_user_id UUID;
    is_authorized BOOLEAN;
    affected_count INTEGER := 0;
BEGIN
    -- Get current user
    current_user_id := auth.uid();
    
    IF current_user_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
    END IF;
    
    -- Check if current user is admin
    is_authorized := is_admin_user(current_user_id);
    
    IF NOT is_authorized THEN
        RETURN jsonb_build_object('success', false, 'error', 'Unauthorized: Only admins can manage roles');
    END IF;
    
    -- Perform the action
    IF action = 'add' THEN
        INSERT INTO user_roles (user_id, role)
        SELECT unnest(user_ids), target_role
        ON CONFLICT (user_id, role) DO NOTHING;
        
        GET DIAGNOSTICS affected_count = ROW_COUNT;
        
        RETURN jsonb_build_object(
            'success', true, 
            'message', format('Role added to %s users', affected_count),
            'affected_count', affected_count
        );
    ELSIF action = 'remove' THEN
        DELETE FROM user_roles 
        WHERE user_id = ANY(user_ids) AND role = target_role;
        
        GET DIAGNOSTICS affected_count = ROW_COUNT;
        
        RETURN jsonb_build_object(
            'success', true, 
            'message', format('Role removed from %s users', affected_count),
            'affected_count', affected_count
        );
    ELSE
        RETURN jsonb_build_object('success', false, 'error', 'Invalid action: Use "add" or "remove"');
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION bulk_manage_user_roles TO authenticated;

-- Update the get_admin_users function to work with the new approach
CREATE OR REPLACE FUNCTION get_admin_users()
RETURNS TABLE (
  user_id uuid,
  email text,
  name text,
  created_at timestamptz,
  last_sign_in_at timestamptz,
  roles text[]
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only allow admins to access this function
  IF NOT is_admin_user(auth.uid()) THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
  END IF;

  RETURN QUERY
  SELECT 
    au.id as user_id,
    au.email::text,
    COALESCE(m.name, 'Unknown User') as name,
    au.created_at,
    au.last_sign_in_at,
    COALESCE(ARRAY_AGG(ur.role) FILTER (WHERE ur.role IS NOT NULL), ARRAY[]::text[]) as roles
  FROM auth.users au
  LEFT JOIN public.members m ON au.id = m.user_id
  LEFT JOIN public.user_roles ur ON au.id = ur.user_id
  WHERE au.deleted_at IS NULL
  GROUP BY au.id, au.email, m.name, au.created_at, au.last_sign_in_at
  ORDER BY au.created_at DESC;
END;
$$;

-- Fix any menu-related policies that might cause recursion
-- Update menu_items policies
DROP POLICY IF EXISTS "Menu editors can manage menu items" ON menu_items;
DROP POLICY IF EXISTS "Authenticated can manage menu items" ON menu_items;
DROP POLICY IF EXISTS "Admins can manage menu items" ON menu_items;

CREATE POLICY "Admin menu management" 
    ON menu_items FOR ALL 
    USING (is_admin_user(auth.uid()));

-- Update menu_containers policies
DROP POLICY IF EXISTS "Admins have full access to menu containers" ON menu_containers;
DROP POLICY IF EXISTS "Admins can manage menu containers" ON menu_containers;

CREATE POLICY "Admin container management" 
    ON menu_containers FOR ALL 
    USING (is_admin_user(auth.uid()));

-- Update menu_permissions policies  
DROP POLICY IF EXISTS "Admins can manage menu permissions" ON menu_permissions;
DROP POLICY IF EXISTS "Authenticated can manage menu permissions" ON menu_permissions;

CREATE POLICY "Admin permission management" 
    ON menu_permissions FOR ALL 
    USING (is_admin_user(auth.uid()));

-- Update audit log policies
DROP POLICY IF EXISTS "Admins can view all audit logs" ON menu_audit_log;

CREATE POLICY "Admin audit log access" 
    ON menu_audit_log FOR SELECT 
    USING (is_admin_user(auth.uid()));

-- Comment on the new approach
COMMENT ON FUNCTION is_admin_user IS 'Check if a user has admin or superadmin role. Uses SECURITY DEFINER to avoid RLS recursion.';
COMMENT ON FUNCTION manage_user_roles IS 'Manage user roles. Only accessible by admins. Uses SECURITY DEFINER to bypass RLS.';
COMMENT ON FUNCTION bulk_manage_user_roles IS 'Bulk manage user roles. Only accessible by admins. Uses SECURITY DEFINER to bypass RLS.';