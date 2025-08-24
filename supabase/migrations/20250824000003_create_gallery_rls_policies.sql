-- =====================================================
-- CREATE RLS POLICIES FOR GALLERY RELATIONSHIP TABLES
-- =====================================================
-- Creates comprehensive Row Level Security policies for all gallery relationship tables
-- Supports public viewing, member access, and entity-specific permissions

BEGIN;

-- =====================================================
-- ENABLE RLS ON ALL GALLERY RELATIONSHIP TABLES
-- =====================================================

ALTER TABLE event_galleries ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_galleries ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_galleries ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_galleries ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profile_galleries ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_galleries ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- EVENT GALLERIES RLS POLICIES
-- =====================================================

-- Public can view galleries for published events
DROP POLICY IF EXISTS "Public can view event galleries for published events" ON event_galleries;
CREATE POLICY "Public can view event galleries for published events"
ON event_galleries FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM events e 
    WHERE e.id = event_galleries.event_id 
    AND e.status = 'published'
  )
  AND EXISTS (
    SELECT 1 FROM user_galleries ug 
    WHERE ug.id = event_galleries.gallery_id 
    AND ug.privacy_level = 'public' 
    AND ug.visibility = 'visible'
  )
);

-- Event organizers can manage event galleries
DROP POLICY IF EXISTS "Event organizers can manage event galleries" ON event_galleries;
CREATE POLICY "Event organizers can manage event galleries"
ON event_galleries FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM events e
    JOIN members m ON m.id = e.organizer_id
    WHERE e.id = event_galleries.event_id 
    AND m.user_id = auth.uid()
  )
);

-- Admins can manage all event galleries
DROP POLICY IF EXISTS "Admins can manage event galleries" ON event_galleries;
CREATE POLICY "Admins can manage event galleries"
ON event_galleries FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role IN ('admin', 'superadmin')
  )
);

-- =====================================================
-- NEWS GALLERIES RLS POLICIES
-- =====================================================

-- Public can view galleries for published news
DROP POLICY IF EXISTS "Public can view news galleries for published articles" ON news_galleries;
CREATE POLICY "Public can view news galleries for published articles"
ON news_galleries FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM news n 
    WHERE n.id = news_galleries.news_id 
    AND n.status = 'published'
  )
  AND EXISTS (
    SELECT 1 FROM user_galleries ug 
    WHERE ug.id = news_galleries.gallery_id 
    AND ug.privacy_level = 'public' 
    AND ug.visibility = 'visible'
  )
);

-- News authors can manage news galleries
DROP POLICY IF EXISTS "News authors can manage news galleries" ON news_galleries;
CREATE POLICY "News authors can manage news galleries"
ON news_galleries FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM news n
    JOIN members m ON m.id = n.author_id
    WHERE n.id = news_galleries.news_id 
    AND m.user_id = auth.uid()
  )
);

-- Admins can manage all news galleries
DROP POLICY IF EXISTS "Admins can manage news galleries" ON news_galleries;
CREATE POLICY "Admins can manage news galleries"
ON news_galleries FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role IN ('admin', 'superadmin')
  )
);

-- =====================================================
-- RESOURCE GALLERIES RLS POLICIES
-- =====================================================

-- Public can view galleries for published resources
DROP POLICY IF EXISTS "Public can view resource galleries for published resources" ON resource_galleries;
CREATE POLICY "Public can view resource galleries for published resources"
ON resource_galleries FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM resources r 
    WHERE r.id = resource_galleries.resource_id 
    AND r.status = 'published'
  )
  AND EXISTS (
    SELECT 1 FROM user_galleries ug 
    WHERE ug.id = resource_galleries.gallery_id 
    AND ug.privacy_level = 'public' 
    AND ug.visibility = 'visible'
  )
);

-- Resource contributors can manage resource galleries
DROP POLICY IF EXISTS "Resource contributors can manage resource galleries" ON resource_galleries;
CREATE POLICY "Resource contributors can manage resource galleries"
ON resource_galleries FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM resources r
    JOIN members m ON m.id = r.contributor_id
    WHERE r.id = resource_galleries.resource_id 
    AND m.user_id = auth.uid()
  )
);

-- Admins can manage all resource galleries
DROP POLICY IF EXISTS "Admins can manage resource galleries" ON resource_galleries;
CREATE POLICY "Admins can manage resource galleries"
ON resource_galleries FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role IN ('admin', 'superadmin')
  )
);

-- =====================================================
-- PAGE GALLERIES RLS POLICIES
-- =====================================================

-- Public can view galleries for published pages
DROP POLICY IF EXISTS "Public can view page galleries for published pages" ON page_galleries;
CREATE POLICY "Public can view page galleries for published pages"
ON page_galleries FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM pages p 
    WHERE p.id = page_galleries.page_id 
    AND p.status = 'published'
  )
  AND EXISTS (
    SELECT 1 FROM user_galleries ug 
    WHERE ug.id = page_galleries.gallery_id 
    AND ug.privacy_level = 'public' 
    AND ug.visibility = 'visible'
  )
);

-- Page authors can manage page galleries
DROP POLICY IF EXISTS "Page authors can manage page galleries" ON page_galleries;
CREATE POLICY "Page authors can manage page galleries"
ON page_galleries FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM pages p
    JOIN members m ON m.id = p.author_id
    WHERE p.id = page_galleries.page_id 
    AND m.user_id = auth.uid()
  )
);

-- Admins can manage all page galleries
DROP POLICY IF EXISTS "Admins can manage page galleries" ON page_galleries;
CREATE POLICY "Admins can manage page galleries"
ON page_galleries FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role IN ('admin', 'superadmin')
  )
);

-- =====================================================
-- USER PROFILE GALLERIES RLS POLICIES
-- =====================================================

-- Public can view galleries for public user profiles
DROP POLICY IF EXISTS "Public can view user profile galleries for public profiles" ON user_profile_galleries;
CREATE POLICY "Public can view user profile galleries for public profiles"
ON user_profile_galleries FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM members m 
    WHERE m.id = user_profile_galleries.user_id 
    AND m.status = 'published'
  )
  AND EXISTS (
    SELECT 1 FROM user_galleries ug 
    WHERE ug.id = user_profile_galleries.gallery_id 
    AND ug.privacy_level = 'public' 
    AND ug.visibility = 'visible'
  )
);

-- Users can manage their own profile galleries
DROP POLICY IF EXISTS "Users can manage their own profile galleries" ON user_profile_galleries;
CREATE POLICY "Users can manage their own profile galleries"
ON user_profile_galleries FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM members m
    WHERE m.id = user_profile_galleries.user_id 
    AND m.user_id = auth.uid()
  )
);

-- Admins can manage all user profile galleries
DROP POLICY IF EXISTS "Admins can manage user profile galleries" ON user_profile_galleries;
CREATE POLICY "Admins can manage user profile galleries"
ON user_profile_galleries FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role IN ('admin', 'superadmin')
  )
);

-- =====================================================
-- MARKETPLACE GALLERIES RLS POLICIES
-- =====================================================

-- Public can view galleries for published marketplace listings
DROP POLICY IF EXISTS "Public can view marketplace galleries for published listings" ON marketplace_galleries;
CREATE POLICY "Public can view marketplace galleries for published listings"
ON marketplace_galleries FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM marketplace_listings ml 
    WHERE ml.id = marketplace_galleries.listing_id 
    AND ml.status = 'published'
  )
  AND EXISTS (
    SELECT 1 FROM user_galleries ug 
    WHERE ug.id = marketplace_galleries.gallery_id 
    AND ug.privacy_level = 'public' 
    AND ug.visibility = 'visible'
  )
);

-- Listing sellers can manage marketplace galleries
DROP POLICY IF EXISTS "Sellers can manage marketplace galleries" ON marketplace_galleries;
CREATE POLICY "Sellers can manage marketplace galleries"
ON marketplace_galleries FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM marketplace_listings ml
    JOIN members m ON m.id = ml.seller_id
    WHERE ml.id = marketplace_galleries.listing_id 
    AND m.user_id = auth.uid()
  )
);

-- Admins can manage all marketplace galleries
DROP POLICY IF EXISTS "Admins can manage marketplace galleries" ON marketplace_galleries;
CREATE POLICY "Admins can manage marketplace galleries"
ON marketplace_galleries FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role IN ('admin', 'superadmin')
  )
);

-- =====================================================
-- ADDITIONAL MEMBER-LEVEL POLICIES
-- =====================================================

-- Authenticated members can view member-only galleries
DROP POLICY IF EXISTS "Members can view member-only event galleries" ON event_galleries;
CREATE POLICY "Members can view member-only event galleries"
ON event_galleries FOR SELECT
USING (
  auth.role() = 'authenticated'
  AND EXISTS (
    SELECT 1 FROM events e 
    WHERE e.id = event_galleries.event_id 
    AND e.status = 'published'
  )
  AND EXISTS (
    SELECT 1 FROM user_galleries ug 
    WHERE ug.id = event_galleries.gallery_id 
    AND ug.privacy_level = 'members_only' 
    AND ug.visibility = 'visible'
  )
);

DROP POLICY IF EXISTS "Members can view member-only news galleries" ON news_galleries;
CREATE POLICY "Members can view member-only news galleries"
ON news_galleries FOR SELECT
USING (
  auth.role() = 'authenticated'
  AND EXISTS (
    SELECT 1 FROM news n 
    WHERE n.id = news_galleries.news_id 
    AND n.status = 'published'
  )
  AND EXISTS (
    SELECT 1 FROM user_galleries ug 
    WHERE ug.id = news_galleries.gallery_id 
    AND ug.privacy_level = 'members_only' 
    AND ug.visibility = 'visible'
  )
);

DROP POLICY IF EXISTS "Members can view member-only resource galleries" ON resource_galleries;
CREATE POLICY "Members can view member-only resource galleries"
ON resource_galleries FOR SELECT
USING (
  auth.role() = 'authenticated'
  AND EXISTS (
    SELECT 1 FROM resources r 
    WHERE r.id = resource_galleries.resource_id 
    AND r.status = 'published'
  )
  AND EXISTS (
    SELECT 1 FROM user_galleries ug 
    WHERE ug.id = resource_galleries.gallery_id 
    AND ug.privacy_level = 'members_only' 
    AND ug.visibility = 'visible'
  )
);

DROP POLICY IF EXISTS "Members can view member-only page galleries" ON page_galleries;
CREATE POLICY "Members can view member-only page galleries"
ON page_galleries FOR SELECT
USING (
  auth.role() = 'authenticated'
  AND EXISTS (
    SELECT 1 FROM pages p 
    WHERE p.id = page_galleries.page_id 
    AND p.status = 'published'
  )
  AND EXISTS (
    SELECT 1 FROM user_galleries ug 
    WHERE ug.id = page_galleries.gallery_id 
    AND ug.privacy_level = 'members_only' 
    AND ug.visibility = 'visible'
  )
);

DROP POLICY IF EXISTS "Members can view member-only profile galleries" ON user_profile_galleries;
CREATE POLICY "Members can view member-only profile galleries"
ON user_profile_galleries FOR SELECT
USING (
  auth.role() = 'authenticated'
  AND EXISTS (
    SELECT 1 FROM members m 
    WHERE m.id = user_profile_galleries.user_id 
    AND m.status = 'published'
  )
  AND EXISTS (
    SELECT 1 FROM user_galleries ug 
    WHERE ug.id = user_profile_galleries.gallery_id 
    AND ug.privacy_level = 'members_only' 
    AND ug.visibility = 'visible'
  )
);

DROP POLICY IF EXISTS "Members can view member-only marketplace galleries" ON marketplace_galleries;
CREATE POLICY "Members can view member-only marketplace galleries"
ON marketplace_galleries FOR SELECT
USING (
  auth.role() = 'authenticated'
  AND EXISTS (
    SELECT 1 FROM marketplace_listings ml 
    WHERE ml.id = marketplace_galleries.listing_id 
    AND ml.status = 'published'
  )
  AND EXISTS (
    SELECT 1 FROM user_galleries ug 
    WHERE ug.id = marketplace_galleries.gallery_id 
    AND ug.privacy_level = 'members_only' 
    AND ug.visibility = 'visible'
  )
);

COMMIT;