-- Temporarily disable RLS on pages table for testing
-- WARNING: Only run this in development!

-- Disable RLS
ALTER TABLE public.pages DISABLE ROW LEVEL SECURITY;

-- Insert test pages
INSERT INTO public.pages (
  title, 
  slug, 
  blocks, 
  page_type, 
  status, 
  is_featured,
  meta_title,
  meta_description,
  published_at
) VALUES 
(
  'Welcome to Nelson Tech Community',
  'welcome-test',
  '[
    {"type": "heading", "content": "Welcome to Our Community Platform"},
    {"type": "paragraph", "content": "This is a test of our new dynamic page system with block-based editing."},
    {"type": "heading", "content": "Key Features"},
    {"type": "bulletList", "content": "Block-based content editing"},
    {"type": "bulletList", "content": "Auto-save functionality"},
    {"type": "bulletList", "content": "Version history tracking"},
    {"type": "bulletList", "content": "SEO optimization"},
    {"type": "quote", "content": "Building the future of community collaboration!"},
    {"type": "paragraph", "content": "This page was created programmatically to test our new content management system."}
  ]'::jsonb,
  'block',
  'published',
  true,
  'Welcome to Nelson Tech Community',
  'Join our thriving tech community in Nelson. Connect, learn, and grow with fellow developers.',
  NOW()
),
(
  'About Nelson Tech',
  'about-dynamic',
  '[
    {"type": "heading", "content": "About Nelson Tech Community"},
    {"type": "paragraph", "content": "We are a vibrant community of developers, designers, and tech enthusiasts in Nelson, New Zealand."},
    {"type": "heading", "content": "Our Mission"},
    {"type": "paragraph", "content": "To foster innovation, collaboration, and growth in the Nelson tech ecosystem."},
    {"type": "heading", "content": "What We Do"},
    {"type": "bulletList", "content": "Host regular meetups and workshops"},
    {"type": "bulletList", "content": "Connect local tech professionals"},
    {"type": "bulletList", "content": "Support tech education and career development"},
    {"type": "bulletList", "content": "Promote Nelson as a tech hub"}
  ]'::jsonb,
  'block',
  'published',
  true,
  'About Nelson Tech Community',
  'Learn about Nelson Tech Community - fostering innovation and collaboration in Nelson''s tech ecosystem.',
  NOW()
)
ON CONFLICT (slug) DO UPDATE SET
  blocks = EXCLUDED.blocks,
  updated_at = NOW();

-- Re-enable RLS
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;

-- Show created pages
SELECT id, title, slug, status, is_featured, created_at 
FROM public.pages 
WHERE slug IN ('welcome-test', 'about-dynamic')
ORDER BY created_at DESC;