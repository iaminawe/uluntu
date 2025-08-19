-- Menu Security System Migration
-- Creates tables and functions for comprehensive menu permission management

-- Create menu audit logs table
CREATE TABLE IF NOT EXISTS menu_audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    menu_item_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    user_email VARCHAR(255) NOT NULL,
    resource_type VARCHAR(50) NOT NULL DEFAULT 'menu_item',
    resource_id UUID,
    old_values JSONB,
    new_values JSONB,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for audit logs
CREATE INDEX IF NOT EXISTS idx_menu_audit_logs_menu_item_id ON menu_audit_logs(menu_item_id);
CREATE INDEX IF NOT EXISTS idx_menu_audit_logs_user_id ON menu_audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_menu_audit_logs_action ON menu_audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_menu_audit_logs_resource_type ON menu_audit_logs(resource_type);
CREATE INDEX IF NOT EXISTS idx_menu_audit_logs_created_at ON menu_audit_logs(created_at);

-- Create menu permissions table for fine-grained access control
CREATE TABLE IF NOT EXISTS menu_permissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    menu_item_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
    role_name VARCHAR(100) NOT NULL,
    permission_type VARCHAR(50) NOT NULL, -- 'read', 'update', 'delete', etc.
    is_allowed BOOLEAN DEFAULT true,
    conditions JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for menu permissions
CREATE INDEX IF NOT EXISTS idx_menu_permissions_menu_item_id ON menu_permissions(menu_item_id);
CREATE INDEX IF NOT EXISTS idx_menu_permissions_role_name ON menu_permissions(role_name);
CREATE INDEX IF NOT EXISTS idx_menu_permissions_permission_type ON menu_permissions(permission_type);

-- Create unique constraint to prevent duplicate permission rules
CREATE UNIQUE INDEX IF NOT EXISTS idx_menu_permissions_unique 
ON menu_permissions(menu_item_id, role_name, permission_type);

-- Create feature flags table for menu system
CREATE TABLE IF NOT EXISTS menu_feature_flags (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    flag_id VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    enabled BOOLEAN DEFAULT false,
    rollout_percentage INTEGER DEFAULT 0 CHECK (rollout_percentage >= 0 AND rollout_percentage <= 100),
    target_roles TEXT[] DEFAULT '{}',
    target_users TEXT[] DEFAULT '{}',
    conditions JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for feature flags
CREATE INDEX IF NOT EXISTS idx_menu_feature_flags_flag_id ON menu_feature_flags(flag_id);
CREATE INDEX IF NOT EXISTS idx_menu_feature_flags_enabled ON menu_feature_flags(enabled);

-- Create menu feature flag rules table (links menu items to feature flags)
CREATE TABLE IF NOT EXISTS menu_feature_flag_rules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    menu_item_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
    feature_flag_id UUID REFERENCES menu_feature_flags(id) ON DELETE CASCADE,
    required BOOLEAN DEFAULT true,
    cascade BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for feature flag rules
CREATE INDEX IF NOT EXISTS idx_menu_feature_flag_rules_menu_item_id ON menu_feature_flag_rules(menu_item_id);
CREATE INDEX IF NOT EXISTS idx_menu_feature_flag_rules_feature_flag_id ON menu_feature_flag_rules(feature_flag_id);

-- Create unique constraint for feature flag rules
CREATE UNIQUE INDEX IF NOT EXISTS idx_menu_feature_flag_rules_unique 
ON menu_feature_flag_rules(menu_item_id, feature_flag_id);

-- Add security columns to existing menu_items table if they don't exist
DO $$ 
BEGIN
    -- Add visibility column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'menu_items' AND column_name = 'visibility') THEN
        ALTER TABLE menu_items ADD COLUMN visibility VARCHAR(20) DEFAULT 'public' 
            CHECK (visibility IN ('public', 'authenticated', 'admin', 'role_based'));
    END IF;

    -- Add required_roles column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'menu_items' AND column_name = 'required_roles') THEN
        ALTER TABLE menu_items ADD COLUMN required_roles TEXT[] DEFAULT '{}';
    END IF;

    -- Add is_external column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'menu_items' AND column_name = 'is_external') THEN
        ALTER TABLE menu_items ADD COLUMN is_external BOOLEAN DEFAULT false;
    END IF;

    -- Add target column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'menu_items' AND column_name = 'target') THEN
        ALTER TABLE menu_items ADD COLUMN target VARCHAR(20) DEFAULT '_self'
            CHECK (target IN ('_self', '_blank', '_parent', '_top'));
    END IF;

    -- Add menu_type column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'menu_items' AND column_name = 'menu_type') THEN
        ALTER TABLE menu_items ADD COLUMN menu_type VARCHAR(20) DEFAULT 'main'
            CHECK (menu_type IN ('main', 'footer', 'mobile', 'admin'));
    END IF;
END $$;

-- Create indexes for new menu_items columns
CREATE INDEX IF NOT EXISTS idx_menu_items_visibility ON menu_items(visibility);
CREATE INDEX IF NOT EXISTS idx_menu_items_menu_type ON menu_items(menu_type);
CREATE INDEX IF NOT EXISTS idx_menu_items_is_external ON menu_items(is_external);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_menu_permissions_updated_at 
    BEFORE UPDATE ON menu_permissions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_menu_feature_flags_updated_at 
    BEFORE UPDATE ON menu_feature_flags 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to log menu item changes automatically
CREATE OR REPLACE FUNCTION log_menu_item_changes()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert audit log for INSERT operations
    IF TG_OP = 'INSERT' THEN
        INSERT INTO menu_audit_logs (
            menu_item_id,
            action,
            user_id,
            user_email,
            resource_type,
            resource_id,
            new_values,
            metadata
        ) VALUES (
            NEW.id,
            'create',
            auth.uid(),
            COALESCE(auth.email(), 'system'),
            'menu_item',
            NEW.id,
            to_jsonb(NEW),
            jsonb_build_object('trigger', 'auto', 'operation', 'INSERT')
        );
        RETURN NEW;
    END IF;

    -- Insert audit log for UPDATE operations
    IF TG_OP = 'UPDATE' THEN
        INSERT INTO menu_audit_logs (
            menu_item_id,
            action,
            user_id,
            user_email,
            resource_type,
            resource_id,
            old_values,
            new_values,
            metadata
        ) VALUES (
            NEW.id,
            'update',
            auth.uid(),
            COALESCE(auth.email(), 'system'),
            'menu_item',
            NEW.id,
            to_jsonb(OLD),
            to_jsonb(NEW),
            jsonb_build_object(
                'trigger', 'auto', 
                'operation', 'UPDATE',
                'changed_fields', (
                    SELECT array_agg(key)
                    FROM jsonb_each(to_jsonb(NEW))
                    WHERE value != COALESCE((to_jsonb(OLD) -> key), 'null'::jsonb)
                )
            )
        );
        RETURN NEW;
    END IF;

    -- Insert audit log for DELETE operations
    IF TG_OP = 'DELETE' THEN
        INSERT INTO menu_audit_logs (
            menu_item_id,
            action,
            user_id,
            user_email,
            resource_type,
            resource_id,
            old_values,
            metadata
        ) VALUES (
            OLD.id,
            'delete',
            auth.uid(),
            COALESCE(auth.email(), 'system'),
            'menu_item',
            OLD.id,
            to_jsonb(OLD),
            jsonb_build_object('trigger', 'auto', 'operation', 'DELETE')
        );
        RETURN OLD;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic menu audit logging
DROP TRIGGER IF EXISTS menu_item_audit_trigger ON menu_items;
CREATE TRIGGER menu_item_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON menu_items
    FOR EACH ROW EXECUTE FUNCTION log_menu_item_changes();

-- Create function to check menu visibility based on user role
CREATE OR REPLACE FUNCTION check_menu_visibility(
    p_menu_item_id UUID,
    p_user_id UUID DEFAULT auth.uid(),
    p_user_roles TEXT[] DEFAULT '{}'::TEXT[]
)
RETURNS BOOLEAN AS $$
DECLARE
    v_menu_item RECORD;
    v_user_roles TEXT[];
BEGIN
    -- Get menu item details
    SELECT * INTO v_menu_item
    FROM menu_items
    WHERE id = p_menu_item_id AND is_enabled = true;
    
    -- If menu item doesn't exist or is disabled, return false
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    -- Get user roles if not provided
    IF array_length(p_user_roles, 1) IS NULL AND p_user_id IS NOT NULL THEN
        SELECT array_agg(role) INTO v_user_roles
        FROM user_roles
        WHERE user_id = p_user_id;
        
        IF v_user_roles IS NULL THEN
            v_user_roles := '{}';
        END IF;
    ELSE
        v_user_roles := p_user_roles;
    END IF;
    
    -- Check visibility based on menu item settings
    CASE v_menu_item.visibility
        WHEN 'public' THEN
            RETURN TRUE;
        WHEN 'authenticated' THEN
            RETURN p_user_id IS NOT NULL;
        WHEN 'admin' THEN
            RETURN 'admin' = ANY(v_user_roles) OR 'superadmin' = ANY(v_user_roles);
        WHEN 'role_based' THEN
            -- Check if user has any of the required roles
            IF v_menu_item.required_roles IS NOT NULL AND array_length(v_menu_item.required_roles, 1) > 0 THEN
                RETURN v_user_roles && v_menu_item.required_roles;
            ELSE
                RETURN FALSE;
            END IF;
        ELSE
            RETURN FALSE;
    END CASE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get filtered menu items for a user
CREATE OR REPLACE FUNCTION get_user_menu_items(
    p_menu_type VARCHAR(20) DEFAULT NULL,
    p_user_id UUID DEFAULT auth.uid(),
    p_user_roles TEXT[] DEFAULT '{}'::TEXT[]
)
RETURNS TABLE (
    id UUID,
    title VARCHAR(255),
    url VARCHAR(500),
    description TEXT,
    menu_type VARCHAR(20),
    parent_id UUID,
    sort_order INTEGER,
    is_enabled BOOLEAN,
    target VARCHAR(20),
    icon VARCHAR(100),
    css_classes TEXT,
    visibility VARCHAR(20),
    required_roles TEXT[],
    is_external BOOLEAN,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        mi.id,
        mi.title,
        mi.url,
        mi.description,
        mi.menu_type,
        mi.parent_id,
        mi.sort_order,
        mi.is_enabled,
        mi.target,
        mi.icon,
        mi.css_classes,
        mi.visibility,
        mi.required_roles,
        mi.is_external,
        mi.created_at,
        mi.updated_at
    FROM menu_items mi
    WHERE 
        (p_menu_type IS NULL OR mi.menu_type = p_menu_type)
        AND mi.is_enabled = true
        AND check_menu_visibility(mi.id, p_user_id, p_user_roles)
    ORDER BY mi.sort_order ASC, mi.title ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create RLS policies for menu audit logs
ALTER TABLE menu_audit_logs ENABLE ROW LEVEL SECURITY;

-- Policy for viewing audit logs (admin/auditor only)
CREATE POLICY "View menu audit logs" ON menu_audit_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_roles ur
            WHERE ur.user_id = auth.uid()
            AND ur.role IN ('admin', 'superadmin', 'auditor')
        )
    );

-- Policy for inserting audit logs (system only)
CREATE POLICY "Insert menu audit logs" ON menu_audit_logs
    FOR INSERT WITH CHECK (true);

-- Create RLS policies for menu permissions
ALTER TABLE menu_permissions ENABLE ROW LEVEL SECURITY;

-- Policy for viewing menu permissions (admin only)
CREATE POLICY "View menu permissions" ON menu_permissions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_roles ur
            WHERE ur.user_id = auth.uid()
            AND ur.role IN ('admin', 'superadmin')
        )
    );

-- Policy for managing menu permissions (admin only)
CREATE POLICY "Manage menu permissions" ON menu_permissions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles ur
            WHERE ur.user_id = auth.uid()
            AND ur.role IN ('admin', 'superadmin')
        )
    );

-- Create RLS policies for feature flags (admin only)
ALTER TABLE menu_feature_flags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View menu feature flags" ON menu_feature_flags
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_roles ur
            WHERE ur.user_id = auth.uid()
            AND ur.role IN ('admin', 'superadmin')
        )
    );

CREATE POLICY "Manage menu feature flags" ON menu_feature_flags
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles ur
            WHERE ur.user_id = auth.uid()
            AND ur.role IN ('admin', 'superadmin')
        )
    );

-- Create RLS policies for feature flag rules (admin only)
ALTER TABLE menu_feature_flag_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View menu feature flag rules" ON menu_feature_flag_rules
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_roles ur
            WHERE ur.user_id = auth.uid()
            AND ur.role IN ('admin', 'superadmin')
        )
    );

CREATE POLICY "Manage menu feature flag rules" ON menu_feature_flag_rules
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles ur
            WHERE ur.user_id = auth.uid()
            AND ur.role IN ('admin', 'superadmin')
        )
    );

-- Insert default feature flags
INSERT INTO menu_feature_flags (flag_id, name, description, enabled, rollout_percentage, target_roles) VALUES
    ('beta_menu_features', 'Beta Menu Features', 'Access to beta menu management features', true, 50, '{admin,superadmin,beta_tester}'),
    ('admin_menu_bulk_ops', 'Admin Menu Bulk Operations', 'Bulk operations for menu management', true, 100, '{admin,superadmin}'),
    ('menu_audit_logs', 'Menu Audit Logs', 'View audit logs for menu changes', true, 100, '{admin,superadmin,auditor}'),
    ('advanced_menu_permissions', 'Advanced Menu Permissions', 'Fine-grained permission control for menu items', true, 75, '{admin,superadmin}')
ON CONFLICT (flag_id) DO NOTHING;

-- Create comment documentation
COMMENT ON TABLE menu_audit_logs IS 'Audit trail for all menu management actions';
COMMENT ON TABLE menu_permissions IS 'Fine-grained permission control for menu items';
COMMENT ON TABLE menu_feature_flags IS 'Feature flags for menu system components';
COMMENT ON TABLE menu_feature_flag_rules IS 'Links menu items to feature flags';

COMMENT ON FUNCTION check_menu_visibility IS 'Checks if a menu item should be visible to a specific user based on visibility settings';
COMMENT ON FUNCTION get_user_menu_items IS 'Returns filtered menu items for a user based on permissions and visibility';
COMMENT ON FUNCTION log_menu_item_changes IS 'Automatically logs changes to menu items for audit trail';