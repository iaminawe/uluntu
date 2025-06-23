-- Create user_custom_roles junction table for assigning custom roles to users
CREATE TABLE IF NOT EXISTS public.user_custom_roles (
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES public.custom_roles(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    assigned_by UUID REFERENCES auth.users(id),
    PRIMARY KEY (user_id, role_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_custom_roles_user_id ON public.user_custom_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_custom_roles_role_id ON public.user_custom_roles(role_id);

-- Add RLS policies for user_custom_roles
ALTER TABLE public.user_custom_roles ENABLE ROW LEVEL SECURITY;

-- Admins can manage role assignments
CREATE POLICY "Admins can manage custom role assignments" ON public.user_custom_roles
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            WHERE ur.user_id = auth.uid()
            AND ur.role IN ('admin', 'superadmin')
        )
    );

-- Users can view their own role assignments
CREATE POLICY "Users can view own custom roles" ON public.user_custom_roles
    FOR SELECT
    USING (user_id = auth.uid());

-- Temporarily disable audit trigger for initial setup
ALTER TABLE public.custom_roles DISABLE TRIGGER IF EXISTS audit_custom_roles;

-- Insert default system roles into custom_roles table if they don't exist
INSERT INTO public.custom_roles (name, description, permissions, is_system)
VALUES 
    ('Authenticated User', 'Basic authenticated user with read-only access', 
     '{"members": ["read"], "companies": ["read"], "events": ["read"], "groups": ["read"], "news": ["read"], "resources": ["read"], "marketplace": ["read"], "opportunities": ["read"]}', 
     true),
    ('Group Member', 'Member of one or more groups with enhanced permissions', 
     '{"members": ["read", "update"], "companies": ["read"], "events": ["read", "create"], "groups": ["read", "update"], "news": ["read"], "resources": ["read", "create"], "marketplace": ["read", "create"], "opportunities": ["read"]}', 
     true),
    ('Administrator', 'Platform administrator with management privileges', 
     '{"members": ["*"], "companies": ["*"], "events": ["*"], "groups": ["*"], "news": ["*"], "resources": ["*"], "marketplace": ["*"], "opportunities": ["*"], "users": ["read", "update"], "moderation": ["*"]}', 
     true),
    ('Super Administrator', 'Full system administrator with all permissions', 
     '{"*": ["*"]}', 
     true)
ON CONFLICT (name) DO NOTHING;

-- Re-enable audit trigger
ALTER TABLE public.custom_roles ENABLE TRIGGER IF EXISTS audit_custom_roles;

-- Add audit trigger for user_custom_roles
CREATE OR REPLACE TRIGGER audit_user_custom_roles
    AFTER INSERT OR UPDATE OR DELETE ON public.user_custom_roles
    FOR EACH ROW
    EXECUTE FUNCTION public.log_admin_action();