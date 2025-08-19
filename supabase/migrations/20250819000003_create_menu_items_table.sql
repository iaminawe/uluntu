-- Create menu_items table for comprehensive menu management
-- This migration creates a flexible menu system supporting hierarchical navigation

-- Create menu types enum
CREATE TYPE menu_type AS ENUM ('main', 'footer', 'mobile', 'admin');

-- Create menu target enum
CREATE TYPE menu_target AS ENUM ('_self', '_blank', '_parent', '_top');

-- Create menu visibility enum
CREATE TYPE menu_visibility AS ENUM ('public', 'authenticated', 'admin', 'role_based');

-- Create the menu_items table
CREATE TABLE menu_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    url VARCHAR(2048) NOT NULL,
    description TEXT,
    menu_type menu_type NOT NULL DEFAULT 'main',
    parent_id UUID REFERENCES menu_items(id) ON DELETE SET NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_enabled BOOLEAN NOT NULL DEFAULT true,
    target menu_target NOT NULL DEFAULT '_self',
    icon VARCHAR(100),
    css_classes VARCHAR(500),
    visibility menu_visibility NOT NULL DEFAULT 'public',
    required_roles TEXT[], -- Array of role names for role-based visibility
    is_external BOOLEAN NOT NULL DEFAULT false,
    status content_status NOT NULL DEFAULT 'published',
    featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Create indexes for optimal performance
CREATE INDEX idx_menu_items_menu_type ON menu_items(menu_type);
CREATE INDEX idx_menu_items_parent_id ON menu_items(parent_id);
CREATE INDEX idx_menu_items_sort_order ON menu_items(sort_order);
CREATE INDEX idx_menu_items_is_enabled ON menu_items(is_enabled);
CREATE INDEX idx_menu_items_status ON menu_items(status);
CREATE INDEX idx_menu_items_visibility ON menu_items(visibility);
CREATE INDEX idx_menu_items_created_at ON menu_items(created_at);

-- Composite indexes for common queries
CREATE INDEX idx_menu_items_type_enabled_sort ON menu_items(menu_type, is_enabled, sort_order);
CREATE INDEX idx_menu_items_parent_sort ON menu_items(parent_id, sort_order);
CREATE INDEX idx_menu_items_status_featured ON menu_items(status, featured);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_menu_items_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER menu_items_updated_at
    BEFORE UPDATE ON menu_items
    FOR EACH ROW
    EXECUTE FUNCTION update_menu_items_updated_at();

-- Create audit trigger for tracking changes
CREATE OR REPLACE FUNCTION audit_menu_items_changes()
RETURNS TRIGGER AS $$
BEGIN
    -- Set updated_by when not explicitly set
    IF TG_OP = 'UPDATE' AND NEW.updated_by IS NULL THEN
        NEW.updated_by = auth.uid();
    END IF;
    
    -- Set created_by on insert when not explicitly set
    IF TG_OP = 'INSERT' AND NEW.created_by IS NULL THEN
        NEW.created_by = auth.uid();
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER menu_items_audit
    BEFORE INSERT OR UPDATE ON menu_items
    FOR EACH ROW
    EXECUTE FUNCTION audit_menu_items_changes();

-- Row Level Security (RLS) Policies
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

-- Public read access for published menu items
CREATE POLICY "Public can read published menu items" 
    ON menu_items FOR SELECT 
    USING (
        status = 'published' 
        AND is_enabled = true 
        AND (
            visibility = 'public' 
            OR (visibility = 'authenticated' AND auth.role() = 'authenticated')
        )
    );

-- Admin full access
CREATE POLICY "Admin full access to menu items" 
    ON menu_items FOR ALL 
    USING (
        EXISTS (
            SELECT 1 FROM user_roles ur 
            WHERE ur.user_id = auth.uid() 
            AND ur.role IN ('admin', 'superadmin')
        )
    );

-- Role-based visibility for specific menu items
CREATE POLICY "Role-based menu item visibility" 
    ON menu_items FOR SELECT 
    USING (
        status = 'published' 
        AND is_enabled = true 
        AND visibility = 'role_based'
        AND auth.role() = 'authenticated'
        AND EXISTS (
            SELECT 1 FROM user_roles ur 
            WHERE ur.user_id = auth.uid() 
            AND ur.role = ANY(required_roles)
        )
    );

-- Insert some default menu items
INSERT INTO menu_items (title, url, menu_type, sort_order, visibility, is_external) VALUES
    ('Home', '/', 'main', 0, 'public', false),
    ('Directory', '/directory', 'main', 100, 'public', false),
    ('Companies', '/companies', 'main', 200, 'public', false),
    ('Events', '/events', 'main', 300, 'public', false),
    ('Groups', '/groups', 'main', 400, 'public', false),
    ('Resources', '/resources', 'main', 500, 'public', false),
    ('About', '/about', 'main', 600, 'public', false),
    ('Contact', '/contact', 'main', 700, 'public', false),
    
    -- Footer menu items
    ('Privacy Policy', '/privacy', 'footer', 0, 'public', false),
    ('Terms of Service', '/terms', 'footer', 100, 'public', false),
    ('Newsletter', '/newsletter', 'footer', 200, 'public', false),
    ('Support', '/support', 'footer', 300, 'authenticated', false),
    
    -- Admin menu items
    ('Dashboard', '/admin', 'admin', 0, 'admin', false),
    ('Users', '/admin/users', 'admin', 100, 'admin', false),
    ('Settings', '/admin/settings', 'admin', 200, 'admin', false),
    ('Menu Management', '/admin/menus', 'admin', 300, 'admin', false);

-- Create a view for hierarchical menu structure
CREATE OR REPLACE VIEW menu_items_hierarchy AS
WITH RECURSIVE menu_tree AS (
    -- Base case: root menu items (no parent)
    SELECT 
        id,
        title,
        url,
        description,
        menu_type,
        parent_id,
        sort_order,
        is_enabled,
        target,
        icon,
        css_classes,
        visibility,
        required_roles,
        is_external,
        status,
        featured,
        created_at,
        updated_at,
        0 as depth,
        ARRAY[sort_order] as path,
        title as full_path
    FROM menu_items
    WHERE parent_id IS NULL
    
    UNION ALL
    
    -- Recursive case: child menu items
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
        mi.status,
        mi.featured,
        mi.created_at,
        mi.updated_at,
        mt.depth + 1,
        mt.path || mi.sort_order,
        mt.full_path || ' > ' || mi.title
    FROM menu_items mi
    INNER JOIN menu_tree mt ON mi.parent_id = mt.id
)
SELECT * FROM menu_tree
ORDER BY menu_type, path;

-- Grant appropriate permissions
GRANT SELECT ON menu_items TO anon;
GRANT SELECT ON menu_items TO authenticated;
GRANT ALL ON menu_items TO service_role;

-- Grant access to the hierarchy view
GRANT SELECT ON menu_items_hierarchy TO anon;
GRANT SELECT ON menu_items_hierarchy TO authenticated;
GRANT SELECT ON menu_items_hierarchy TO service_role;

-- Create function to get menu items with children
CREATE OR REPLACE FUNCTION get_menu_items_with_children(
    p_menu_type menu_type DEFAULT NULL,
    p_is_enabled BOOLEAN DEFAULT NULL,
    p_visibility menu_visibility DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    title VARCHAR,
    url VARCHAR,
    description TEXT,
    menu_type menu_type,
    parent_id UUID,
    sort_order INTEGER,
    is_enabled BOOLEAN,
    target menu_target,
    icon VARCHAR,
    css_classes VARCHAR,
    visibility menu_visibility,
    required_roles TEXT[],
    is_external BOOLEAN,
    status content_status,
    featured BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    children JSONB
) AS $$
BEGIN
    RETURN QUERY
    WITH RECURSIVE menu_tree AS (
        -- Base case: get all menu items matching filters
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
            mi.status,
            mi.featured,
            mi.created_at,
            mi.updated_at,
            '[]'::jsonb as children
        FROM menu_items mi
        WHERE (p_menu_type IS NULL OR mi.menu_type = p_menu_type)
          AND (p_is_enabled IS NULL OR mi.is_enabled = p_is_enabled)
          AND (p_visibility IS NULL OR mi.visibility = p_visibility)
          AND mi.status = 'published'
        ORDER BY mi.sort_order
    )
    SELECT * FROM menu_tree;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION get_menu_items_with_children TO anon;
GRANT EXECUTE ON FUNCTION get_menu_items_with_children TO authenticated;
GRANT EXECUTE ON FUNCTION get_menu_items_with_children TO service_role;

COMMENT ON TABLE menu_items IS 'Comprehensive menu management system supporting hierarchical navigation';
COMMENT ON FUNCTION get_menu_items_with_children IS 'Retrieve menu items with optional filtering and hierarchical structure';