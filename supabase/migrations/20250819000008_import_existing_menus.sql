-- Import existing menu structure from NavigationProvider
-- This migration populates the menu_items table with the current menu structure

-- First, ensure the menu_items table exists
CREATE TABLE IF NOT EXISTS public.menu_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    url VARCHAR(500),
    description TEXT,
    menu_type VARCHAR(50) NOT NULL,
    parent_id UUID REFERENCES public.menu_items(id) ON DELETE CASCADE,
    sort_order INTEGER DEFAULT 0,
    is_enabled BOOLEAN DEFAULT true,
    target VARCHAR(20) DEFAULT '_self',
    icon VARCHAR(100),
    css_classes VARCHAR(255),
    visibility VARCHAR(50) DEFAULT 'public',
    required_roles TEXT[],
    required_permissions TEXT[],
    feature_flag VARCHAR(100),
    is_external BOOLEAN DEFAULT false,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),
    
    CONSTRAINT menu_items_menu_type_check CHECK (
        menu_type IN ('main', 'footer', 'mobile', 'admin', 'user')
    ),
    CONSTRAINT menu_items_visibility_check CHECK (
        visibility IN ('public', 'authenticated', 'admin', 'role_based')
    ),
    CONSTRAINT menu_items_target_check CHECK (
        target IN ('_self', '_blank', '_parent', '_top')
    )
);

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_menu_items_menu_type ON public.menu_items(menu_type);
CREATE INDEX IF NOT EXISTS idx_menu_items_parent_id ON public.menu_items(parent_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_sort_order ON public.menu_items(sort_order);
CREATE INDEX IF NOT EXISTS idx_menu_items_is_enabled ON public.menu_items(is_enabled);
CREATE INDEX IF NOT EXISTS idx_menu_items_visibility ON public.menu_items(visibility);
CREATE INDEX IF NOT EXISTS idx_menu_items_feature_flag ON public.menu_items(feature_flag);

-- Enable RLS
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;

-- Create policies if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'menu_items' 
        AND policyname = 'Menu items are viewable by everyone'
    ) THEN
        CREATE POLICY "Menu items are viewable by everyone"
            ON public.menu_items
            FOR SELECT
            TO public
            USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'menu_items' 
        AND policyname = 'Only admins can modify menu items'
    ) THEN
        CREATE POLICY "Only admins can modify menu items"
            ON public.menu_items
            FOR ALL
            TO authenticated
            USING (
                EXISTS (
                    SELECT 1 FROM public.user_roles
                    WHERE user_roles.user_id = auth.uid()
                    AND user_roles.role IN ('admin', 'superadmin')
                )
            );
    END IF;
END $$;

-- Clear existing menu items to avoid duplicates
TRUNCATE TABLE public.menu_items CASCADE;

-- Insert main/header menu items
WITH main_menu AS (
    -- Community (Parent)
    INSERT INTO public.menu_items (id, title, url, description, menu_type, sort_order, is_enabled, visibility)
    VALUES 
        ('a1000000-0000-0000-0000-000000000001', 'Community', '/community', 'Connect with the tech community', 'main', 1, true, 'public')
    RETURNING id
)
-- Community children
INSERT INTO public.menu_items (title, url, description, menu_type, parent_id, sort_order, is_enabled, visibility, feature_flag)
VALUES 
    ('Events', '/events', 'Workshops, meetups, and tech talks', 'main', 'a1000000-0000-0000-0000-000000000001', 1, true, 'public', 'events_system'),
    ('Directory', '/directory', 'Connect with tech professionals', 'main', 'a1000000-0000-0000-0000-000000000001', 2, true, 'public', 'members_directory'),
    ('Groups', '/groups', 'Join communities of interest', 'main', 'a1000000-0000-0000-0000-000000000001', 3, true, 'public', 'groups_communities'),
    ('News', '/news', 'Latest tech news and articles', 'main', 'a1000000-0000-0000-0000-000000000001', 4, true, 'public', 'news_blog'),
    ('Galleries', '/galleries', 'Browse community photo galleries', 'main', 'a1000000-0000-0000-0000-000000000001', 5, true, 'public', 'photo_galleries');

-- Business (Parent)
WITH business_menu AS (
    INSERT INTO public.menu_items (id, title, url, description, menu_type, sort_order, is_enabled, visibility)
    VALUES 
        ('a1000000-0000-0000-0000-000000000002', 'Business', '/business', 'Business and opportunities', 'main', 2, true, 'public')
    RETURNING id
)
-- Business children
INSERT INTO public.menu_items (title, url, description, menu_type, parent_id, sort_order, is_enabled, visibility, feature_flag)
VALUES 
    ('Companies', '/companies', 'Explore local tech companies', 'main', 'a1000000-0000-0000-0000-000000000002', 1, true, 'public', 'companies_listing'),
    ('Opportunities', '/opportunities', 'Find jobs and volunteer roles', 'main', 'a1000000-0000-0000-0000-000000000002', 2, true, 'public', 'opportunities_board'),
    ('Marketplace', '/marketplace', 'Buy and sell tech items', 'main', 'a1000000-0000-0000-0000-000000000002', 3, true, 'public', 'marketplace');

-- Resources (Standalone)
INSERT INTO public.menu_items (title, url, description, menu_type, sort_order, is_enabled, visibility, feature_flag)
VALUES 
    ('Resources', '/resources', 'Educational content and guides', 'main', 3, true, 'public', 'resources_library');

-- Topics (Standalone)
INSERT INTO public.menu_items (title, url, description, menu_type, sort_order, is_enabled, visibility)
VALUES 
    ('Topics', '/topics', 'Browse content by topic', 'main', 4, true, 'public');

-- About (Parent)
WITH about_menu AS (
    INSERT INTO public.menu_items (id, title, url, description, menu_type, sort_order, is_enabled, visibility)
    VALUES 
        ('a1000000-0000-0000-0000-000000000003', 'About', '/about', 'About us', 'main', 5, true, 'public')
    RETURNING id
)
-- About children
INSERT INTO public.menu_items (title, url, description, menu_type, parent_id, sort_order, is_enabled, visibility)
VALUES 
    ('About Us', '/about', 'Learn about our mission', 'main', 'a1000000-0000-0000-0000-000000000003', 1, true, 'public'),
    ('About Uluntu', '/about-uluntu', 'Learn about the Uluntu platform', 'main', 'a1000000-0000-0000-0000-000000000003', 2, true, 'public'),
    ('Partners', '/partners', 'Our community partners and sponsors', 'main', 'a1000000-0000-0000-0000-000000000003', 3, true, 'public'),
    ('Contact', '/contact', 'Get in touch with us', 'main', 'a1000000-0000-0000-0000-000000000003', 4, true, 'public'),
    ('Privacy', '/privacy', 'Privacy policy and data protection', 'main', 'a1000000-0000-0000-0000-000000000003', 5, true, 'public'),
    ('Terms', '/terms', 'Terms of service and guidelines', 'main', 'a1000000-0000-0000-0000-000000000003', 6, true, 'public');

-- Insert footer menu items
INSERT INTO public.menu_items (title, url, menu_type, sort_order, is_enabled, visibility)
VALUES 
    ('Community', '/community', 'footer', 1, true, 'public'),
    ('Directory', '/directory', 'footer', 2, true, 'public'),
    ('Companies', '/companies', 'footer', 3, true, 'public'),
    ('Groups', '/groups', 'footer', 4, true, 'public'),
    ('Resources', '/resources', 'footer', 5, true, 'public'),
    ('Events', '/events', 'footer', 6, true, 'public'),
    ('News', '/news', 'footer', 7, true, 'public'),
    ('About', '/about', 'footer', 8, true, 'public'),
    ('Contact', '/contact', 'footer', 9, true, 'public'),
    ('Privacy', '/privacy', 'footer', 10, true, 'public'),
    ('Terms', '/terms', 'footer', 11, true, 'public');

-- Insert mobile menu items (copy from main menu structure)
-- Mobile menu typically mirrors the main menu
WITH mobile_community AS (
    INSERT INTO public.menu_items (id, title, url, description, menu_type, sort_order, is_enabled, visibility)
    VALUES 
        ('a2000000-0000-0000-0000-000000000001', 'Community', '/community', 'Connect with the tech community', 'mobile', 1, true, 'public')
    RETURNING id
)
INSERT INTO public.menu_items (title, url, description, menu_type, parent_id, sort_order, is_enabled, visibility, feature_flag)
VALUES 
    ('Events', '/events', 'Workshops, meetups, and tech talks', 'mobile', 'a2000000-0000-0000-0000-000000000001', 1, true, 'public', 'events_system'),
    ('Directory', '/directory', 'Connect with tech professionals', 'mobile', 'a2000000-0000-0000-0000-000000000001', 2, true, 'public', 'members_directory'),
    ('Groups', '/groups', 'Join communities of interest', 'mobile', 'a2000000-0000-0000-0000-000000000001', 3, true, 'public', 'groups_communities'),
    ('News', '/news', 'Latest tech news and articles', 'mobile', 'a2000000-0000-0000-0000-000000000001', 4, true, 'public', 'news_blog'),
    ('Galleries', '/galleries', 'Browse community photo galleries', 'mobile', 'a2000000-0000-0000-0000-000000000001', 5, true, 'public', 'photo_galleries');

WITH mobile_business AS (
    INSERT INTO public.menu_items (id, title, url, description, menu_type, sort_order, is_enabled, visibility)
    VALUES 
        ('a2000000-0000-0000-0000-000000000002', 'Business', '/business', 'Business and opportunities', 'mobile', 2, true, 'public')
    RETURNING id
)
INSERT INTO public.menu_items (title, url, description, menu_type, parent_id, sort_order, is_enabled, visibility, feature_flag)
VALUES 
    ('Companies', '/companies', 'Explore local tech companies', 'mobile', 'a2000000-0000-0000-0000-000000000002', 1, true, 'public', 'companies_listing'),
    ('Opportunities', '/opportunities', 'Find jobs and volunteer roles', 'mobile', 'a2000000-0000-0000-0000-000000000002', 2, true, 'public', 'opportunities_board'),
    ('Marketplace', '/marketplace', 'Buy and sell tech items', 'mobile', 'a2000000-0000-0000-0000-000000000002', 3, true, 'public', 'marketplace');

INSERT INTO public.menu_items (title, url, description, menu_type, sort_order, is_enabled, visibility, feature_flag)
VALUES 
    ('Resources', '/resources', 'Educational content and guides', 'mobile', 3, true, 'public', 'resources_library'),
    ('Topics', '/topics', 'Browse content by topic', 'mobile', 4, true, 'public');

WITH mobile_about AS (
    INSERT INTO public.menu_items (id, title, url, description, menu_type, sort_order, is_enabled, visibility)
    VALUES 
        ('a2000000-0000-0000-0000-000000000003', 'About', '/about', 'About us', 'mobile', 5, true, 'public')
    RETURNING id
)
INSERT INTO public.menu_items (title, url, description, menu_type, parent_id, sort_order, is_enabled, visibility)
VALUES 
    ('About Us', '/about', 'Learn about our mission', 'mobile', 'a2000000-0000-0000-0000-000000000003', 1, true, 'public'),
    ('About Uluntu', '/about-uluntu', 'Learn about the Uluntu platform', 'mobile', 'a2000000-0000-0000-0000-000000000003', 2, true, 'public'),
    ('Partners', '/partners', 'Our community partners and sponsors', 'mobile', 'a2000000-0000-0000-0000-000000000003', 3, true, 'public'),
    ('Contact', '/contact', 'Get in touch with us', 'mobile', 'a2000000-0000-0000-0000-000000000003', 4, true, 'public'),
    ('Privacy', '/privacy', 'Privacy policy and data protection', 'mobile', 'a2000000-0000-0000-0000-000000000003', 5, true, 'public'),
    ('Terms', '/terms', 'Terms of service and guidelines', 'mobile', 'a2000000-0000-0000-0000-000000000003', 6, true, 'public');

-- Insert admin menu items
INSERT INTO public.menu_items (title, url, description, menu_type, sort_order, is_enabled, visibility)
VALUES 
    ('Dashboard', '/admin', 'Admin dashboard', 'admin', 1, true, 'admin'),
    ('Users', '/admin/users', 'Manage users', 'admin', 2, true, 'admin'),
    ('Content', '/admin/content', 'Manage content', 'admin', 3, true, 'admin'),
    ('Settings', '/admin/settings', 'System settings', 'admin', 4, true, 'admin'),
    ('Menu Management', '/admin/menu-management', 'Manage navigation menus', 'admin', 5, true, 'admin'),
    ('Features', '/admin/features', 'Feature flags', 'admin', 6, true, 'admin'),
    ('Audit Logs', '/admin/audit', 'View system audit logs', 'admin', 7, true, 'admin');

-- Grant necessary permissions
GRANT SELECT ON public.menu_items TO anon, authenticated;
GRANT ALL ON public.menu_items TO authenticated;

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_menu_items_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update updated_at
DROP TRIGGER IF EXISTS update_menu_items_updated_at_trigger ON public.menu_items;
CREATE TRIGGER update_menu_items_updated_at_trigger
    BEFORE UPDATE ON public.menu_items
    FOR EACH ROW
    EXECUTE FUNCTION update_menu_items_updated_at();

-- Add helpful comments
COMMENT ON TABLE public.menu_items IS 'Dynamic menu system for site navigation';
COMMENT ON COLUMN public.menu_items.menu_type IS 'Type of menu: main (header), footer, mobile, admin, user';
COMMENT ON COLUMN public.menu_items.visibility IS 'Who can see this menu item: public, authenticated, admin, role_based';
COMMENT ON COLUMN public.menu_items.feature_flag IS 'Optional feature flag that must be enabled for this item to show';
COMMENT ON COLUMN public.menu_items.required_roles IS 'Array of roles required when visibility is role_based';
COMMENT ON COLUMN public.menu_items.is_external IS 'Whether the link opens in a new tab/window';