-- Ensure user_roles table exists with proper structure
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, role)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role);

-- Enable RLS
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can manage roles" ON user_roles;
DROP POLICY IF EXISTS "Service role can manage all roles" ON user_roles;

-- Create policies
-- Users can view their own roles
CREATE POLICY "Users can view their own roles" ON user_roles
    FOR SELECT
    USING (auth.uid() = user_id);

-- Admins can view all roles
CREATE POLICY "Admins can view all roles" ON user_roles
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_id = auth.uid()
            AND role IN ('admin', 'superadmin')
        )
    );

-- Admins can insert/update/delete roles
CREATE POLICY "Admins can manage roles" ON user_roles
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_id = auth.uid()
            AND role IN ('admin', 'superadmin')
        )
    );

-- Function to assign initial admin role (call this manually for your admin user)
CREATE OR REPLACE FUNCTION assign_admin_role(target_user_id UUID)
RETURNS void AS $$
BEGIN
    INSERT INTO user_roles (user_id, role)
    VALUES 
        (target_user_id, 'admin'),
        (target_user_id, 'superadmin')
    ON CONFLICT (user_id, role) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if a user has a specific role
CREATE OR REPLACE FUNCTION has_role(check_user_id UUID, check_role TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM user_roles
        WHERE user_id = check_user_id
        AND role = check_role
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to get all roles for a user
CREATE OR REPLACE FUNCTION get_user_roles(check_user_id UUID)
RETURNS TABLE(role TEXT) AS $$
BEGIN
    RETURN QUERY
    SELECT user_roles.role
    FROM user_roles
    WHERE user_id = check_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;