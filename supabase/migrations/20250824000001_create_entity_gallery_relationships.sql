-- =====================================================
-- CREATE ENTITY GALLERY RELATIONSHIPS
-- =====================================================
-- Creates relationship tables between galleries and all major entities
-- Supports multiple gallery types per entity and display positioning

BEGIN;

-- =====================================================
-- 1. EVENT GALLERIES RELATIONSHIP TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS event_galleries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  gallery_id UUID NOT NULL REFERENCES user_galleries(id) ON DELETE CASCADE,
  gallery_type VARCHAR(50) NOT NULL DEFAULT 'main' CHECK (gallery_type IN (
    'main', 'promotional', 'behind_scenes', 'highlights', 'sponsors', 'venue'
  )),
  display_order INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Constraints
  CONSTRAINT event_galleries_unique_featured UNIQUE (event_id, gallery_type) DEFERRABLE INITIALLY DEFERRED,
  CONSTRAINT event_galleries_display_order_check CHECK (display_order >= 0)
);

-- =====================================================
-- 2. NEWS GALLERIES RELATIONSHIP TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS news_galleries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  news_id UUID NOT NULL REFERENCES news(id) ON DELETE CASCADE,
  gallery_id UUID NOT NULL REFERENCES user_galleries(id) ON DELETE CASCADE,
  gallery_type VARCHAR(50) NOT NULL DEFAULT 'article' CHECK (gallery_type IN (
    'article', 'hero', 'inline', 'infographic', 'supporting'
  )),
  display_order INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Constraints
  CONSTRAINT news_galleries_unique_featured UNIQUE (news_id, gallery_type) DEFERRABLE INITIALLY DEFERRED,
  CONSTRAINT news_galleries_display_order_check CHECK (display_order >= 0)
);

-- =====================================================
-- 3. RESOURCES GALLERIES RELATIONSHIP TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS resource_galleries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
  gallery_id UUID NOT NULL REFERENCES user_galleries(id) ON DELETE CASCADE,
  gallery_type VARCHAR(50) NOT NULL DEFAULT 'screenshots' CHECK (gallery_type IN (
    'screenshots', 'diagrams', 'examples', 'documentation', 'tutorial'
  )),
  display_order INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Constraints
  CONSTRAINT resource_galleries_unique_featured UNIQUE (resource_id, gallery_type) DEFERRABLE INITIALLY DEFERRED,
  CONSTRAINT resource_galleries_display_order_check CHECK (display_order >= 0)
);

-- =====================================================
-- 4. PAGE GALLERIES RELATIONSHIP TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS page_galleries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  gallery_id UUID NOT NULL REFERENCES user_galleries(id) ON DELETE CASCADE,
  gallery_type VARCHAR(50) NOT NULL DEFAULT 'content' CHECK (gallery_type IN (
    'content', 'hero', 'carousel', 'banner', 'background', 'testimonials'
  )),
  display_position VARCHAR(50) DEFAULT 'content' CHECK (display_position IN (
    'header', 'content', 'sidebar', 'footer', 'hero', 'background'
  )),
  display_order INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Constraints
  CONSTRAINT page_galleries_unique_featured UNIQUE (page_id, gallery_type) DEFERRABLE INITIALLY DEFERRED,
  CONSTRAINT page_galleries_display_order_check CHECK (display_order >= 0)
);

-- =====================================================
-- 5. USER PROFILE GALLERIES RELATIONSHIP TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS user_profile_galleries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  gallery_id UUID NOT NULL REFERENCES user_galleries(id) ON DELETE CASCADE,
  gallery_type VARCHAR(50) NOT NULL DEFAULT 'portfolio' CHECK (gallery_type IN (
    'portfolio', 'personal', 'professional', 'projects', 'achievements'
  )),
  is_featured BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Constraints
  CONSTRAINT user_profile_galleries_unique_featured UNIQUE (user_id, gallery_type) DEFERRABLE INITIALLY DEFERRED,
  CONSTRAINT user_profile_galleries_display_order_check CHECK (display_order >= 0)
);

-- =====================================================
-- 6. MARKETPLACE GALLERIES RELATIONSHIP TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS marketplace_galleries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES marketplace_listings(id) ON DELETE CASCADE,
  gallery_id UUID NOT NULL REFERENCES user_galleries(id) ON DELETE CASCADE,
  gallery_type VARCHAR(50) NOT NULL DEFAULT 'product' CHECK (gallery_type IN (
    'product', 'detail', 'usage', 'packaging', 'comparison'
  )),
  display_order INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Constraints
  CONSTRAINT marketplace_galleries_unique_featured UNIQUE (listing_id, gallery_type) DEFERRABLE INITIALLY DEFERRED,
  CONSTRAINT marketplace_galleries_display_order_check CHECK (display_order >= 0)
);

-- =====================================================
-- CREATE INDEXES FOR PERFORMANCE
-- =====================================================

-- Event galleries indexes
CREATE INDEX idx_event_galleries_event_id ON event_galleries(event_id);
CREATE INDEX idx_event_galleries_gallery_id ON event_galleries(gallery_id);
CREATE INDEX idx_event_galleries_type ON event_galleries(gallery_type);
CREATE INDEX idx_event_galleries_featured ON event_galleries(is_featured) WHERE is_featured = true;
CREATE INDEX idx_event_galleries_display_order ON event_galleries(event_id, display_order);

-- News galleries indexes
CREATE INDEX idx_news_galleries_news_id ON news_galleries(news_id);
CREATE INDEX idx_news_galleries_gallery_id ON news_galleries(gallery_id);
CREATE INDEX idx_news_galleries_type ON news_galleries(gallery_type);
CREATE INDEX idx_news_galleries_featured ON news_galleries(is_featured) WHERE is_featured = true;
CREATE INDEX idx_news_galleries_display_order ON news_galleries(news_id, display_order);

-- Resource galleries indexes
CREATE INDEX idx_resource_galleries_resource_id ON resource_galleries(resource_id);
CREATE INDEX idx_resource_galleries_gallery_id ON resource_galleries(gallery_id);
CREATE INDEX idx_resource_galleries_type ON resource_galleries(gallery_type);
CREATE INDEX idx_resource_galleries_featured ON resource_galleries(is_featured) WHERE is_featured = true;
CREATE INDEX idx_resource_galleries_display_order ON resource_galleries(resource_id, display_order);

-- Page galleries indexes
CREATE INDEX idx_page_galleries_page_id ON page_galleries(page_id);
CREATE INDEX idx_page_galleries_gallery_id ON page_galleries(gallery_id);
CREATE INDEX idx_page_galleries_type ON page_galleries(gallery_type);
CREATE INDEX idx_page_galleries_position ON page_galleries(display_position);
CREATE INDEX idx_page_galleries_featured ON page_galleries(is_featured) WHERE is_featured = true;
CREATE INDEX idx_page_galleries_display_order ON page_galleries(page_id, display_order);

-- User profile galleries indexes
CREATE INDEX idx_user_profile_galleries_user_id ON user_profile_galleries(user_id);
CREATE INDEX idx_user_profile_galleries_gallery_id ON user_profile_galleries(gallery_id);
CREATE INDEX idx_user_profile_galleries_type ON user_profile_galleries(gallery_type);
CREATE INDEX idx_user_profile_galleries_featured ON user_profile_galleries(is_featured) WHERE is_featured = true;
CREATE INDEX idx_user_profile_galleries_display_order ON user_profile_galleries(user_id, display_order);

-- Marketplace galleries indexes
CREATE INDEX idx_marketplace_galleries_listing_id ON marketplace_galleries(listing_id);
CREATE INDEX idx_marketplace_galleries_gallery_id ON marketplace_galleries(gallery_id);
CREATE INDEX idx_marketplace_galleries_type ON marketplace_galleries(gallery_type);
CREATE INDEX idx_marketplace_galleries_featured ON marketplace_galleries(is_featured) WHERE is_featured = true;
CREATE INDEX idx_marketplace_galleries_display_order ON marketplace_galleries(listing_id, display_order);

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON TABLE event_galleries IS 'Links galleries to events with support for different gallery types and display ordering';
COMMENT ON TABLE news_galleries IS 'Links galleries to news articles with support for different gallery types';
COMMENT ON TABLE resource_galleries IS 'Links galleries to resources with support for different gallery types';
COMMENT ON TABLE page_galleries IS 'Links galleries to pages with support for positioning and different gallery types';
COMMENT ON TABLE user_profile_galleries IS 'Links galleries to user profiles with support for different gallery types';
COMMENT ON TABLE marketplace_galleries IS 'Links galleries to marketplace listings with support for different gallery types';

COMMENT ON COLUMN event_galleries.gallery_type IS 'Type of gallery: main, promotional, behind_scenes, highlights, sponsors, venue';
COMMENT ON COLUMN news_galleries.gallery_type IS 'Type of gallery: article, hero, inline, infographic, supporting';
COMMENT ON COLUMN resource_galleries.gallery_type IS 'Type of gallery: screenshots, diagrams, examples, documentation, tutorial';
COMMENT ON COLUMN page_galleries.gallery_type IS 'Type of gallery: content, hero, carousel, banner, background, testimonials';
COMMENT ON COLUMN page_galleries.display_position IS 'Where to display the gallery: header, content, sidebar, footer, hero, background';
COMMENT ON COLUMN user_profile_galleries.gallery_type IS 'Type of gallery: portfolio, personal, professional, projects, achievements';
COMMENT ON COLUMN marketplace_galleries.gallery_type IS 'Type of gallery: product, detail, usage, packaging, comparison';

COMMIT;