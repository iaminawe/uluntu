-- =====================================================
-- ADD GALLERY COLUMNS TO ENTITY TABLES
-- =====================================================
-- Adds gallery count and featured gallery columns to existing entity tables

BEGIN;

-- =====================================================
-- 1. ADD COLUMNS TO EVENTS TABLE
-- =====================================================

ALTER TABLE events
ADD COLUMN IF NOT EXISTS gallery_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS featured_gallery_id UUID REFERENCES user_galleries(id) ON DELETE SET NULL;

-- Create index for featured gallery lookups
CREATE INDEX IF NOT EXISTS idx_events_featured_gallery ON events(featured_gallery_id) WHERE featured_gallery_id IS NOT NULL;

-- =====================================================
-- 2. ADD COLUMNS TO NEWS TABLE
-- =====================================================

ALTER TABLE news
ADD COLUMN IF NOT EXISTS gallery_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS featured_gallery_id UUID REFERENCES user_galleries(id) ON DELETE SET NULL;

-- Create index for featured gallery lookups
CREATE INDEX IF NOT EXISTS idx_news_featured_gallery ON news(featured_gallery_id) WHERE featured_gallery_id IS NOT NULL;

-- =====================================================
-- 3. ADD COLUMNS TO RESOURCES TABLE
-- =====================================================

ALTER TABLE resources
ADD COLUMN IF NOT EXISTS gallery_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS featured_gallery_id UUID REFERENCES user_galleries(id) ON DELETE SET NULL;

-- Create index for featured gallery lookups
CREATE INDEX IF NOT EXISTS idx_resources_featured_gallery ON resources(featured_gallery_id) WHERE featured_gallery_id IS NOT NULL;

-- =====================================================
-- 4. ADD COLUMNS TO PAGES TABLE
-- =====================================================

ALTER TABLE pages
ADD COLUMN IF NOT EXISTS gallery_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS default_gallery_id UUID REFERENCES user_galleries(id) ON DELETE SET NULL;

-- Create index for default gallery lookups
CREATE INDEX IF NOT EXISTS idx_pages_default_gallery ON pages(default_gallery_id) WHERE default_gallery_id IS NOT NULL;

-- =====================================================
-- 5. ADD COLUMNS TO MEMBERS TABLE (USER PROFILES)
-- =====================================================

ALTER TABLE members
ADD COLUMN IF NOT EXISTS gallery_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS featured_gallery_id UUID REFERENCES user_galleries(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS profile_gallery_id UUID REFERENCES user_galleries(id) ON DELETE SET NULL;

-- Create indexes for gallery lookups
CREATE INDEX IF NOT EXISTS idx_members_featured_gallery ON members(featured_gallery_id) WHERE featured_gallery_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_members_profile_gallery ON members(profile_gallery_id) WHERE profile_gallery_id IS NOT NULL;

-- =====================================================
-- 6. ADD COLUMNS TO MARKETPLACE_LISTINGS TABLE
-- =====================================================

ALTER TABLE marketplace_listings
ADD COLUMN IF NOT EXISTS gallery_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS featured_gallery_id UUID REFERENCES user_galleries(id) ON DELETE SET NULL;

-- Create index for featured gallery lookups
CREATE INDEX IF NOT EXISTS idx_marketplace_featured_gallery ON marketplace_listings(featured_gallery_id) WHERE featured_gallery_id IS NOT NULL;

-- =====================================================
-- ADD CONSTRAINTS AND CHECKS
-- =====================================================

-- Ensure gallery counts are non-negative
ALTER TABLE events ADD CONSTRAINT events_gallery_count_check CHECK (gallery_count >= 0);
ALTER TABLE news ADD CONSTRAINT news_gallery_count_check CHECK (gallery_count >= 0);
ALTER TABLE resources ADD CONSTRAINT resources_gallery_count_check CHECK (gallery_count >= 0);
ALTER TABLE pages ADD CONSTRAINT pages_gallery_count_check CHECK (gallery_count >= 0);
ALTER TABLE members ADD CONSTRAINT members_gallery_count_check CHECK (gallery_count >= 0);
ALTER TABLE marketplace_listings ADD CONSTRAINT marketplace_gallery_count_check CHECK (gallery_count >= 0);

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON COLUMN events.gallery_count IS 'Cached count of galleries associated with this event';
COMMENT ON COLUMN events.featured_gallery_id IS 'Primary gallery to display for this event';

COMMENT ON COLUMN news.gallery_count IS 'Cached count of galleries associated with this news article';
COMMENT ON COLUMN news.featured_gallery_id IS 'Primary gallery to display for this news article';

COMMENT ON COLUMN resources.gallery_count IS 'Cached count of galleries associated with this resource';
COMMENT ON COLUMN resources.featured_gallery_id IS 'Primary gallery to display for this resource';

COMMENT ON COLUMN pages.gallery_count IS 'Cached count of galleries associated with this page';
COMMENT ON COLUMN pages.default_gallery_id IS 'Default gallery to display for this page';

COMMENT ON COLUMN members.gallery_count IS 'Cached count of galleries associated with this user profile';
COMMENT ON COLUMN members.featured_gallery_id IS 'Primary gallery to display for this user profile';
COMMENT ON COLUMN members.profile_gallery_id IS 'Main profile gallery for this user';

COMMENT ON COLUMN marketplace_listings.gallery_count IS 'Cached count of galleries associated with this marketplace listing';
COMMENT ON COLUMN marketplace_listings.featured_gallery_id IS 'Primary gallery to display for this marketplace listing';

COMMIT;