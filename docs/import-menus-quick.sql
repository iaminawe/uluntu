-- Quick SQL to import existing menu structure
-- Run this after the menu_items table has been created

-- Clear existing menu items to avoid duplicates
TRUNCATE TABLE public.menu_items CASCADE;

-- ============================================
-- MAIN/HEADER MENU
-- ============================================

-- Community (Parent)
INSERT INTO public.menu_items (id, title, url, description, menu_type, sort_order, is_enabled, visibility)
VALUES 
    ('a1000000-0000-0000-0000-000000000001', 'Community', '/community', 'Connect with the tech community', 'main', 1, true, 'public');

-- Community children
INSERT INTO public.menu_items (title, url, description, menu_type, parent_id, sort_order, is_enabled, visibility, feature_flag)
VALUES 
    ('Events', '/events', 'Workshops, meetups, and tech talks', 'main', 'a1000000-0000-0000-0000-000000000001', 1, true, 'public', 'events_system'),
    ('Directory', '/directory', 'Connect with tech professionals', 'main', 'a1000000-0000-0000-0000-000000000001', 2, true, 'public', 'members_directory'),
    ('Groups', '/groups', 'Join communities of interest', 'main', 'a1000000-0000-0000-0000-000000000001', 3, true, 'public', 'groups_communities'),
    ('News', '/news', 'Latest tech news and articles', 'main', 'a1000000-0000-0000-0000-000000000001', 4, true, 'public', 'news_blog'),
    ('Galleries', '/galleries', 'Browse community photo galleries', 'main', 'a1000000-0000-0000-0000-000000000001', 5, true, 'public', 'photo_galleries');

-- Business (Parent)
INSERT INTO public.menu_items (id, title, url, description, menu_type, sort_order, is_enabled, visibility)
VALUES 
    ('a1000000-0000-0000-0000-000000000002', 'Business', '/business', 'Business and opportunities', 'main', 2, true, 'public');

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
INSERT INTO public.menu_items (id, title, url, description, menu_type, sort_order, is_enabled, visibility)
VALUES 
    ('a1000000-0000-0000-0000-000000000003', 'About', '/about', 'About us', 'main', 5, true, 'public');

-- About children
INSERT INTO public.menu_items (title, url, description, menu_type, parent_id, sort_order, is_enabled, visibility)
VALUES 
    ('About Us', '/about', 'Learn about our mission', 'main', 'a1000000-0000-0000-0000-000000000003', 1, true, 'public'),
    ('About Uluntu', '/about-uluntu', 'Learn about the Uluntu platform', 'main', 'a1000000-0000-0000-0000-000000000003', 2, true, 'public'),
    ('Partners', '/partners', 'Our community partners and sponsors', 'main', 'a1000000-0000-0000-0000-000000000003', 3, true, 'public'),
    ('Contact', '/contact', 'Get in touch with us', 'main', 'a1000000-0000-0000-0000-000000000003', 4, true, 'public'),
    ('Privacy', '/privacy', 'Privacy policy and data protection', 'main', 'a1000000-0000-0000-0000-000000000003', 5, true, 'public'),
    ('Terms', '/terms', 'Terms of service and guidelines', 'main', 'a1000000-0000-0000-0000-000000000003', 6, true, 'public');

-- ============================================
-- FOOTER MENU
-- ============================================

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

-- ============================================
-- MOBILE MENU (mirrors main menu)
-- ============================================

-- Mobile Community (Parent)
INSERT INTO public.menu_items (id, title, url, description, menu_type, sort_order, is_enabled, visibility)
VALUES 
    ('a2000000-0000-0000-0000-000000000001', 'Community', '/community', 'Connect with the tech community', 'mobile', 1, true, 'public');

INSERT INTO public.menu_items (title, url, description, menu_type, parent_id, sort_order, is_enabled, visibility, feature_flag)
VALUES 
    ('Events', '/events', 'Workshops, meetups, and tech talks', 'mobile', 'a2000000-0000-0000-0000-000000000001', 1, true, 'public', 'events_system'),
    ('Directory', '/directory', 'Connect with tech professionals', 'mobile', 'a2000000-0000-0000-0000-000000000001', 2, true, 'public', 'members_directory'),
    ('Groups', '/groups', 'Join communities of interest', 'mobile', 'a2000000-0000-0000-0000-000000000001', 3, true, 'public', 'groups_communities'),
    ('News', '/news', 'Latest tech news and articles', 'mobile', 'a2000000-0000-0000-0000-000000000001', 4, true, 'public', 'news_blog'),
    ('Galleries', '/galleries', 'Browse community photo galleries', 'mobile', 'a2000000-0000-0000-0000-000000000001', 5, true, 'public', 'photo_galleries');

-- Mobile Business (Parent)
INSERT INTO public.menu_items (id, title, url, description, menu_type, sort_order, is_enabled, visibility)
VALUES 
    ('a2000000-0000-0000-0000-000000000002', 'Business', '/business', 'Business and opportunities', 'mobile', 2, true, 'public');

INSERT INTO public.menu_items (title, url, description, menu_type, parent_id, sort_order, is_enabled, visibility, feature_flag)
VALUES 
    ('Companies', '/companies', 'Explore local tech companies', 'mobile', 'a2000000-0000-0000-0000-000000000002', 1, true, 'public', 'companies_listing'),
    ('Opportunities', '/opportunities', 'Find jobs and volunteer roles', 'mobile', 'a2000000-0000-0000-0000-000000000002', 2, true, 'public', 'opportunities_board'),
    ('Marketplace', '/marketplace', 'Buy and sell tech items', 'mobile', 'a2000000-0000-0000-0000-000000000002', 3, true, 'public', 'marketplace');

INSERT INTO public.menu_items (title, url, description, menu_type, sort_order, is_enabled, visibility, feature_flag)
VALUES 
    ('Resources', '/resources', 'Educational content and guides', 'mobile', 3, true, 'public', 'resources_library'),
    ('Topics', '/topics', 'Browse content by topic', 'mobile', 4, true, 'public');

-- Mobile About (Parent)
INSERT INTO public.menu_items (id, title, url, description, menu_type, sort_order, is_enabled, visibility)
VALUES 
    ('a2000000-0000-0000-0000-000000000003', 'About', '/about', 'About us', 'mobile', 5, true, 'public');

INSERT INTO public.menu_items (title, url, description, menu_type, parent_id, sort_order, is_enabled, visibility)
VALUES 
    ('About Us', '/about', 'Learn about our mission', 'mobile', 'a2000000-0000-0000-0000-000000000003', 1, true, 'public'),
    ('About Uluntu', '/about-uluntu', 'Learn about the Uluntu platform', 'mobile', 'a2000000-0000-0000-0000-000000000003', 2, true, 'public'),
    ('Partners', '/partners', 'Our community partners and sponsors', 'mobile', 'a2000000-0000-0000-0000-000000000003', 3, true, 'public'),
    ('Contact', '/contact', 'Get in touch with us', 'mobile', 'a2000000-0000-0000-0000-000000000003', 4, true, 'public'),
    ('Privacy', '/privacy', 'Privacy policy and data protection', 'mobile', 'a2000000-0000-0000-0000-000000000003', 5, true, 'public'),
    ('Terms', '/terms', 'Terms of service and guidelines', 'mobile', 'a2000000-0000-0000-0000-000000000003', 6, true, 'public');

-- ============================================
-- ADMIN MENU
-- ============================================

INSERT INTO public.menu_items (title, url, description, menu_type, sort_order, is_enabled, visibility)
VALUES 
    ('Dashboard', '/admin', 'Admin dashboard', 'admin', 1, true, 'admin'),
    ('Users', '/admin/users', 'Manage users', 'admin', 2, true, 'admin'),
    ('Content', '/admin/content', 'Manage content', 'admin', 3, true, 'admin'),
    ('Settings', '/admin/settings', 'System settings', 'admin', 4, true, 'admin'),
    ('Menu Management', '/admin/menu-management', 'Manage navigation menus', 'admin', 5, true, 'admin'),
    ('Features', '/admin/features', 'Feature flags', 'admin', 6, true, 'admin'),
    ('Audit Logs', '/admin/audit', 'View system audit logs', 'admin', 7, true, 'admin');

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
    WHERE menu_type = 'main' AND parent_id IS NULL
    
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
    WHERE mi.menu_type = 'main'
)
SELECT 
    REPEAT('  ', level) || title as menu_structure,
    url,
    sort_order
FROM menu_tree
ORDER BY 
    CASE WHEN parent_id IS NULL THEN sort_order ELSE 999 END,
    path;