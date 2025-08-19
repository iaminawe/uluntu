-- Create dynamic menu system tables
-- This migration creates tables to manage dynamic navigation menus

-- Menu locations enum (where menus can be placed)
CREATE TYPE menu_location AS ENUM ('header', 'footer', 'sidebar', 'mobile');

-- Menu positions table for menu items
CREATE TABLE IF NOT EXISTS menu_positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  location menu_location NOT NULL,
  max_depth INTEGER DEFAULT 3, -- Maximum nesting level
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Menu items table
CREATE TABLE IF NOT EXISTS menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  position_id UUID NOT NULL REFERENCES menu_positions(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  url TEXT,
  target TEXT DEFAULT '_self', -- _self, _blank, etc.
  icon TEXT, -- Icon name or class
  description TEXT,
  feature_flag TEXT, -- Optional feature flag requirement
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  css_classes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure no circular references
  CONSTRAINT no_self_reference CHECK (id != parent_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_menu_items_position_id ON menu_items(position_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_parent_id ON menu_items(parent_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_sort_order ON menu_items(sort_order);
CREATE INDEX IF NOT EXISTS idx_menu_items_active ON menu_items(is_active);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_menu_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for timestamp updates
CREATE TRIGGER update_menu_positions_timestamp
  BEFORE UPDATE ON menu_positions
  FOR EACH ROW EXECUTE FUNCTION update_menu_timestamp();

CREATE TRIGGER update_menu_items_timestamp
  BEFORE UPDATE ON menu_items
  FOR EACH ROW EXECUTE FUNCTION update_menu_timestamp();

-- Insert default menu positions
INSERT INTO menu_positions (name, description, location, max_depth) VALUES
('main_header', 'Main header navigation', 'header', 2),
('footer_links', 'Footer navigation links', 'footer', 1),
('mobile_menu', 'Mobile navigation menu', 'mobile', 2)
ON CONFLICT (name) DO NOTHING;

-- Function to get menu hierarchy for a position
CREATE OR REPLACE FUNCTION get_menu_hierarchy(position_name TEXT)
RETURNS TABLE (
  id UUID,
  parent_id UUID,
  title TEXT,
  url TEXT,
  target TEXT,
  icon TEXT,
  description TEXT,
  feature_flag TEXT,
  sort_order INTEGER,
  level INTEGER,
  path UUID[]
) AS $$
WITH RECURSIVE menu_tree AS (
  -- Base case: root menu items
  SELECT 
    mi.id,
    mi.parent_id,
    mi.title,
    mi.url,
    mi.target,
    mi.icon,
    mi.description,
    mi.feature_flag,
    mi.sort_order,
    0 as level,
    ARRAY[mi.id] as path
  FROM menu_items mi
  JOIN menu_positions mp ON mi.position_id = mp.id
  WHERE mp.name = position_name 
    AND mi.parent_id IS NULL 
    AND mi.is_active = TRUE
  
  UNION ALL
  
  -- Recursive case: child menu items
  SELECT 
    mi.id,
    mi.parent_id,
    mi.title,
    mi.url,
    mi.target,
    mi.icon,
    mi.description,
    mi.feature_flag,
    mi.sort_order,
    mt.level + 1,
    mt.path || mi.id
  FROM menu_items mi
  JOIN menu_tree mt ON mi.parent_id = mt.id
  WHERE mi.is_active = TRUE
    AND NOT (mi.id = ANY(mt.path)) -- Prevent infinite loops
    AND mt.level < 10 -- Safety limit
)
SELECT * FROM menu_tree 
ORDER BY level, sort_order, title;
$$ LANGUAGE sql STABLE;

-- RLS Policies
ALTER TABLE menu_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read menu data
CREATE POLICY "Allow public read access to menu positions" ON menu_positions 
  FOR SELECT USING (true);

CREATE POLICY "Allow public read access to active menu items" ON menu_items 
  FOR SELECT USING (is_active = true);

-- Only admins can modify menu data
CREATE POLICY "Allow admin full access to menu positions" ON menu_positions 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
      AND r.name = 'admin'
    )
  );

CREATE POLICY "Allow admin full access to menu items" ON menu_items 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
      AND r.name = 'admin'
    )
  );

-- Grant permissions
GRANT SELECT ON menu_positions TO authenticated, anon;
GRANT SELECT ON menu_items TO authenticated, anon;
GRANT ALL ON menu_positions TO service_role;
GRANT ALL ON menu_items TO service_role;

-- Insert default header menu structure
DO $$
DECLARE
  header_position_id UUID;
  footer_position_id UUID;
  community_id UUID;
  business_id UUID;
  about_id UUID;
BEGIN
  -- Get position IDs
  SELECT id INTO header_position_id FROM menu_positions WHERE name = 'main_header';
  SELECT id INTO footer_position_id FROM menu_positions WHERE name = 'footer_links';
  
  -- Insert main header menu items
  INSERT INTO menu_items (position_id, title, url, description, feature_flag, sort_order) VALUES
  (header_position_id, 'Community', '/community', 'Community features and connections', null, 10),
  (header_position_id, 'Business', '/business', 'Business directory and opportunities', null, 20),
  (header_position_id, 'Resources', '/resources', 'Educational content and guides', 'resources_library', 30),
  (header_position_id, 'Topics', '/topics', 'Browse content by topic', null, 40),
  (header_position_id, 'About', '/about', 'Learn about us', null, 50)
  RETURNING id INTO community_id; -- Get the first inserted ID
  
  -- Get the actual IDs for the menu items we just inserted
  SELECT id INTO community_id FROM menu_items WHERE position_id = header_position_id AND title = 'Community';
  SELECT id INTO business_id FROM menu_items WHERE position_id = header_position_id AND title = 'Business';
  SELECT id INTO about_id FROM menu_items WHERE position_id = header_position_id AND title = 'About';
  
  -- Insert Community submenu items
  INSERT INTO menu_items (position_id, parent_id, title, url, description, feature_flag, sort_order) VALUES
  (header_position_id, community_id, 'Events', '/events', 'Workshops, meetups, and tech talks', 'events_system', 10),
  (header_position_id, community_id, 'Directory', '/directory', 'Connect with tech professionals', 'members_directory', 20),
  (header_position_id, community_id, 'Groups', '/groups', 'Join communities of interest', 'groups_communities', 30),
  (header_position_id, community_id, 'News', '/news', 'Latest tech news and articles', 'news_blog', 40),
  (header_position_id, community_id, 'Galleries', '/galleries', 'Browse community photo galleries', 'photo_galleries', 50);
  
  -- Insert Business submenu items
  INSERT INTO menu_items (position_id, parent_id, title, url, description, feature_flag, sort_order) VALUES
  (header_position_id, business_id, 'Companies', '/companies', 'Explore local tech companies', 'companies_listing', 10),
  (header_position_id, business_id, 'Opportunities', '/opportunities', 'Find jobs and volunteer roles', 'opportunities_board', 20),
  (header_position_id, business_id, 'Marketplace', '/marketplace', 'Buy and sell tech items', 'marketplace', 30);
  
  -- Insert About submenu items
  INSERT INTO menu_items (position_id, parent_id, title, url, description, feature_flag, sort_order) VALUES
  (header_position_id, about_id, 'About Us', '/about', 'Learn about our mission', null, 10),
  (header_position_id, about_id, 'About Uluntu', '/about-uluntu', 'Learn about the Uluntu platform', null, 20),
  (header_position_id, about_id, 'Partners', '/partners', 'Our community partners and sponsors', null, 30),
  (header_position_id, about_id, 'Contact', '/contact', 'Get in touch with us', null, 40),
  (header_position_id, about_id, 'Privacy', '/privacy', 'Privacy policy and data protection', null, 50),
  (header_position_id, about_id, 'Terms', '/terms', 'Terms of service and guidelines', null, 60);
  
  -- Insert footer menu items
  INSERT INTO menu_items (position_id, title, url, sort_order) VALUES
  (footer_position_id, 'Community', '/community', 10),
  (footer_position_id, 'Directory', '/directory', 20),
  (footer_position_id, 'Companies', '/companies', 30),
  (footer_position_id, 'Groups', '/groups', 40),
  (footer_position_id, 'Resources', '/resources', 50),
  (footer_position_id, 'Events', '/events', 60),
  (footer_position_id, 'News', '/news', 70),
  (footer_position_id, 'Marketplace', '/marketplace', 80),
  (footer_position_id, 'Opportunities', '/opportunities', 90);
  
END $$;

-- Create view for easier menu querying
CREATE OR REPLACE VIEW menu_hierarchy_view AS
SELECT 
  mp.name as position_name,
  mp.location,
  mi.id,
  mi.parent_id,
  mi.title,
  mi.url,
  mi.target,
  mi.icon,
  mi.description,
  mi.feature_flag,
  mi.sort_order,
  mi.css_classes,
  CASE 
    WHEN mi.parent_id IS NULL THEN 0
    ELSE 1
  END as level
FROM menu_positions mp
JOIN menu_items mi ON mp.id = mi.position_id
WHERE mi.is_active = true
ORDER BY mp.name, mi.sort_order, mi.title;

-- Grant access to the view
GRANT SELECT ON menu_hierarchy_view TO authenticated, anon, service_role;