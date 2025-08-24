-- =====================================================
-- CREATE TRIGGERS FOR AUTOMATIC GALLERY COUNT UPDATES
-- =====================================================
-- Creates triggers to automatically maintain gallery_count columns
-- when gallery relationships are added, updated, or removed

BEGIN;

-- =====================================================
-- UTILITY FUNCTIONS FOR GALLERY COUNT UPDATES
-- =====================================================

-- Function to update event gallery count
CREATE OR REPLACE FUNCTION update_event_gallery_count()
RETURNS TRIGGER AS $$
BEGIN
  -- For INSERT and UPDATE
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE events 
    SET gallery_count = (
      SELECT COUNT(*) 
      FROM event_galleries eg
      JOIN user_galleries ug ON ug.id = eg.gallery_id
      WHERE eg.event_id = NEW.event_id 
      AND ug.visibility = 'visible'
    )
    WHERE id = NEW.event_id;
    RETURN NEW;
  END IF;
  
  -- For DELETE
  IF TG_OP = 'DELETE' THEN
    UPDATE events 
    SET gallery_count = (
      SELECT COUNT(*) 
      FROM event_galleries eg
      JOIN user_galleries ug ON ug.id = eg.gallery_id
      WHERE eg.event_id = OLD.event_id 
      AND ug.visibility = 'visible'
    )
    WHERE id = OLD.event_id;
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to update news gallery count
CREATE OR REPLACE FUNCTION update_news_gallery_count()
RETURNS TRIGGER AS $$
BEGIN
  -- For INSERT and UPDATE
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE news 
    SET gallery_count = (
      SELECT COUNT(*) 
      FROM news_galleries ng
      JOIN user_galleries ug ON ug.id = ng.gallery_id
      WHERE ng.news_id = NEW.news_id 
      AND ug.visibility = 'visible'
    )
    WHERE id = NEW.news_id;
    RETURN NEW;
  END IF;
  
  -- For DELETE
  IF TG_OP = 'DELETE' THEN
    UPDATE news 
    SET gallery_count = (
      SELECT COUNT(*) 
      FROM news_galleries ng
      JOIN user_galleries ug ON ug.id = ng.gallery_id
      WHERE ng.news_id = OLD.news_id 
      AND ug.visibility = 'visible'
    )
    WHERE id = OLD.news_id;
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to update resource gallery count
CREATE OR REPLACE FUNCTION update_resource_gallery_count()
RETURNS TRIGGER AS $$
BEGIN
  -- For INSERT and UPDATE
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE resources 
    SET gallery_count = (
      SELECT COUNT(*) 
      FROM resource_galleries rg
      JOIN user_galleries ug ON ug.id = rg.gallery_id
      WHERE rg.resource_id = NEW.resource_id 
      AND ug.visibility = 'visible'
    )
    WHERE id = NEW.resource_id;
    RETURN NEW;
  END IF;
  
  -- For DELETE
  IF TG_OP = 'DELETE' THEN
    UPDATE resources 
    SET gallery_count = (
      SELECT COUNT(*) 
      FROM resource_galleries rg
      JOIN user_galleries ug ON ug.id = rg.gallery_id
      WHERE rg.resource_id = OLD.resource_id 
      AND ug.visibility = 'visible'
    )
    WHERE id = OLD.resource_id;
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to update page gallery count
CREATE OR REPLACE FUNCTION update_page_gallery_count()
RETURNS TRIGGER AS $$
BEGIN
  -- For INSERT and UPDATE
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE pages 
    SET gallery_count = (
      SELECT COUNT(*) 
      FROM page_galleries pg
      JOIN user_galleries ug ON ug.id = pg.gallery_id
      WHERE pg.page_id = NEW.page_id 
      AND ug.visibility = 'visible'
    )
    WHERE id = NEW.page_id;
    RETURN NEW;
  END IF;
  
  -- For DELETE
  IF TG_OP = 'DELETE' THEN
    UPDATE pages 
    SET gallery_count = (
      SELECT COUNT(*) 
      FROM page_galleries pg
      JOIN user_galleries ug ON ug.id = pg.gallery_id
      WHERE pg.page_id = OLD.page_id 
      AND ug.visibility = 'visible'
    )
    WHERE id = OLD.page_id;
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to update user profile gallery count
CREATE OR REPLACE FUNCTION update_user_profile_gallery_count()
RETURNS TRIGGER AS $$
BEGIN
  -- For INSERT and UPDATE
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE members 
    SET gallery_count = (
      SELECT COUNT(*) 
      FROM user_profile_galleries upg
      JOIN user_galleries ug ON ug.id = upg.gallery_id
      WHERE upg.user_id = NEW.user_id 
      AND ug.visibility = 'visible'
    )
    WHERE id = NEW.user_id;
    RETURN NEW;
  END IF;
  
  -- For DELETE
  IF TG_OP = 'DELETE' THEN
    UPDATE members 
    SET gallery_count = (
      SELECT COUNT(*) 
      FROM user_profile_galleries upg
      JOIN user_galleries ug ON ug.id = upg.gallery_id
      WHERE upg.user_id = OLD.user_id 
      AND ug.visibility = 'visible'
    )
    WHERE id = OLD.user_id;
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to update marketplace gallery count
CREATE OR REPLACE FUNCTION update_marketplace_gallery_count()
RETURNS TRIGGER AS $$
BEGIN
  -- For INSERT and UPDATE
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE marketplace_listings 
    SET gallery_count = (
      SELECT COUNT(*) 
      FROM marketplace_galleries mg
      JOIN user_galleries ug ON ug.id = mg.gallery_id
      WHERE mg.listing_id = NEW.listing_id 
      AND ug.visibility = 'visible'
    )
    WHERE id = NEW.listing_id;
    RETURN NEW;
  END IF;
  
  -- For DELETE
  IF TG_OP = 'DELETE' THEN
    UPDATE marketplace_listings 
    SET gallery_count = (
      SELECT COUNT(*) 
      FROM marketplace_galleries mg
      JOIN user_galleries ug ON ug.id = mg.gallery_id
      WHERE mg.listing_id = OLD.listing_id 
      AND ug.visibility = 'visible'
    )
    WHERE id = OLD.listing_id;
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- CREATE TRIGGERS FOR GALLERY RELATIONSHIP TABLES
-- =====================================================

-- Event galleries triggers
DROP TRIGGER IF EXISTS trigger_update_event_gallery_count ON event_galleries;
CREATE TRIGGER trigger_update_event_gallery_count
AFTER INSERT OR UPDATE OR DELETE ON event_galleries
FOR EACH ROW EXECUTE FUNCTION update_event_gallery_count();

-- News galleries triggers
DROP TRIGGER IF EXISTS trigger_update_news_gallery_count ON news_galleries;
CREATE TRIGGER trigger_update_news_gallery_count
AFTER INSERT OR UPDATE OR DELETE ON news_galleries
FOR EACH ROW EXECUTE FUNCTION update_news_gallery_count();

-- Resource galleries triggers
DROP TRIGGER IF EXISTS trigger_update_resource_gallery_count ON resource_galleries;
CREATE TRIGGER trigger_update_resource_gallery_count
AFTER INSERT OR UPDATE OR DELETE ON resource_galleries
FOR EACH ROW EXECUTE FUNCTION update_resource_gallery_count();

-- Page galleries triggers
DROP TRIGGER IF EXISTS trigger_update_page_gallery_count ON page_galleries;
CREATE TRIGGER trigger_update_page_gallery_count
AFTER INSERT OR UPDATE OR DELETE ON page_galleries
FOR EACH ROW EXECUTE FUNCTION update_page_gallery_count();

-- User profile galleries triggers
DROP TRIGGER IF EXISTS trigger_update_user_profile_gallery_count ON user_profile_galleries;
CREATE TRIGGER trigger_update_user_profile_gallery_count
AFTER INSERT OR UPDATE OR DELETE ON user_profile_galleries
FOR EACH ROW EXECUTE FUNCTION update_user_profile_gallery_count();

-- Marketplace galleries triggers
DROP TRIGGER IF EXISTS trigger_update_marketplace_gallery_count ON marketplace_galleries;
CREATE TRIGGER trigger_update_marketplace_gallery_count
AFTER INSERT OR UPDATE OR DELETE ON marketplace_galleries
FOR EACH ROW EXECUTE FUNCTION update_marketplace_gallery_count();

-- =====================================================
-- TRIGGER FOR USER_GALLERIES VISIBILITY CHANGES
-- =====================================================

-- Function to update all entity gallery counts when gallery visibility changes
CREATE OR REPLACE FUNCTION update_all_gallery_counts_on_visibility_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Only trigger if visibility changed
  IF NEW.visibility <> OLD.visibility THEN
    
    -- Update event gallery counts
    UPDATE events SET gallery_count = (
      SELECT COUNT(*) 
      FROM event_galleries eg
      JOIN user_galleries ug ON ug.id = eg.gallery_id
      WHERE eg.event_id = events.id 
      AND ug.visibility = 'visible'
    )
    WHERE id IN (
      SELECT eg.event_id 
      FROM event_galleries eg 
      WHERE eg.gallery_id = NEW.id
    );
    
    -- Update news gallery counts
    UPDATE news SET gallery_count = (
      SELECT COUNT(*) 
      FROM news_galleries ng
      JOIN user_galleries ug ON ug.id = ng.gallery_id
      WHERE ng.news_id = news.id 
      AND ug.visibility = 'visible'
    )
    WHERE id IN (
      SELECT ng.news_id 
      FROM news_galleries ng 
      WHERE ng.gallery_id = NEW.id
    );
    
    -- Update resource gallery counts
    UPDATE resources SET gallery_count = (
      SELECT COUNT(*) 
      FROM resource_galleries rg
      JOIN user_galleries ug ON ug.id = rg.gallery_id
      WHERE rg.resource_id = resources.id 
      AND ug.visibility = 'visible'
    )
    WHERE id IN (
      SELECT rg.resource_id 
      FROM resource_galleries rg 
      WHERE rg.gallery_id = NEW.id
    );
    
    -- Update page gallery counts
    UPDATE pages SET gallery_count = (
      SELECT COUNT(*) 
      FROM page_galleries pg
      JOIN user_galleries ug ON ug.id = pg.gallery_id
      WHERE pg.page_id = pages.id 
      AND ug.visibility = 'visible'
    )
    WHERE id IN (
      SELECT pg.page_id 
      FROM page_galleries pg 
      WHERE pg.gallery_id = NEW.id
    );
    
    -- Update user profile gallery counts
    UPDATE members SET gallery_count = (
      SELECT COUNT(*) 
      FROM user_profile_galleries upg
      JOIN user_galleries ug ON ug.id = upg.gallery_id
      WHERE upg.user_id = members.id 
      AND ug.visibility = 'visible'
    )
    WHERE id IN (
      SELECT upg.user_id 
      FROM user_profile_galleries upg 
      WHERE upg.gallery_id = NEW.id
    );
    
    -- Update marketplace gallery counts
    UPDATE marketplace_listings SET gallery_count = (
      SELECT COUNT(*) 
      FROM marketplace_galleries mg
      JOIN user_galleries ug ON ug.id = mg.gallery_id
      WHERE mg.listing_id = marketplace_listings.id 
      AND ug.visibility = 'visible'
    )
    WHERE id IN (
      SELECT mg.listing_id 
      FROM marketplace_galleries mg 
      WHERE mg.gallery_id = NEW.id
    );
    
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for user_galleries visibility changes
DROP TRIGGER IF EXISTS trigger_update_all_gallery_counts_on_visibility ON user_galleries;
CREATE TRIGGER trigger_update_all_gallery_counts_on_visibility
AFTER UPDATE ON user_galleries
FOR EACH ROW EXECUTE FUNCTION update_all_gallery_counts_on_visibility_change();

-- =====================================================
-- INITIAL GALLERY COUNT POPULATION
-- =====================================================

-- Update all existing gallery counts
UPDATE events SET gallery_count = (
  SELECT COUNT(*) 
  FROM event_galleries eg
  JOIN user_galleries ug ON ug.id = eg.gallery_id
  WHERE eg.event_id = events.id 
  AND ug.visibility = 'visible'
);

UPDATE news SET gallery_count = (
  SELECT COUNT(*) 
  FROM news_galleries ng
  JOIN user_galleries ug ON ug.id = ng.gallery_id
  WHERE ng.news_id = news.id 
  AND ug.visibility = 'visible'
);

UPDATE resources SET gallery_count = (
  SELECT COUNT(*) 
  FROM resource_galleries rg
  JOIN user_galleries ug ON ug.id = rg.gallery_id
  WHERE rg.resource_id = resources.id 
  AND ug.visibility = 'visible'
);

UPDATE pages SET gallery_count = (
  SELECT COUNT(*) 
  FROM page_galleries pg
  JOIN user_galleries ug ON ug.id = pg.gallery_id
  WHERE pg.page_id = pages.id 
  AND ug.visibility = 'visible'
);

UPDATE members SET gallery_count = (
  SELECT COUNT(*) 
  FROM user_profile_galleries upg
  JOIN user_galleries ug ON ug.id = upg.gallery_id
  WHERE upg.user_id = members.id 
  AND ug.visibility = 'visible'
);

UPDATE marketplace_listings SET gallery_count = (
  SELECT COUNT(*) 
  FROM marketplace_galleries mg
  JOIN user_galleries ug ON ug.id = mg.gallery_id
  WHERE mg.listing_id = marketplace_listings.id 
  AND ug.visibility = 'visible'
);

COMMIT;