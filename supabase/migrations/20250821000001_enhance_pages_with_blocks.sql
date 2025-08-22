-- ================================================================
-- ENHANCE PAGES SYSTEM WITH BLOCK-BASED CONTENT
-- ================================================================
-- This migration enhances the existing pages system to support
-- block-based editing with BlockNote, visual builders, and versioning
-- ================================================================

BEGIN;

-- ================================================================
-- PART 1: ENHANCE PAGES TABLE
-- ================================================================

-- Add new columns to pages table for enhanced content management
ALTER TABLE public.pages 
  ADD COLUMN IF NOT EXISTS page_type VARCHAR(50) DEFAULT 'block' CHECK (page_type IN ('static', 'block', 'visual', 'hybrid')),
  ADD COLUMN IF NOT EXISTS components JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS blocks JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS layout_config JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES public.pages(id),
  ADD COLUMN IF NOT EXISTS template_id VARCHAR(100),
  ADD COLUMN IF NOT EXISTS is_system BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS is_editable BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS seo_keywords TEXT[],
  ADD COLUMN IF NOT EXISTS og_image TEXT,
  ADD COLUMN IF NOT EXISTS canonical_url TEXT,
  ADD COLUMN IF NOT EXISTS custom_css TEXT,
  ADD COLUMN IF NOT EXISTS custom_js TEXT,
  ADD COLUMN IF NOT EXISTS last_edited_by UUID REFERENCES public.members(id),
  ADD COLUMN IF NOT EXISTS last_edited_at TIMESTAMPTZ;

-- Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_pages_page_type ON public.pages(page_type);
CREATE INDEX IF NOT EXISTS idx_pages_parent_id ON public.pages(parent_id);
CREATE INDEX IF NOT EXISTS idx_pages_template_id ON public.pages(template_id);
CREATE INDEX IF NOT EXISTS idx_pages_is_system ON public.pages(is_system);
CREATE INDEX IF NOT EXISTS idx_pages_version ON public.pages(version);

-- ================================================================
-- PART 2: CREATE CONTENT BLOCKS TABLE
-- ================================================================

CREATE TABLE IF NOT EXISTS public.content_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE,
  type VARCHAR(50) NOT NULL CHECK (type IN ('hero', 'feature', 'cta', 'text', 'image', 'video', 'gallery', 'form', 'custom')),
  category VARCHAR(100),
  content JSONB NOT NULL DEFAULT '{}',
  props JSONB DEFAULT '{}',
  styles JSONB DEFAULT '{}',
  is_global BOOLEAN DEFAULT FALSE,
  is_published BOOLEAN DEFAULT TRUE,
  usage_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES public.members(id),
  updated_by UUID REFERENCES public.members(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for content blocks
CREATE INDEX idx_content_blocks_type ON public.content_blocks(type);
CREATE INDEX idx_content_blocks_category ON public.content_blocks(category);
CREATE INDEX idx_content_blocks_is_global ON public.content_blocks(is_global);
CREATE INDEX idx_content_blocks_slug ON public.content_blocks(slug);

-- ================================================================
-- PART 3: CREATE PAGE VERSIONS TABLE
-- ================================================================

CREATE TABLE IF NOT EXISTS public.page_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID NOT NULL REFERENCES public.pages(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  title VARCHAR(255),
  content TEXT,
  blocks JSONB,
  components JSONB,
  layout_config JSONB,
  meta_data JSONB,
  change_summary TEXT,
  is_published BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMPTZ,
  created_by UUID REFERENCES public.members(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(page_id, version)
);

-- Create indexes for page versions
CREATE INDEX idx_page_versions_page_id ON public.page_versions(page_id);
CREATE INDEX idx_page_versions_version ON public.page_versions(version);
CREATE INDEX idx_page_versions_created_at ON public.page_versions(created_at);
CREATE INDEX idx_page_versions_is_published ON public.page_versions(is_published);

-- ================================================================
-- PART 4: CREATE PAGE TEMPLATES TABLE
-- ================================================================

CREATE TABLE IF NOT EXISTS public.page_templates (
  id VARCHAR(100) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  thumbnail_url TEXT,
  blocks JSONB DEFAULT '[]',
  components JSONB DEFAULT '{}',
  layout_config JSONB DEFAULT '{}',
  default_content JSONB,
  is_active BOOLEAN DEFAULT TRUE,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for page templates
CREATE INDEX idx_page_templates_category ON public.page_templates(category);
CREATE INDEX idx_page_templates_is_active ON public.page_templates(is_active);

-- ================================================================
-- PART 5: CREATE BLOCK USAGE TRACKING TABLE
-- ================================================================

CREATE TABLE IF NOT EXISTS public.block_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  block_id UUID REFERENCES public.content_blocks(id) ON DELETE CASCADE,
  page_id UUID REFERENCES public.pages(id) ON DELETE CASCADE,
  position INTEGER,
  config JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(block_id, page_id, position)
);

-- Create indexes for block usage
CREATE INDEX idx_block_usage_block_id ON public.block_usage(block_id);
CREATE INDEX idx_block_usage_page_id ON public.block_usage(page_id);

-- ================================================================
-- PART 6: ROW LEVEL SECURITY
-- ================================================================

-- Enable RLS on new tables
ALTER TABLE public.content_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.block_usage ENABLE ROW LEVEL SECURITY;

-- Content Blocks Policies
CREATE POLICY "Public can read published blocks" ON public.content_blocks
  FOR SELECT USING (is_published = TRUE);

CREATE POLICY "Authenticated users can create blocks" ON public.content_blocks
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Block creators can update their blocks" ON public.content_blocks
  FOR UPDATE USING (auth.uid() = created_by OR EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'superadmin')
  ));

CREATE POLICY "Admins can manage all blocks" ON public.content_blocks
  FOR ALL USING (EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'superadmin')
  ));

-- Page Versions Policies
CREATE POLICY "Public can read published versions" ON public.page_versions
  FOR SELECT USING (is_published = TRUE);

CREATE POLICY "Page authors can view all versions" ON public.page_versions
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM pages WHERE id = page_id AND author_id = auth.uid()
  ));

CREATE POLICY "Admins can manage all versions" ON public.page_versions
  FOR ALL USING (EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'superadmin')
  ));

-- Page Templates Policies
CREATE POLICY "Public can read active templates" ON public.page_templates
  FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Admins can manage templates" ON public.page_templates
  FOR ALL USING (EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'superadmin')
  ));

-- Block Usage Policies
CREATE POLICY "Public can read block usage" ON public.block_usage
  FOR SELECT USING (TRUE);

CREATE POLICY "Admins can manage block usage" ON public.block_usage
  FOR ALL USING (EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'superadmin')
  ));

-- ================================================================
-- PART 7: HELPER FUNCTIONS
-- ================================================================

-- Function to create a new page version
CREATE OR REPLACE FUNCTION create_page_version(
  p_page_id UUID,
  p_change_summary TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_new_version INTEGER;
  v_version_id UUID;
BEGIN
  -- Get the next version number
  SELECT COALESCE(MAX(version), 0) + 1 INTO v_new_version
  FROM page_versions
  WHERE page_id = p_page_id;
  
  -- Create the version record
  INSERT INTO page_versions (
    page_id, version, title, content, blocks, components, 
    layout_config, meta_data, change_summary, created_by
  )
  SELECT 
    id, v_new_version, title, content, blocks, components,
    layout_config, 
    jsonb_build_object(
      'meta_title', meta_title,
      'meta_description', meta_description,
      'seo_keywords', seo_keywords,
      'og_image', og_image
    ),
    p_change_summary,
    last_edited_by
  FROM pages
  WHERE id = p_page_id
  RETURNING id INTO v_version_id;
  
  -- Update the page version number
  UPDATE pages SET version = v_new_version WHERE id = p_page_id;
  
  RETURN v_version_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to restore a page version
CREATE OR REPLACE FUNCTION restore_page_version(
  p_version_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
  v_page_id UUID;
  v_version_data RECORD;
BEGIN
  -- Get the version data
  SELECT * INTO v_version_data
  FROM page_versions
  WHERE id = p_version_id;
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Create a backup of current version
  PERFORM create_page_version(v_version_data.page_id, 'Backup before restore');
  
  -- Restore the version
  UPDATE pages SET
    title = v_version_data.title,
    content = v_version_data.content,
    blocks = v_version_data.blocks,
    components = v_version_data.components,
    layout_config = v_version_data.layout_config,
    meta_title = v_version_data.meta_data->>'meta_title',
    meta_description = v_version_data.meta_data->>'meta_description',
    seo_keywords = ARRAY(SELECT jsonb_array_elements_text(v_version_data.meta_data->'seo_keywords')),
    og_image = v_version_data.meta_data->>'og_image',
    last_edited_by = auth.uid(),
    last_edited_at = NOW()
  WHERE id = v_version_data.page_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================================
-- PART 8: INSERT DEFAULT TEMPLATES
-- ================================================================

INSERT INTO page_templates (id, name, description, category, blocks, layout_config) VALUES
('blank', 'Blank Page', 'Start with a completely blank page', 'basic', '[]', '{"layout": "full-width"}'),
('blog-post', 'Blog Post', 'Standard blog post layout with title, content, and metadata', 'content', 
  '[{"type": "heading", "props": {"level": 1}}, {"type": "paragraph"}, {"type": "image"}]',
  '{"layout": "content-width", "showSidebar": false}'),
('landing-page', 'Landing Page', 'Marketing landing page with hero, features, and CTA', 'marketing',
  '[{"type": "hero"}, {"type": "features"}, {"type": "cta"}]',
  '{"layout": "full-width", "heroStyle": "centered"}'),
('about-page', 'About Page', 'Company or organization about page', 'corporate',
  '[{"type": "hero"}, {"type": "text"}, {"type": "team"}, {"type": "values"}]',
  '{"layout": "full-width"}'),
('contact-page', 'Contact Page', 'Contact form with company information', 'corporate',
  '[{"type": "hero"}, {"type": "contact-info"}, {"type": "contact-form"}, {"type": "map"}]',
  '{"layout": "content-width"}')
ON CONFLICT (id) DO NOTHING;

-- ================================================================
-- PART 9: CREATE DEFAULT SYSTEM PAGES
-- ================================================================

-- Helper function to ensure system pages exist
CREATE OR REPLACE FUNCTION ensure_system_pages() RETURNS VOID AS $$
DECLARE
  v_admin_id UUID;
BEGIN
  -- Get admin user ID
  SELECT id INTO v_admin_id FROM members 
  WHERE email = 'admin@nelsontech.ca' OR id IN (
    SELECT user_id FROM user_roles WHERE role = 'superadmin'
  ) LIMIT 1;
  
  IF v_admin_id IS NULL THEN
    -- Get any admin as fallback
    SELECT user_id INTO v_admin_id FROM user_roles 
    WHERE role IN ('admin', 'superadmin') LIMIT 1;
  END IF;
  
  IF v_admin_id IS NOT NULL THEN
    -- Create/update system pages
    INSERT INTO pages (
      slug, title, page_type, is_system, is_editable, 
      author_id, status, template_id, blocks
    ) VALUES
    ('home', 'Home', 'visual', TRUE, TRUE, v_admin_id, 'published', 'landing-page', '[]'),
    ('about', 'About Us', 'block', TRUE, TRUE, v_admin_id, 'published', 'about-page', '[]'),
    ('contact', 'Contact', 'block', TRUE, TRUE, v_admin_id, 'published', 'contact-page', '[]'),
    ('partners', 'Partners', 'block', TRUE, TRUE, v_admin_id, 'published', 'blank', '[]'),
    ('terms', 'Terms of Service', 'block', TRUE, TRUE, v_admin_id, 'published', 'blank', '[]'),
    ('privacy', 'Privacy Policy', 'block', TRUE, TRUE, v_admin_id, 'published', 'blank', '[]')
    ON CONFLICT (slug) DO UPDATE SET
      is_system = TRUE,
      is_editable = TRUE,
      template_id = EXCLUDED.template_id
    WHERE pages.is_system IS NOT TRUE;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Execute the function to create system pages
SELECT ensure_system_pages();

-- ================================================================
-- PART 10: MIGRATE EXISTING CONTENT FORMAT
-- ================================================================

-- Update existing pages to use new block format if they have Novel/TipTap content
UPDATE pages 
SET 
  page_type = 'block',
  blocks = CASE 
    WHEN content::text LIKE '{%' THEN content::jsonb
    ELSE jsonb_build_array(
      jsonb_build_object(
        'type', 'paragraph',
        'content', content
      )
    )
  END
WHERE page_type IS NULL;

COMMIT;

-- Add comment for documentation
COMMENT ON TABLE public.content_blocks IS 'Reusable content blocks for page builder system';
COMMENT ON TABLE public.page_versions IS 'Version history for pages with restore capability';
COMMENT ON TABLE public.page_templates IS 'Pre-built page templates for quick page creation';
COMMENT ON TABLE public.block_usage IS 'Tracks which blocks are used on which pages';