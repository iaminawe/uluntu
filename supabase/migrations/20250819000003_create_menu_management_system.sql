-- Menu Management System Migration
-- Comprehensive schema for dynamic menu management with hierarchical structure,
-- permissions, and audit trails

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types for better type safety
CREATE TYPE menu_type AS ENUM ('main', 'footer', 'sidebar', 'mobile', 'admin');
CREATE TYPE menu_item_type AS ENUM ('link', 'dropdown', 'divider', 'button', 'custom');
CREATE TYPE audit_action AS ENUM ('created', 'updated', 'deleted', 'reordered', 'enabled', 'disabled');

-- 1. Menu Containers Table
-- Defines different menu containers (main, footer, etc.)
CREATE TABLE menu_containers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    type menu_type NOT NULL,
    title VARCHAR(200),
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    max_depth INTEGER DEFAULT 3 CHECK (max_depth >= 1 AND max_depth <= 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- 2. Menu Items Table
-- Hierarchical structure with self-referencing foreign key
CREATE TABLE menu_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    menu_container_id UUID NOT NULL REFERENCES menu_containers(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,

    -- Content properties
    title VARCHAR(200) NOT NULL,
    subtitle VARCHAR(300),
    description TEXT,
    url VARCHAR(1000),
    icon VARCHAR(100), -- Icon name/class or SVG path
    image_url VARCHAR(1000),

    -- Behavior properties
    item_type menu_item_type DEFAULT 'link',
    target VARCHAR(20) DEFAULT '_self' CHECK (target IN ('_self', '_blank', '_parent', '_top')),
    menu_type VARCHAR(50) CHECK (menu_type IN ('main', 'footer', 'mobile', 'admin')),
    is_enabled BOOLEAN DEFAULT true,
    is_visible BOOLEAN DEFAULT true,
    requires_auth BOOLEAN DEFAULT false,
    
    -- Ordering and hierarchy
    sort_order INTEGER DEFAULT 0,
    depth_level INTEGER DEFAULT 0 CHECK (depth_level >= 0 AND depth_level <= 4),
    path TEXT, -- Materialized path for efficient queries (e.g., '1.2.3')
    
    -- Custom properties (JSON for flexibility)
    custom_properties JSONB DEFAULT '{}',
    css_classes VARCHAR(500),
    data_attributes JSONB DEFAULT '{}',
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),
    
    -- Constraints
    CONSTRAINT valid_url_or_dropdown CHECK (
        (item_type = 'dropdown' AND url IS NULL) OR 
        (item_type != 'dropdown' AND (url IS NOT NULL OR item_type = 'divider'))
    ),
    CONSTRAINT valid_parent_container CHECK (
        parent_id IS NULL OR 
        EXISTS (
            SELECT 1 FROM menu_items p 
            WHERE p.id = parent_id 
            AND p.menu_container_id = menu_items.menu_container_id
        )
    )
);

-- 3. Menu Permissions Table
-- Role-based access control for menu items
CREATE TABLE menu_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    menu_item_id UUID NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
    role_name VARCHAR(100) NOT NULL,
    permission_type VARCHAR(50) DEFAULT 'view' CHECK (permission_type IN ('view', 'edit', 'admin')),
    is_allowed BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    
    UNIQUE(menu_item_id, role_name, permission_type)
);

-- 4. Menu Audit Log Table
-- Complete audit trail for all menu changes
CREATE TABLE menu_audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    menu_item_id UUID REFERENCES menu_items(id) ON DELETE SET NULL,
    menu_container_id UUID REFERENCES menu_containers(id) ON DELETE SET NULL,
    
    -- Audit details
    action audit_action NOT NULL,
    table_name VARCHAR(50) NOT NULL,
    record_id UUID NOT NULL,
    
    -- Change tracking
    old_values JSONB,
    new_values JSONB,
    changed_fields TEXT[],
    
    -- Context
    user_id UUID REFERENCES auth.users(id),
    user_agent TEXT,
    ip_address INET,
    session_id VARCHAR(100),
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Indexes for efficient querying
    INDEX idx_audit_menu_item ON menu_audit_log(menu_item_id, created_at),
    INDEX idx_audit_user ON menu_audit_log(user_id, created_at),
    INDEX idx_audit_action ON menu_audit_log(action, created_at)
);

-- 5. Menu Item Translations Table (for internationalization)
CREATE TABLE menu_item_translations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    menu_item_id UUID NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
    language_code VARCHAR(10) NOT NULL DEFAULT 'en',
    title VARCHAR(200),
    subtitle VARCHAR(300),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(menu_item_id, language_code)
);

-- Create indexes for performance optimization
-- Menu Items indexes
CREATE INDEX idx_menu_items_container ON menu_items(menu_container_id);
CREATE INDEX idx_menu_items_parent ON menu_items(parent_id);
CREATE INDEX idx_menu_items_sort_order ON menu_items(menu_container_id, parent_id, sort_order);
CREATE INDEX idx_menu_items_path ON menu_items(path);
CREATE INDEX idx_menu_items_enabled_visible ON menu_items(is_enabled, is_visible);
CREATE INDEX idx_menu_items_depth ON menu_items(depth_level);
CREATE INDEX idx_menu_items_type ON menu_items(item_type);

-- Menu Containers indexes
CREATE INDEX idx_menu_containers_type ON menu_containers(type);
CREATE INDEX idx_menu_containers_active ON menu_containers(is_active);

-- Menu Permissions indexes
CREATE INDEX idx_menu_permissions_item ON menu_permissions(menu_item_id);
CREATE INDEX idx_menu_permissions_role ON menu_permissions(role_name);

-- Translation indexes
CREATE INDEX idx_menu_translations_item_lang ON menu_item_translations(menu_item_id, language_code);

-- Functions and Triggers

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to maintain materialized path
CREATE OR REPLACE FUNCTION update_menu_item_path()
RETURNS TRIGGER AS $$
BEGIN
    -- Calculate depth level
    IF NEW.parent_id IS NULL THEN
        NEW.depth_level = 0;
        NEW.path = NEW.sort_order::TEXT;
    ELSE
        SELECT 
            depth_level + 1,
            path || '.' || NEW.sort_order::TEXT
        INTO NEW.depth_level, NEW.path
        FROM menu_items 
        WHERE id = NEW.parent_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to create audit log entries
CREATE OR REPLACE FUNCTION create_menu_audit_log()
RETURNS TRIGGER AS $$
DECLARE
    action_type audit_action;
    old_data JSONB;
    new_data JSONB;
    changed_cols TEXT[];
BEGIN
    -- Determine action type
    IF TG_OP = 'INSERT' THEN
        action_type = 'created';
        old_data = NULL;
        new_data = to_jsonb(NEW);
    ELSIF TG_OP = 'UPDATE' THEN
        action_type = 'updated';
        old_data = to_jsonb(OLD);
        new_data = to_jsonb(NEW);
        
        -- Find changed columns
        SELECT ARRAY_AGG(key) INTO changed_cols
        FROM jsonb_each(old_data) o
        JOIN jsonb_each(new_data) n ON o.key = n.key
        WHERE o.value != n.value;
        
    ELSIF TG_OP = 'DELETE' THEN
        action_type = 'deleted';
        old_data = to_jsonb(OLD);
        new_data = NULL;
    END IF;
    
    -- Insert audit record
    INSERT INTO menu_audit_log (
        menu_item_id,
        menu_container_id,
        action,
        table_name,
        record_id,
        old_values,
        new_values,
        changed_fields,
        user_id
    ) VALUES (
        COALESCE(NEW.id, OLD.id),
        COALESCE(NEW.menu_container_id, OLD.menu_container_id),
        action_type,
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        old_data,
        new_data,
        changed_cols,
        auth.uid()
    );
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply triggers
CREATE TRIGGER update_menu_containers_updated_at
    BEFORE UPDATE ON menu_containers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_menu_items_updated_at
    BEFORE UPDATE ON menu_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_menu_item_translations_updated_at
    BEFORE UPDATE ON menu_item_translations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER maintain_menu_item_path
    BEFORE INSERT OR UPDATE ON menu_items
    FOR EACH ROW EXECUTE FUNCTION update_menu_item_path();

CREATE TRIGGER audit_menu_containers
    AFTER INSERT OR UPDATE OR DELETE ON menu_containers
    FOR EACH ROW EXECUTE FUNCTION create_menu_audit_log();

CREATE TRIGGER audit_menu_items
    AFTER INSERT OR UPDATE OR DELETE ON menu_items
    FOR EACH ROW EXECUTE FUNCTION create_menu_audit_log();

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE menu_containers ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_item_translations ENABLE ROW LEVEL SECURITY;

-- Menu Containers policies
CREATE POLICY "Public can view active menu containers" ON menu_containers
    FOR SELECT USING (is_active = true);

CREATE POLICY "Authenticated users can manage menu containers" ON menu_containers
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admins have full access to menu containers" ON menu_containers
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Menu Items policies
CREATE POLICY "Public can view enabled menu items" ON menu_items
    FOR SELECT USING (
        is_enabled = true 
        AND is_visible = true
        AND EXISTS (
            SELECT 1 FROM menu_containers mc 
            WHERE mc.id = menu_container_id 
            AND mc.is_active = true
        )
    );

CREATE POLICY "Authenticated users can view menu items with permissions" ON menu_items
    FOR SELECT USING (
        auth.role() = 'authenticated' AND (
            is_enabled = true AND is_visible = true
            OR EXISTS (
                SELECT 1 FROM menu_permissions mp
                WHERE mp.menu_item_id = id
                AND mp.role_name = (
                    SELECT role FROM user_roles 
                    WHERE user_id = auth.uid() 
                    LIMIT 1
                )
                AND mp.is_allowed = true
            )
        )
    );

CREATE POLICY "Menu editors can manage menu items" ON menu_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles ur
            WHERE ur.user_id = auth.uid()
            AND ur.role IN ('admin', 'menu_editor')
        )
    );

-- Menu Permissions policies
CREATE POLICY "Admins can manage menu permissions" ON menu_permissions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Audit Log policies
CREATE POLICY "Users can view their own audit logs" ON menu_audit_log
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can view all audit logs" ON menu_audit_log
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Translation policies
CREATE POLICY "Public can view menu translations" ON menu_item_translations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM menu_items mi
            WHERE mi.id = menu_item_id
            AND mi.is_enabled = true
            AND mi.is_visible = true
        )
    );

CREATE POLICY "Menu editors can manage translations" ON menu_item_translations
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles ur
            WHERE ur.user_id = auth.uid()
            AND ur.role IN ('admin', 'menu_editor', 'translator')
        )
    );

-- Utility Views

-- View for complete menu tree with permissions
CREATE VIEW menu_tree_view AS
WITH RECURSIVE menu_tree AS (
    -- Root items
    SELECT 
        mi.*,
        mc.name as container_name,
        mc.type as container_type,
        0 as level,
        ARRAY[mi.sort_order] as sort_path,
        mi.title as breadcrumb
    FROM menu_items mi
    JOIN menu_containers mc ON mi.menu_container_id = mc.id
    WHERE mi.parent_id IS NULL
    
    UNION ALL
    
    -- Child items
    SELECT 
        mi.*,
        mt.container_name,
        mt.container_type,
        mt.level + 1,
        mt.sort_path || mi.sort_order,
        mt.breadcrumb || ' > ' || mi.title
    FROM menu_items mi
    JOIN menu_tree mt ON mi.parent_id = mt.id
)
SELECT * FROM menu_tree
ORDER BY container_name, sort_path;

-- View for menu items with user permissions
CREATE VIEW menu_items_with_permissions AS
SELECT 
    mi.*,
    mc.name as container_name,
    mc.type as container_type,
    COALESCE(
        bool_or(mp.is_allowed), 
        (mi.requires_auth = false OR auth.role() = 'authenticated')
    ) as user_can_view
FROM menu_items mi
JOIN menu_containers mc ON mi.menu_container_id = mc.id
LEFT JOIN menu_permissions mp ON mi.id = mp.menu_item_id
LEFT JOIN user_roles ur ON ur.user_id = auth.uid() AND ur.role = mp.role_name
WHERE mi.is_enabled = true AND mi.is_visible = true
GROUP BY mi.id, mc.name, mc.type;

-- Insert default menu containers
INSERT INTO menu_containers (name, type, title, description) VALUES
('main-navigation', 'main', 'Main Navigation', 'Primary site navigation menu'),
('footer-menu', 'footer', 'Footer Menu', 'Footer navigation links'),
('user-menu', 'dropdown', 'User Menu', 'User account dropdown menu'),
('admin-menu', 'admin', 'Admin Menu', 'Administrative navigation menu');

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated, anon;
GRANT SELECT ON menu_containers, menu_items, menu_item_translations TO anon;
GRANT ALL ON menu_containers, menu_items, menu_permissions, menu_audit_log, menu_item_translations TO authenticated;
GRANT SELECT ON menu_tree_view, menu_items_with_permissions TO anon, authenticated;

-- Comments for documentation
COMMENT ON TABLE menu_containers IS 'Defines different menu containers (main, footer, sidebar, etc.)';
COMMENT ON TABLE menu_items IS 'Hierarchical menu items with support for drag-and-drop reordering';
COMMENT ON TABLE menu_permissions IS 'Role-based permissions for menu item visibility';
COMMENT ON TABLE menu_audit_log IS 'Complete audit trail for all menu changes';
COMMENT ON TABLE menu_item_translations IS 'Internationalization support for menu items';

COMMENT ON COLUMN menu_items.path IS 'Materialized path for efficient hierarchical queries';
COMMENT ON COLUMN menu_items.custom_properties IS 'JSON field for extensible menu item properties';
COMMENT ON COLUMN menu_items.sort_order IS 'Numeric order for drag-and-drop functionality';