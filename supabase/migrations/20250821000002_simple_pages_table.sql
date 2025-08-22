-- ================================================================
-- SIMPLE PAGES TABLE FOR BLOCK EDITOR
-- ================================================================
-- This creates a basic pages table that works with the block editor
-- ================================================================

BEGIN;

-- Create pages table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  content TEXT,
  blocks JSONB DEFAULT '[]',
  page_type VARCHAR(50) DEFAULT 'block',
  author_id UUID REFERENCES public.members(id) ON DELETE SET NULL,
  status VARCHAR(20) DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
  is_system BOOLEAN DEFAULT FALSE,
  is_editable BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  meta_title VARCHAR(255),
  meta_description TEXT,
  seo_keywords TEXT[],
  og_image TEXT,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add columns if table already exists
DO $$ 
BEGIN
  -- Add blocks column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'pages' 
                 AND column_name = 'blocks') THEN
    ALTER TABLE public.pages ADD COLUMN blocks JSONB DEFAULT '[]';
  END IF;
  
  -- Add page_type column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'pages' 
                 AND column_name = 'page_type') THEN
    ALTER TABLE public.pages ADD COLUMN page_type VARCHAR(50) DEFAULT 'block';
  END IF;
  
  -- Add is_system column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'pages' 
                 AND column_name = 'is_system') THEN
    ALTER TABLE public.pages ADD COLUMN is_system BOOLEAN DEFAULT FALSE;
  END IF;
  
  -- Add is_editable column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'pages' 
                 AND column_name = 'is_editable') THEN
    ALTER TABLE public.pages ADD COLUMN is_editable BOOLEAN DEFAULT TRUE;
  END IF;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_pages_slug ON public.pages(slug);
CREATE INDEX IF NOT EXISTS idx_pages_status ON public.pages(status);
CREATE INDEX IF NOT EXISTS idx_pages_author_id ON public.pages(author_id);
CREATE INDEX IF NOT EXISTS idx_pages_is_featured ON public.pages(is_featured);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_pages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS pages_updated_at_trigger ON public.pages;
CREATE TRIGGER pages_updated_at_trigger
  BEFORE UPDATE ON public.pages
  FOR EACH ROW
  EXECUTE FUNCTION update_pages_updated_at();

-- Enable Row Level Security
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Public can read published pages" ON public.pages;
DROP POLICY IF EXISTS "Authors can view their own pages" ON public.pages;
DROP POLICY IF EXISTS "Authors can create pages" ON public.pages;
DROP POLICY IF EXISTS "Authors can update their own pages" ON public.pages;
DROP POLICY IF EXISTS "Authors can delete their own pages" ON public.pages;
DROP POLICY IF EXISTS "Admins can view all pages" ON public.pages;
DROP POLICY IF EXISTS "Admins can update any page" ON public.pages;
DROP POLICY IF EXISTS "Admins can delete any page" ON public.pages;

-- Create new policies
CREATE POLICY "Public can read published pages" ON public.pages
  FOR SELECT USING (status = 'published');

CREATE POLICY "Authenticated users can create pages" ON public.pages
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update own pages" ON public.pages
  FOR UPDATE USING (
    auth.uid() IS NOT NULL AND (
      author_id IN (SELECT id FROM public.members WHERE user_id = auth.uid())
      OR EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = auth.uid() 
        AND role IN ('admin', 'superadmin')
      )
    )
  );

CREATE POLICY "Users can delete own pages" ON public.pages
  FOR DELETE USING (
    auth.uid() IS NOT NULL AND (
      author_id IN (SELECT id FROM public.members WHERE user_id = auth.uid())
      OR EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = auth.uid() 
        AND role IN ('admin', 'superadmin')
      )
    )
  );

CREATE POLICY "Authenticated users can view all pages" ON public.pages
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Insert sample pages
INSERT INTO public.pages (title, slug, blocks, page_type, status, is_system, is_featured, published_at)
VALUES 
  (
    'Welcome',
    'welcome',
    '[{"type": "heading", "content": "Welcome to Our Site"}, {"type": "paragraph", "content": "This is a sample page created with the block editor."}]'::jsonb,
    'block',
    'published',
    TRUE,
    TRUE,
    NOW()
  ),
  (
    'About',
    'about',
    '[{"type": "heading", "content": "About Us"}, {"type": "paragraph", "content": "Learn more about our organization and mission."}]'::jsonb,
    'block',
    'published',
    TRUE,
    FALSE,
    NOW()
  )
ON CONFLICT (slug) DO UPDATE SET
  blocks = EXCLUDED.blocks,
  updated_at = NOW();

COMMIT;

-- Grant necessary permissions
GRANT ALL ON public.pages TO authenticated;
GRANT SELECT ON public.pages TO anon;