-- Ensure admin roles exist and are properly configured
-- This migration ensures the admin can access the media management interface

-- Create roles table if it doesn't exist
CREATE TABLE IF NOT EXISTS roles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text UNIQUE NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create user_roles table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_roles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id uuid NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, role_id)
);

-- Insert default roles
INSERT INTO roles (name, description) VALUES
  ('superadmin', 'Super Administrator with full system access'),
  ('admin', 'Administrator with management access'),
  ('moderator', 'Content moderator'),
  ('member', 'Regular member')
ON CONFLICT (name) DO NOTHING;

-- Create function to check if user has admin access
CREATE OR REPLACE FUNCTION has_admin_access(user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = $1
    AND r.name IN ('admin', 'superadmin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get user roles
CREATE OR REPLACE FUNCTION get_user_roles(user_id uuid)
RETURNS TABLE(role_name text) AS $$
BEGIN
  RETURN QUERY
  SELECT r.name
  FROM user_roles ur
  JOIN roles r ON ur.role_id = r.id
  WHERE ur.user_id = $1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION has_admin_access TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_roles TO authenticated;

-- Create RLS policies for roles table
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Roles are viewable by all authenticated users" ON roles
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Only superadmins can manage roles" ON roles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
      AND r.name = 'superadmin'
    )
  );

-- Create RLS policies for user_roles table
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own roles" ON user_roles
  FOR SELECT USING (user_id = auth.uid() OR has_admin_access(auth.uid()));

CREATE POLICY "Only admins can manage user roles" ON user_roles
  FOR ALL USING (has_admin_access(auth.uid()));

-- Helper function to grant admin role to a user
CREATE OR REPLACE FUNCTION grant_admin_role(target_user_id uuid)
RETURNS void AS $$
DECLARE
  admin_role_id uuid;
BEGIN
  -- Get admin role id
  SELECT id INTO admin_role_id FROM roles WHERE name = 'admin';
  
  -- Insert user role
  INSERT INTO user_roles (user_id, role_id)
  VALUES (target_user_id, admin_role_id)
  ON CONFLICT (user_id, role_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION grant_admin_role TO authenticated;

-- Add comment for documentation
COMMENT ON FUNCTION grant_admin_role IS 'Grants admin role to a user. Usage: SELECT grant_admin_role(''user-uuid-here'');';