-- =====================================================
-- CREATE GALLERY UTILITY FUNCTIONS
-- =====================================================
-- Creates utility functions for gallery management, statistics, and operations
-- Compatible with existing gallery system that supports owner_type and owner_id

BEGIN;

-- =====================================================
-- GALLERY ATTACHMENT FUNCTIONS
-- =====================================================

-- Function to attach gallery to event
CREATE OR REPLACE FUNCTION attach_gallery_to_event(
  p_event_id UUID,
  p_gallery_id UUID,
  p_gallery_type VARCHAR(50) DEFAULT 'main',
  p_display_order INTEGER DEFAULT 0,
  p_is_featured BOOLEAN DEFAULT false,
  p_description TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_relationship_id UUID;
BEGIN
  INSERT INTO event_galleries (
    event_id, gallery_id, gallery_type, display_order, is_featured, description
  ) VALUES (
    p_event_id, p_gallery_id, p_gallery_type, p_display_order, p_is_featured, p_description
  )
  RETURNING id INTO v_relationship_id;
  
  -- Update featured gallery if this is featured
  IF p_is_featured THEN
    UPDATE events 
    SET featured_gallery_id = p_gallery_id 
    WHERE id = p_event_id;
  END IF;
  
  RETURN v_relationship_id;
END;
$$ LANGUAGE plpgsql;

-- Function to attach gallery to news
CREATE OR REPLACE FUNCTION attach_gallery_to_news(
  p_news_id UUID,
  p_gallery_id UUID,
  p_gallery_type VARCHAR(50) DEFAULT 'article',
  p_display_order INTEGER DEFAULT 0,
  p_is_featured BOOLEAN DEFAULT false,
  p_description TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_relationship_id UUID;
BEGIN
  INSERT INTO news_galleries (
    news_id, gallery_id, gallery_type, display_order, is_featured, description
  ) VALUES (
    p_news_id, p_gallery_id, p_gallery_type, p_display_order, p_is_featured, p_description
  )
  RETURNING id INTO v_relationship_id;
  
  -- Update featured gallery if this is featured
  IF p_is_featured THEN
    UPDATE news 
    SET featured_gallery_id = p_gallery_id 
    WHERE id = p_news_id;
  END IF;
  
  RETURN v_relationship_id;
END;
$$ LANGUAGE plpgsql;

-- Function to attach gallery to resource
CREATE OR REPLACE FUNCTION attach_gallery_to_resource(
  p_resource_id UUID,
  p_gallery_id UUID,
  p_gallery_type VARCHAR(50) DEFAULT 'screenshots',
  p_display_order INTEGER DEFAULT 0,
  p_is_featured BOOLEAN DEFAULT false,
  p_description TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_relationship_id UUID;
BEGIN
  INSERT INTO resource_galleries (
    resource_id, gallery_id, gallery_type, display_order, is_featured, description
  ) VALUES (
    p_resource_id, p_gallery_id, p_gallery_type, p_display_order, p_is_featured, p_description
  )
  RETURNING id INTO v_relationship_id;
  
  -- Update featured gallery if this is featured
  IF p_is_featured THEN
    UPDATE resources 
    SET featured_gallery_id = p_gallery_id 
    WHERE id = p_resource_id;
  END IF;
  
  RETURN v_relationship_id;
END;
$$ LANGUAGE plpgsql;

-- Function to attach gallery to page
CREATE OR REPLACE FUNCTION attach_gallery_to_page(
  p_page_id UUID,
  p_gallery_id UUID,
  p_gallery_type VARCHAR(50) DEFAULT 'content',
  p_display_position VARCHAR(50) DEFAULT 'content',
  p_display_order INTEGER DEFAULT 0,
  p_is_featured BOOLEAN DEFAULT false,
  p_description TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_relationship_id UUID;
BEGIN
  INSERT INTO page_galleries (
    page_id, gallery_id, gallery_type, display_position, display_order, is_featured, description
  ) VALUES (
    p_page_id, p_gallery_id, p_gallery_type, p_display_position, p_display_order, p_is_featured, p_description
  )
  RETURNING id INTO v_relationship_id;
  
  -- Update default gallery if this is featured
  IF p_is_featured THEN
    UPDATE pages 
    SET default_gallery_id = p_gallery_id 
    WHERE id = p_page_id;
  END IF;
  
  RETURN v_relationship_id;
END;
$$ LANGUAGE plpgsql;

-- Function to attach gallery to user profile
CREATE OR REPLACE FUNCTION attach_gallery_to_user_profile(
  p_user_id UUID,
  p_gallery_id UUID,
  p_gallery_type VARCHAR(50) DEFAULT 'portfolio',
  p_display_order INTEGER DEFAULT 0,
  p_is_featured BOOLEAN DEFAULT false,
  p_description TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_relationship_id UUID;
BEGIN
  INSERT INTO user_profile_galleries (
    user_id, gallery_id, gallery_type, display_order, is_featured, description
  ) VALUES (
    p_user_id, p_gallery_id, p_gallery_type, p_display_order, p_is_featured, p_description
  )
  RETURNING id INTO v_relationship_id;
  
  -- Update featured gallery if this is featured
  IF p_is_featured THEN
    UPDATE members 
    SET featured_gallery_id = p_gallery_id 
    WHERE id = p_user_id;
  END IF;
  
  -- Set as profile gallery if it's a portfolio type
  IF p_gallery_type = 'portfolio' THEN
    UPDATE members 
    SET profile_gallery_id = p_gallery_id 
    WHERE id = p_user_id;
  END IF;
  
  RETURN v_relationship_id;
END;
$$ LANGUAGE plpgsql;

-- Function to attach gallery to marketplace listing
CREATE OR REPLACE FUNCTION attach_gallery_to_marketplace(
  p_listing_id UUID,
  p_gallery_id UUID,
  p_gallery_type VARCHAR(50) DEFAULT 'product',
  p_display_order INTEGER DEFAULT 0,
  p_is_featured BOOLEAN DEFAULT false,
  p_description TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_relationship_id UUID;
BEGIN
  INSERT INTO marketplace_galleries (
    listing_id, gallery_id, gallery_type, display_order, is_featured, description
  ) VALUES (
    p_listing_id, p_gallery_id, p_gallery_type, p_display_order, p_is_featured, p_description
  )
  RETURNING id INTO v_relationship_id;
  
  -- Update featured gallery if this is featured
  IF p_is_featured THEN
    UPDATE marketplace_listings 
    SET featured_gallery_id = p_gallery_id 
    WHERE id = p_listing_id;
  END IF;
  
  RETURN v_relationship_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- GALLERY RETRIEVAL FUNCTIONS
-- =====================================================

-- Function to get all galleries for an entity
CREATE OR REPLACE FUNCTION get_entity_galleries(
  p_entity_type VARCHAR(50),
  p_entity_id UUID,
  p_gallery_type VARCHAR(50) DEFAULT NULL,
  p_include_private BOOLEAN DEFAULT false
)
RETURNS TABLE (
  gallery_id UUID,
  gallery_title VARCHAR(255),
  gallery_type VARCHAR(50),
  display_order INTEGER,
  is_featured BOOLEAN,
  description TEXT,
  photo_count INTEGER,
  privacy_level VARCHAR(20),
  visibility VARCHAR(20)
) AS $$
BEGIN
  CASE p_entity_type
    WHEN 'event' THEN
      RETURN QUERY
      SELECT 
        ug.id as gallery_id,
        ug.title as gallery_title,
        eg.gallery_type,
        eg.display_order,
        eg.is_featured,
        eg.description,
        ug.photo_count,
        ug.privacy_level,
        ug.visibility
      FROM event_galleries eg
      JOIN user_galleries ug ON ug.id = eg.gallery_id
      WHERE eg.event_id = p_entity_id
      AND (p_gallery_type IS NULL OR eg.gallery_type = p_gallery_type)
      AND (p_include_private OR ug.privacy_level IN ('public', 'members_only'))
      AND ug.visibility = 'visible'
      ORDER BY eg.display_order, ug.created_at;
      
    WHEN 'news' THEN
      RETURN QUERY
      SELECT 
        ug.id as gallery_id,
        ug.title as gallery_title,
        ng.gallery_type,
        ng.display_order,
        ng.is_featured,
        ng.description,
        ug.photo_count,
        ug.privacy_level,
        ug.visibility
      FROM news_galleries ng
      JOIN user_galleries ug ON ug.id = ng.gallery_id
      WHERE ng.news_id = p_entity_id
      AND (p_gallery_type IS NULL OR ng.gallery_type = p_gallery_type)
      AND (p_include_private OR ug.privacy_level IN ('public', 'members_only'))
      AND ug.visibility = 'visible'
      ORDER BY ng.display_order, ug.created_at;
      
    WHEN 'resource' THEN
      RETURN QUERY
      SELECT 
        ug.id as gallery_id,
        ug.title as gallery_title,
        rg.gallery_type,
        rg.display_order,
        rg.is_featured,
        rg.description,
        ug.photo_count,
        ug.privacy_level,
        ug.visibility
      FROM resource_galleries rg
      JOIN user_galleries ug ON ug.id = rg.gallery_id
      WHERE rg.resource_id = p_entity_id
      AND (p_gallery_type IS NULL OR rg.gallery_type = p_gallery_type)
      AND (p_include_private OR ug.privacy_level IN ('public', 'members_only'))
      AND ug.visibility = 'visible'
      ORDER BY rg.display_order, ug.created_at;
      
    WHEN 'page' THEN
      RETURN QUERY
      SELECT 
        ug.id as gallery_id,
        ug.title as gallery_title,
        pg.gallery_type,
        pg.display_order,
        pg.is_featured,
        pg.description,
        ug.photo_count,
        ug.privacy_level,
        ug.visibility
      FROM page_galleries pg
      JOIN user_galleries ug ON ug.id = pg.gallery_id
      WHERE pg.page_id = p_entity_id
      AND (p_gallery_type IS NULL OR pg.gallery_type = p_gallery_type)
      AND (p_include_private OR ug.privacy_level IN ('public', 'members_only'))
      AND ug.visibility = 'visible'
      ORDER BY pg.display_order, ug.created_at;
      
    WHEN 'user_profile' THEN
      RETURN QUERY
      SELECT 
        ug.id as gallery_id,
        ug.title as gallery_title,
        upg.gallery_type,
        upg.display_order,
        upg.is_featured,
        upg.description,
        ug.photo_count,
        ug.privacy_level,
        ug.visibility
      FROM user_profile_galleries upg
      JOIN user_galleries ug ON ug.id = upg.gallery_id
      WHERE upg.user_id = p_entity_id
      AND (p_gallery_type IS NULL OR upg.gallery_type = p_gallery_type)
      AND (p_include_private OR ug.privacy_level IN ('public', 'members_only'))
      AND ug.visibility = 'visible'
      ORDER BY upg.display_order, ug.created_at;
      
    WHEN 'marketplace' THEN
      RETURN QUERY
      SELECT 
        ug.id as gallery_id,
        ug.title as gallery_title,
        mg.gallery_type,
        mg.display_order,
        mg.is_featured,
        mg.description,
        ug.photo_count,
        ug.privacy_level,
        ug.visibility
      FROM marketplace_galleries mg
      JOIN user_galleries ug ON ug.id = mg.gallery_id
      WHERE mg.listing_id = p_entity_id
      AND (p_gallery_type IS NULL OR mg.gallery_type = p_gallery_type)
      AND (p_include_private OR ug.privacy_level IN ('public', 'members_only'))
      AND ug.visibility = 'visible'
      ORDER BY mg.display_order, ug.created_at;
  END CASE;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- GALLERY MANAGEMENT FUNCTIONS
-- =====================================================

-- Function to set featured gallery for entity
CREATE OR REPLACE FUNCTION set_featured_gallery_for_entity(
  p_entity_type VARCHAR(50),
  p_entity_id UUID,
  p_gallery_id UUID,
  p_gallery_type VARCHAR(50) DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  v_success BOOLEAN := false;
BEGIN
  CASE p_entity_type
    WHEN 'event' THEN
      -- Update the relationship table
      UPDATE event_galleries 
      SET is_featured = false 
      WHERE event_id = p_entity_id 
      AND (p_gallery_type IS NULL OR gallery_type = p_gallery_type);
      
      UPDATE event_galleries 
      SET is_featured = true 
      WHERE event_id = p_entity_id 
      AND gallery_id = p_gallery_id;
      
      -- Update the entity table
      UPDATE events 
      SET featured_gallery_id = p_gallery_id 
      WHERE id = p_entity_id;
      
      v_success := true;
      
    WHEN 'news' THEN
      UPDATE news_galleries 
      SET is_featured = false 
      WHERE news_id = p_entity_id 
      AND (p_gallery_type IS NULL OR gallery_type = p_gallery_type);
      
      UPDATE news_galleries 
      SET is_featured = true 
      WHERE news_id = p_entity_id 
      AND gallery_id = p_gallery_id;
      
      UPDATE news 
      SET featured_gallery_id = p_gallery_id 
      WHERE id = p_entity_id;
      
      v_success := true;
      
    WHEN 'resource' THEN
      UPDATE resource_galleries 
      SET is_featured = false 
      WHERE resource_id = p_entity_id 
      AND (p_gallery_type IS NULL OR gallery_type = p_gallery_type);
      
      UPDATE resource_galleries 
      SET is_featured = true 
      WHERE resource_id = p_entity_id 
      AND gallery_id = p_gallery_id;
      
      UPDATE resources 
      SET featured_gallery_id = p_gallery_id 
      WHERE id = p_entity_id;
      
      v_success := true;
      
    WHEN 'page' THEN
      UPDATE page_galleries 
      SET is_featured = false 
      WHERE page_id = p_entity_id 
      AND (p_gallery_type IS NULL OR gallery_type = p_gallery_type);
      
      UPDATE page_galleries 
      SET is_featured = true 
      WHERE page_id = p_entity_id 
      AND gallery_id = p_gallery_id;
      
      UPDATE pages 
      SET default_gallery_id = p_gallery_id 
      WHERE id = p_entity_id;
      
      v_success := true;
      
    WHEN 'user_profile' THEN
      UPDATE user_profile_galleries 
      SET is_featured = false 
      WHERE user_id = p_entity_id 
      AND (p_gallery_type IS NULL OR gallery_type = p_gallery_type);
      
      UPDATE user_profile_galleries 
      SET is_featured = true 
      WHERE user_id = p_entity_id 
      AND gallery_id = p_gallery_id;
      
      UPDATE members 
      SET featured_gallery_id = p_gallery_id 
      WHERE id = p_entity_id;
      
      v_success := true;
      
    WHEN 'marketplace' THEN
      UPDATE marketplace_galleries 
      SET is_featured = false 
      WHERE listing_id = p_entity_id 
      AND (p_gallery_type IS NULL OR gallery_type = p_gallery_type);
      
      UPDATE marketplace_galleries 
      SET is_featured = true 
      WHERE listing_id = p_entity_id 
      AND gallery_id = p_gallery_id;
      
      UPDATE marketplace_listings 
      SET featured_gallery_id = p_gallery_id 
      WHERE id = p_entity_id;
      
      v_success := true;
  END CASE;
  
  RETURN v_success;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- GALLERY STATISTICS FUNCTIONS
-- =====================================================

-- Function to get gallery usage statistics
CREATE OR REPLACE FUNCTION get_gallery_usage_stats()
RETURNS TABLE (
  entity_type VARCHAR(50),
  total_entities BIGINT,
  entities_with_galleries BIGINT,
  total_gallery_relationships BIGINT,
  avg_galleries_per_entity NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  WITH stats AS (
    SELECT 
      'events' as entity_type,
      (SELECT COUNT(*) FROM events) as total_entities,
      (SELECT COUNT(DISTINCT event_id) FROM event_galleries) as entities_with_galleries,
      (SELECT COUNT(*) FROM event_galleries) as total_gallery_relationships
    UNION ALL
    SELECT 
      'news' as entity_type,
      (SELECT COUNT(*) FROM news) as total_entities,
      (SELECT COUNT(DISTINCT news_id) FROM news_galleries) as entities_with_galleries,
      (SELECT COUNT(*) FROM news_galleries) as total_gallery_relationships
    UNION ALL
    SELECT 
      'resources' as entity_type,
      (SELECT COUNT(*) FROM resources) as total_entities,
      (SELECT COUNT(DISTINCT resource_id) FROM resource_galleries) as entities_with_galleries,
      (SELECT COUNT(*) FROM resource_galleries) as total_gallery_relationships
    UNION ALL
    SELECT 
      'pages' as entity_type,
      (SELECT COUNT(*) FROM pages) as total_entities,
      (SELECT COUNT(DISTINCT page_id) FROM page_galleries) as entities_with_galleries,
      (SELECT COUNT(*) FROM page_galleries) as total_gallery_relationships
    UNION ALL
    SELECT 
      'user_profiles' as entity_type,
      (SELECT COUNT(*) FROM members) as total_entities,
      (SELECT COUNT(DISTINCT user_id) FROM user_profile_galleries) as entities_with_galleries,
      (SELECT COUNT(*) FROM user_profile_galleries) as total_gallery_relationships
    UNION ALL
    SELECT 
      'marketplace' as entity_type,
      (SELECT COUNT(*) FROM marketplace_listings) as total_entities,
      (SELECT COUNT(DISTINCT listing_id) FROM marketplace_galleries) as entities_with_galleries,
      (SELECT COUNT(*) FROM marketplace_galleries) as total_gallery_relationships
  )
  SELECT 
    s.entity_type,
    s.total_entities,
    s.entities_with_galleries,
    s.total_gallery_relationships,
    CASE 
      WHEN s.total_entities > 0 THEN ROUND(s.total_gallery_relationships::NUMERIC / s.total_entities, 2)
      ELSE 0
    END as avg_galleries_per_entity
  FROM stats s;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- CLEANUP AND MAINTENANCE FUNCTIONS
-- =====================================================

-- Function to remove broken gallery relationships
CREATE OR REPLACE FUNCTION cleanup_broken_gallery_relationships()
RETURNS TABLE (
  relationship_type VARCHAR(50),
  cleaned_count BIGINT
) AS $$
DECLARE
  v_event_count BIGINT;
  v_news_count BIGINT;
  v_resource_count BIGINT;
  v_page_count BIGINT;
  v_profile_count BIGINT;
  v_marketplace_count BIGINT;
BEGIN
  -- Clean up event galleries with missing galleries
  DELETE FROM event_galleries 
  WHERE gallery_id NOT IN (SELECT id FROM user_galleries);
  GET DIAGNOSTICS v_event_count = ROW_COUNT;
  
  -- Clean up news galleries with missing galleries
  DELETE FROM news_galleries 
  WHERE gallery_id NOT IN (SELECT id FROM user_galleries);
  GET DIAGNOSTICS v_news_count = ROW_COUNT;
  
  -- Clean up resource galleries with missing galleries
  DELETE FROM resource_galleries 
  WHERE gallery_id NOT IN (SELECT id FROM user_galleries);
  GET DIAGNOSTICS v_resource_count = ROW_COUNT;
  
  -- Clean up page galleries with missing galleries
  DELETE FROM page_galleries 
  WHERE gallery_id NOT IN (SELECT id FROM user_galleries);
  GET DIAGNOSTICS v_page_count = ROW_COUNT;
  
  -- Clean up user profile galleries with missing galleries
  DELETE FROM user_profile_galleries 
  WHERE gallery_id NOT IN (SELECT id FROM user_galleries);
  GET DIAGNOSTICS v_profile_count = ROW_COUNT;
  
  -- Clean up marketplace galleries with missing galleries
  DELETE FROM marketplace_galleries 
  WHERE gallery_id NOT IN (SELECT id FROM user_galleries);
  GET DIAGNOSTICS v_marketplace_count = ROW_COUNT;
  
  -- Return results
  RETURN QUERY VALUES 
    ('event_galleries'::VARCHAR(50), v_event_count),
    ('news_galleries'::VARCHAR(50), v_news_count),
    ('resource_galleries'::VARCHAR(50), v_resource_count),
    ('page_galleries'::VARCHAR(50), v_page_count),
    ('user_profile_galleries'::VARCHAR(50), v_profile_count),
    ('marketplace_galleries'::VARCHAR(50), v_marketplace_count);
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION attach_gallery_to_event TO authenticated;
GRANT EXECUTE ON FUNCTION attach_gallery_to_news TO authenticated;
GRANT EXECUTE ON FUNCTION attach_gallery_to_resource TO authenticated;
GRANT EXECUTE ON FUNCTION attach_gallery_to_page TO authenticated;
GRANT EXECUTE ON FUNCTION attach_gallery_to_user_profile TO authenticated;
GRANT EXECUTE ON FUNCTION attach_gallery_to_marketplace TO authenticated;
GRANT EXECUTE ON FUNCTION get_entity_galleries TO authenticated;
GRANT EXECUTE ON FUNCTION set_featured_gallery_for_entity TO authenticated;
GRANT EXECUTE ON FUNCTION get_gallery_usage_stats TO authenticated;

-- Grant cleanup function only to service_role
GRANT EXECUTE ON FUNCTION cleanup_broken_gallery_relationships TO service_role;

-- Grant public access to read-only functions
GRANT EXECUTE ON FUNCTION get_entity_galleries TO anon;
GRANT EXECUTE ON FUNCTION get_gallery_usage_stats TO anon;

COMMIT;