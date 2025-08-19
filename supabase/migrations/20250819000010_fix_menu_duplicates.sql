-- Fix menu duplicates and populate with correct data

-- Temporarily disable audit triggers to avoid foreign key issues
DROP TRIGGER IF EXISTS audit_menu_items ON menu_items;
DROP TRIGGER IF EXISTS audit_menu_containers ON menu_containers;

-- Clear audit logs
TRUNCATE TABLE menu_audit_log;

-- Clear all menu items
DELETE FROM menu_items;

-- Clear and reset containers
DELETE FROM menu_containers;

-- Create the containers we need
INSERT INTO menu_containers (name, type, title, description, is_active) VALUES
    ('main-navigation', 'main', 'Main Navigation', 'Primary site navigation menu', true),
    ('footer-menu', 'footer', 'Footer Menu', 'Footer navigation links', true),
    ('mobile-menu', 'mobile', 'Mobile Menu', 'Mobile navigation menu', true),
    ('admin-menu', 'admin', 'Admin Menu', 'Administrative navigation menu', true);

-- Populate menu items
DO $$
DECLARE
    main_container_id UUID;
    footer_container_id UUID;
    community_id UUID;
    business_id UUID;
    about_id UUID;
BEGIN
    -- Get container IDs
    SELECT id INTO main_container_id FROM menu_containers WHERE name = 'main-navigation';
    SELECT id INTO footer_container_id FROM menu_containers WHERE name = 'footer-menu';
    
    -- Main Navigation Items
    
    -- Community dropdown parent
    INSERT INTO menu_items (menu_container_id, title, url, sort_order, is_enabled, is_visible, item_type, icon)
    VALUES (main_container_id, 'Community', NULL, 100, true, true, 'dropdown', 'users')
    RETURNING id INTO community_id;
    
    -- Community children
    INSERT INTO menu_items (menu_container_id, parent_id, title, url, description, sort_order, is_enabled, is_visible, item_type, icon, custom_properties) VALUES
    (main_container_id, community_id, 'Events', '/events', 'Workshops, meetups, and tech talks', 110, true, true, 'link', 'calendar', '{"feature": "events_system"}'),
    (main_container_id, community_id, 'Directory', '/directory', 'Connect with tech professionals', 120, true, true, 'link', 'users', '{"feature": "members_directory"}'),
    (main_container_id, community_id, 'Groups', '/groups', 'Join communities of interest', 130, true, true, 'link', 'user-group', '{"feature": "groups_communities"}'),
    (main_container_id, community_id, 'News', '/news', 'Latest tech news and articles', 140, true, true, 'link', 'newspaper', '{"feature": "news_blog"}'),
    (main_container_id, community_id, 'Galleries', '/galleries', 'Browse community photo galleries', 150, true, true, 'link', 'photo', '{"feature": "photo_galleries"}');
    
    -- Business dropdown parent
    INSERT INTO menu_items (menu_container_id, title, url, sort_order, is_enabled, is_visible, item_type, icon)
    VALUES (main_container_id, 'Business', NULL, 200, true, true, 'dropdown', 'briefcase')
    RETURNING id INTO business_id;
    
    -- Business children
    INSERT INTO menu_items (menu_container_id, parent_id, title, url, description, sort_order, is_enabled, is_visible, item_type, icon, custom_properties) VALUES
    (main_container_id, business_id, 'Companies', '/companies', 'Explore local tech companies', 210, true, true, 'link', 'building', '{"feature": "companies_listing"}'),
    (main_container_id, business_id, 'Opportunities', '/opportunities', 'Find jobs and volunteer roles', 220, true, true, 'link', 'briefcase', '{"feature": "opportunities_board"}'),
    (main_container_id, business_id, 'Marketplace', '/marketplace', 'Buy and sell tech items', 230, true, true, 'link', 'shopping-bag', '{"feature": "marketplace"}');
    
    -- Resources standalone
    INSERT INTO menu_items (menu_container_id, title, url, description, sort_order, is_enabled, is_visible, item_type, icon, custom_properties)
    VALUES (main_container_id, 'Resources', '/resources', 'Educational content and guides', 300, true, true, 'link', 'book-open', '{"feature": "resources_library"}');
    
    -- Topics standalone
    INSERT INTO menu_items (menu_container_id, title, url, description, sort_order, is_enabled, is_visible, item_type, icon)
    VALUES (main_container_id, 'Topics', '/topics', 'Browse content by topic', 400, true, true, 'link', 'tag');
    
    -- About dropdown parent
    INSERT INTO menu_items (menu_container_id, title, url, sort_order, is_enabled, is_visible, item_type, icon)
    VALUES (main_container_id, 'About', NULL, 500, true, true, 'dropdown', 'info')
    RETURNING id INTO about_id;
    
    -- About children
    INSERT INTO menu_items (menu_container_id, parent_id, title, url, description, sort_order, is_enabled, is_visible, item_type, icon) VALUES
    (main_container_id, about_id, 'About Us', '/about', 'Learn about our mission', 510, true, true, 'link', 'info'),
    (main_container_id, about_id, 'About Uluntu', '/about-uluntu', 'Learn about the Uluntu platform', 520, true, true, 'link', 'globe'),
    (main_container_id, about_id, 'Partners', '/partners', 'Our community partners and sponsors', 530, true, true, 'link', 'handshake'),
    (main_container_id, about_id, 'Contact', '/contact', 'Get in touch with us', 540, true, true, 'link', 'mail'),
    (main_container_id, about_id, 'Privacy', '/privacy', 'Privacy policy and data protection', 550, true, true, 'link', 'shield'),
    (main_container_id, about_id, 'Terms', '/terms', 'Terms of service and guidelines', 560, true, true, 'link', 'file-text');
    
    -- Footer Navigation Items (flat structure)
    INSERT INTO menu_items (menu_container_id, title, url, sort_order, is_enabled, is_visible, item_type) VALUES
    (footer_container_id, 'Community', '/community', 100, true, true, 'link'),
    (footer_container_id, 'Directory', '/directory', 200, true, true, 'link'),
    (footer_container_id, 'Companies', '/companies', 300, true, true, 'link'),
    (footer_container_id, 'Groups', '/groups', 400, true, true, 'link'),
    (footer_container_id, 'Resources', '/resources', 500, true, true, 'link'),
    (footer_container_id, 'Events', '/events', 600, true, true, 'link'),
    (footer_container_id, 'News', '/news', 700, true, true, 'link'),
    (footer_container_id, 'About', '/about', 800, true, true, 'link'),
    (footer_container_id, 'Contact', '/contact', 900, true, true, 'link'),
    (footer_container_id, 'Privacy', '/privacy', 1000, true, true, 'link'),
    (footer_container_id, 'Terms', '/terms', 1100, true, true, 'link');
    
    RAISE NOTICE 'Menu items populated successfully';
END $$;

-- Re-enable audit triggers
CREATE TRIGGER audit_menu_items
    AFTER INSERT OR UPDATE OR DELETE ON menu_items
    FOR EACH ROW EXECUTE FUNCTION audit_menu_items_changes();

CREATE TRIGGER audit_menu_containers
    AFTER INSERT OR UPDATE OR DELETE ON menu_containers
    FOR EACH ROW EXECUTE FUNCTION audit_menu_containers_changes();

-- Display final results
SELECT 
    mc.name as container,
    COUNT(mi.id) as item_count,
    COUNT(DISTINCT CASE WHEN mi.parent_id IS NULL THEN mi.id END) as top_level_items,
    COUNT(DISTINCT CASE WHEN mi.parent_id IS NOT NULL THEN mi.id END) as child_items
FROM menu_containers mc
LEFT JOIN menu_items mi ON mc.id = mi.menu_container_id
GROUP BY mc.id, mc.name
ORDER BY mc.name;