-- ================================================================
-- Update Home Page with Carousel Hero Component
-- ================================================================

-- Temporarily disable RLS to update home page
ALTER TABLE public.pages DISABLE ROW LEVEL SECURITY;

-- Update home page with carousel hero and enhanced content
UPDATE public.pages 
SET blocks = '[
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
version = version + 1,
updated_at = NOW()
WHERE slug = 'home';

-- Create a version history entry for this update
INSERT INTO public.page_versions (
  page_id,
  version_number,
  content,
  change_summary,
  created_by,
  is_published
)
SELECT 
  id,
  version,
  blocks,
  'Added carousel hero component with sample images and enhanced content structure',
  (SELECT id FROM auth.users LIMIT 1), -- Use first available user
  true
FROM public.pages 
WHERE slug = 'home';

-- Re-enable RLS
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;

-- Show the updated home page
SELECT 
  title,
  slug,
  version,
  jsonb_array_length(blocks) as block_count,
  is_system,
  status
FROM public.pages 
WHERE slug = 'home';