-- Import existing menu structure with proper type handling
-- This script handles the existing menu_items table with enum types

-- First, clear existing menu items to avoid duplicates
TRUNCATE TABLE public.menu_items CASCADE;

-- ============================================
-- MAIN/HEADER MENU
-- ============================================

-- Community (Parent)
INSERT INTO public.menu_items (id, title, url, description, menu_type, sort_order, is_enabled, visibility)
VALUES 
    ('a1000000-0000-0000-0000-000000000001', 'Community', '/community', 'Connect with the tech community', 'main'::menu_type, 1, true, 'public'::menu_visibility);

-- Community children
INSERT INTO public.menu_items (title, url, description, menu_type, parent_id, sort_order, is_enabled, visibility)
VALUES 
    ('Events', '/events', 'Workshops, meetups, and tech talks', 'main'::menu_type, 'a1000000-0000-0000-0000-000000000001', 1, true, 'public'::menu_visibility),
    ('Directory', '/directory', 'Connect with tech professionals', 'main'::menu_type, 'a1000000-0000-0000-0000-000000000001', 2, true, 'public'::menu_visibility),
    ('Groups', '/groups', 'Join communities of interest', 'main'::menu_type, 'a1000000-0000-0000-0000-000000000001', 3, true, 'public'::menu_visibility),
    ('News', '/news', 'Latest tech news and articles', 'main'::menu_type, 'a1000000-0000-0000-0000-000000000001', 4, true, 'public'::menu_visibility),
    ('Galleries', '/galleries', 'Browse community photo galleries', 'main'::menu_type, 'a1000000-0000-0000-0000-000000000001', 5, true, 'public'::menu_visibility);

-- Business (Parent)
INSERT INTO public.menu_items (id, title, url, description, menu_type, sort_order, is_enabled, visibility)
VALUES 
    ('a1000000-0000-0000-0000-000000000002', 'Business', '/business', 'Business and opportunities', 'main'::menu_type, 2, true, 'public'::menu_visibility);

-- Business children
INSERT INTO public.menu_items (title, url, description, menu_type, parent_id, sort_order, is_enabled, visibility)
VALUES 
    ('Companies', '/companies', 'Explore local tech companies', 'main'::menu_type, 'a1000000-0000-0000-0000-000000000002', 1, true, 'public'::menu_visibility),
    ('Opportunities', '/opportunities', 'Find jobs and volunteer roles', 'main'::menu_type, 'a1000000-0000-0000-0000-000000000002', 2, true, 'public'::menu_visibility),
    ('Marketplace', '/marketplace', 'Buy and sell tech items', 'main'::menu_type, 'a1000000-0000-0000-0000-000000000002', 3, true, 'public'::menu_visibility);

-- Resources (Standalone)
INSERT INTO public.menu_items (title, url, description, menu_type, sort_order, is_enabled, visibility)
VALUES 
    ('Resources', '/resources', 'Educational content and guides', 'main'::menu_type, 3, true, 'public'::menu_visibility);

-- Topics (Standalone)
INSERT INTO public.menu_items (title, url, description, menu_type, sort_order, is_enabled, visibility)
VALUES 
    ('Topics', '/topics', 'Browse content by topic', 'main'::menu_type, 4, true, 'public'::menu_visibility);

-- About (Parent)
INSERT INTO public.menu_items (id, title, url, description, menu_type, sort_order, is_enabled, visibility)
VALUES 
    ('a1000000-0000-0000-0000-000000000003', 'About', '/about', 'About us', 'main'::menu_type, 5, true, 'public'::menu_visibility);

-- About children
INSERT INTO public.menu_items (title, url, description, menu_type, parent_id, sort_order, is_enabled, visibility)
VALUES 
    ('About Us', '/about', 'Learn about our mission', 'main'::menu_type, 'a1000000-0000-0000-0000-000000000003', 1, true, 'public'::menu_visibility),
    ('About Uluntu', '/about-uluntu', 'Learn about the Uluntu platform', 'main'::menu_type, 'a1000000-0000-0000-0000-000000000003', 2, true, 'public'::menu_visibility),
    ('Partners', '/partners', 'Our community partners and sponsors', 'main'::menu_type, 'a1000000-0000-0000-0000-000000000003', 3, true, 'public'::menu_visibility),
    ('Contact', '/contact', 'Get in touch with us', 'main'::menu_type, 'a1000000-0000-0000-0000-000000000003', 4, true, 'public'::menu_visibility),
    ('Privacy', '/privacy', 'Privacy policy and data protection', 'main'::menu_type, 'a1000000-0000-0000-0000-000000000003', 5, true, 'public'::menu_visibility),
    ('Terms', '/terms', 'Terms of service and guidelines', 'main'::menu_type, 'a1000000-0000-0000-0000-000000000003', 6, true, 'public'::menu_visibility);

-- ============================================
-- FOOTER MENU
-- ============================================

INSERT INTO public.menu_items (title, url, menu_type, sort_order, is_enabled, visibility)
VALUES 
    ('Community', '/community', 'footer'::menu_type, 1, true, 'public'::menu_visibility),
    ('Directory', '/directory', 'footer'::menu_type, 2, true, 'public'::menu_visibility),
    ('Companies', '/companies', 'footer'::menu_type, 3, true, 'public'::menu_visibility),
    ('Groups', '/groups', 'footer'::menu_type, 4, true, 'public'::menu_visibility),
    ('Resources', '/resources', 'footer'::menu_type, 5, true, 'public'::menu_visibility),
    ('Events', '/events', 'footer'::menu_type, 6, true, 'public'::menu_visibility),
    ('News', '/news', 'footer'::menu_type, 7, true, 'public'::menu_visibility),
    ('About', '/about', 'footer'::menu_type, 8, true, 'public'::menu_visibility),
    ('Contact', '/contact', 'footer'::menu_type, 9, true, 'public'::menu_visibility),
    ('Privacy', '/privacy', 'footer'::menu_type, 10, true, 'public'::menu_visibility),
    ('Terms', '/terms', 'footer'::menu_type, 11, true, 'public'::menu_visibility);

-- ============================================
-- MOBILE MENU (mirrors main menu)
-- ============================================

-- Mobile Community (Parent)
INSERT INTO public.menu_items (id, title, url, description, menu_type, sort_order, is_enabled, visibility)
VALUES 
    ('a2000000-0000-0000-0000-000000000001', 'Community', '/community', 'Connect with the tech community', 'mobile'::menu_type, 1, true, 'public'::menu_visibility);

INSERT INTO public.menu_items (title, url, description, menu_type, parent_id, sort_order, is_enabled, visibility)
VALUES 
    ('Events', '/events', 'Workshops, meetups, and tech talks', 'mobile'::menu_type, 'a2000000-0000-0000-0000-000000000001', 1, true, 'public'::menu_visibility),
    ('Directory', '/directory', 'Connect with tech professionals', 'mobile'::menu_type, 'a2000000-0000-0000-0000-000000000001', 2, true, 'public'::menu_visibility),
    ('Groups', '/groups', 'Join communities of interest', 'mobile'::menu_type, 'a2000000-0000-0000-0000-000000000001', 3, true, 'public'::menu_visibility),
    ('News', '/news', 'Latest tech news and articles', 'mobile'::menu_type, 'a2000000-0000-0000-0000-000000000001', 4, true, 'public'::menu_visibility),
    ('Galleries', '/galleries', 'Browse community photo galleries', 'mobile'::menu_type, 'a2000000-0000-0000-0000-000000000001', 5, true, 'public'::menu_visibility);

-- Mobile Business (Parent)
INSERT INTO public.menu_items (id, title, url, description, menu_type, sort_order, is_enabled, visibility)
VALUES 
    ('a2000000-0000-0000-0000-000000000002', 'Business', '/business', 'Business and opportunities', 'mobile'::menu_type, 2, true, 'public'::menu_visibility);

INSERT INTO public.menu_items (title, url, description, menu_type, parent_id, sort_order, is_enabled, visibility)
VALUES 
    ('Companies', '/companies', 'Explore local tech companies', 'mobile'::menu_type, 'a2000000-0000-0000-0000-000000000002', 1, true, 'public'::menu_visibility),
    ('Opportunities', '/opportunities', 'Find jobs and volunteer roles', 'mobile'::menu_type, 'a2000000-0000-0000-0000-000000000002', 2, true, 'public'::menu_visibility),
    ('Marketplace', '/marketplace', 'Buy and sell tech items', 'mobile'::menu_type, 'a2000000-0000-0000-0000-000000000002', 3, true, 'public'::menu_visibility);

INSERT INTO public.menu_items (title, url, description, menu_type, sort_order, is_enabled, visibility)
VALUES 
    ('Resources', '/resources', 'Educational content and guides', 'mobile'::menu_type, 3, true, 'public'::menu_visibility),
    ('Topics', '/topics', 'Browse content by topic', 'mobile'::menu_type, 4, true, 'public'::menu_visibility);

-- Mobile About (Parent)
INSERT INTO public.menu_items (id, title, url, description, menu_type, sort_order, is_enabled, visibility)
VALUES 
    ('a2000000-0000-0000-0000-000000000003', 'About', '/about', 'About us', 'mobile'::menu_type, 5, true, 'public'::menu_visibility);

INSERT INTO public.menu_items (title, url, description, menu_type, parent_id, sort_order, is_enabled, visibility)
VALUES 
    ('About Us', '/about', 'Learn about our mission', 'mobile'::menu_type, 'a2000000-0000-0000-0000-000000000003', 1, true, 'public'::menu_visibility),
    ('About Uluntu', '/about-uluntu', 'Learn about the Uluntu platform', 'mobile'::menu_type, 'a2000000-0000-0000-0000-000000000003', 2, true, 'public'::menu_visibility),
    ('Partners', '/partners', 'Our community partners and sponsors', 'mobile'::menu_type, 'a2000000-0000-0000-0000-000000000003', 3, true, 'public'::menu_visibility),
    ('Contact', '/contact', 'Get in touch with us', 'mobile'::menu_type, 'a2000000-0000-0000-0000-000000000003', 4, true, 'public'::menu_visibility),
    ('Privacy', '/privacy', 'Privacy policy and data protection', 'mobile'::menu_type, 'a2000000-0000-0000-0000-000000000003', 5, true, 'public'::menu_visibility),
    ('Terms', '/terms', 'Terms of service and guidelines', 'mobile'::menu_type, 'a2000000-0000-0000-0000-000000000003', 6, true, 'public'::menu_visibility);

-- ============================================
-- ADMIN MENU
-- ============================================

INSERT INTO public.menu_items (title, url, description, menu_type, sort_order, is_enabled, visibility)
VALUES 
    ('Dashboard', '/admin', 'Admin dashboard', 'admin'::menu_type, 1, true, 'admin'::menu_visibility),
    ('Users', '/admin/users', 'Manage users', 'admin'::menu_type, 2, true, 'admin'::menu_visibility),
    ('Content', '/admin/content', 'Manage content', 'admin'::menu_type, 3, true, 'admin'::menu_visibility),
    ('Settings', '/admin/settings', 'System settings', 'admin'::menu_type, 4, true, 'admin'::menu_visibility),
    ('Menu Management', '/admin/menu-management', 'Manage navigation menus', 'admin'::menu_type, 5, true, 'admin'::menu_visibility),
    ('Features', '/admin/features', 'Feature flags', 'admin'::menu_type, 6, true, 'admin'::menu_visibility),
    ('Audit Logs', '/admin/audit', 'View system audit logs', 'admin'::menu_type, 7, true, 'admin'::menu_visibility);

-- ============================================
-- VERIFY IMPORT
-- ============================================

-- Show menu counts by type
SELECT 
    menu_type,
    COUNT(*) as item_count,
    COUNT(DISTINCT parent_id) as parent_count
FROM public.menu_items
GROUP BY menu_type
ORDER BY menu_type;

-- Show hierarchical structure for main menu
WITH RECURSIVE menu_tree AS (
    SELECT 
        id, 
        title, 
        url, 
        parent_id, 
        sort_order,
        0 as level,
        CAST(title as VARCHAR(500)) as path
    FROM public.menu_items
    WHERE menu_type = 'main'::menu_type AND parent_id IS NULL
    
    UNION ALL
    
    SELECT 
        mi.id, 
        mi.title, 
        mi.url, 
        mi.parent_id, 
        mi.sort_order,
        mt.level + 1,
        CAST(mt.path || ' > ' || mi.title as VARCHAR(500))
    FROM public.menu_items mi
    JOIN menu_tree mt ON mi.parent_id = mt.id
    WHERE mi.menu_type = 'main'::menu_type
)
SELECT 
    REPEAT('  ', level) || title as menu_structure,
    url,
    sort_order
FROM menu_tree
ORDER BY 
    CASE WHEN parent_id IS NULL THEN sort_order ELSE 999 END,
    path;

-- Show all menu items with their types
SELECT 
    menu_type,
    title,
    url,
    visibility,
    is_enabled
FROM public.menu_items
ORDER BY menu_type, sort_order;