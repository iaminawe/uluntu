-- Quick setup script to create pages table and add carousel home page
-- This bypasses the complex migration dependencies

-- Create pages table
CREATE TABLE IF NOT EXISTS public.pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  blocks JSONB DEFAULT '[]'::jsonb,
  page_type TEXT DEFAULT 'block',
  status TEXT DEFAULT 'published',
  is_system BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  is_editable BOOLEAN DEFAULT TRUE,
  meta_title TEXT,
  meta_description TEXT,
  published_at TIMESTAMPTZ DEFAULT NOW(),
  version INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;

-- Create basic policies
DROP POLICY IF EXISTS "Public can read published pages" ON public.pages;
CREATE POLICY "Public can read published pages" ON public.pages
  FOR SELECT USING (status = 'published');

-- Insert home page with carousel
INSERT INTO public.pages (
  title, 
  slug, 
  blocks, 
  page_type, 
  status, 
  is_system, 
  is_featured, 
  is_editable,
  meta_title,
  meta_description,
  published_at,
  version
) VALUES (
  'Home',
  'home',
  '[
    {
      "id": "1",
      "type": "carousel",
      "content": "Welcome to Nelson Tech Community",
      "metadata": {
        "slides": [
          {
            "id": "1",
            "image": "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=1200&h=600&fit=crop&crop=center",
            "title": "Welcome to Nelson Tech Community",
            "subtitle": "Connect with the vibrant tech community in Nelson, New Zealand",
            "ctaText": "Join Our Community",
            "ctaLink": "/register",
            "overlayOpacity": 0.5
          },
          {
            "id": "2", 
            "image": "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=1200&h=600&fit=crop&crop=center",
            "title": "Discover Amazing Opportunities",
            "subtitle": "Find your next career move or business partnership in our thriving ecosystem",
            "ctaText": "Browse Companies",
            "ctaLink": "/companies",
            "overlayOpacity": 0.4
          },
          {
            "id": "3",
            "image": "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=1200&h=600&fit=crop&crop=center", 
            "title": "Learn and Grow Together",
            "subtitle": "Join workshops, meetups, and knowledge-sharing sessions with industry experts",
            "ctaText": "View Events",
            "ctaLink": "/events",
            "overlayOpacity": 0.3
          }
        ],
        "autoPlay": true,
        "showDots": true,
        "showArrows": true,
        "height": "600px"
      }
    },
    {
      "id": "2",
      "type": "features", 
      "content": "What Makes Nelson Tech Special",
      "metadata": {
        "style": "default"
      }
    },
    {
      "id": "3",
      "type": "stats",
      "content": "Our Growing Community",
      "metadata": {
        "style": "gradient"
      }
    },
    {
      "id": "4", 
      "type": "events",
      "content": "Upcoming Events",
      "metadata": {
        "style": "default"
      }
    },
    {
      "id": "5",
      "type": "companies",
      "content": "Featured Companies",
      "metadata": {
        "style": "minimal"
      }
    },
    {
      "id": "6",
      "type": "cta",
      "content": "Ready to Join Nelson Tech?",
      "metadata": {
        "description": "Connect with professionals, discover opportunities, and grow your career in New Zealand''s sunshine capital.",
        "style": "highlight"
      }
    }
  ]'::jsonb,
  'block',
  'published',
  true,
  true,
  true,
  'Nelson Tech Community - Connect, Learn, Grow',
  'Join Nelson''s thriving tech community. Connect with professionals, discover events, and grow your career in New Zealand''s sunshine capital.',
  NOW(),
  1
) ON CONFLICT (slug) DO UPDATE SET
  blocks = EXCLUDED.blocks,
  version = EXCLUDED.version,
  updated_at = NOW();

-- Show result
SELECT 
  title,
  slug,
  jsonb_array_length(blocks) as block_count,
  status,
  is_system
FROM public.pages 
WHERE slug = 'home';