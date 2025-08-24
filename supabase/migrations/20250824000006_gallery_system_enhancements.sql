-- =====================================================
-- GALLERY SYSTEM ENHANCEMENTS AND COMPATIBILITY
-- =====================================================
-- Adds enhancements and ensures compatibility with existing gallery system
-- Includes views, helper functions, and data migration utilities

BEGIN;

-- =====================================================
-- CREATE COMPREHENSIVE GALLERY VIEWS
-- =====================================================

-- View for all entity galleries with unified structure
CREATE OR REPLACE VIEW entity_galleries_unified AS
SELECT 
  'event' as entity_type,
  eg.event_id as entity_id,
  eg.gallery_id,
  ug.title as gallery_title,
  ug.description as gallery_description,
  eg.gallery_type,
  eg.display_order,
  eg.is_featured,
  eg.description as relationship_description,
  ug.photo_count,
  ug.privacy_level,
  ug.visibility,
  ug.user_id as gallery_owner_id,
  ug.owner_type as gallery_owner_type,
  ug.owner_id as gallery_owner_entity_id,
  eg.created_at as relationship_created_at,
  ug.created_at as gallery_created_at,
  e.title as entity_title,
  e.status as entity_status,
  NULL::VARCHAR(50) as display_position
FROM event_galleries eg
JOIN user_galleries ug ON ug.id = eg.gallery_id
JOIN events e ON e.id = eg.event_id

UNION ALL

SELECT 
  'news' as entity_type,
  ng.news_id as entity_id,
  ng.gallery_id,
  ug.title as gallery_title,
  ug.description as gallery_description,
  ng.gallery_type,
  ng.display_order,
  ng.is_featured,
  ng.description as relationship_description,
  ug.photo_count,
  ug.privacy_level,
  ug.visibility,
  ug.user_id as gallery_owner_id,
  ug.owner_type as gallery_owner_type,
  ug.owner_id as gallery_owner_entity_id,
  ng.created_at as relationship_created_at,
  ug.created_at as gallery_created_at,
  n.title as entity_title,
  n.status as entity_status,
  NULL::VARCHAR(50) as display_position
FROM news_galleries ng
JOIN user_galleries ug ON ug.id = ng.gallery_id
JOIN news n ON n.id = ng.news_id

UNION ALL

SELECT 
  'resource' as entity_type,
  rg.resource_id as entity_id,
  rg.gallery_id,
  ug.title as gallery_title,
  ug.description as gallery_description,
  rg.gallery_type,
  rg.display_order,
  rg.is_featured,
  rg.description as relationship_description,
  ug.photo_count,
  ug.privacy_level,
  ug.visibility,
  ug.user_id as gallery_owner_id,
  ug.owner_type as gallery_owner_type,
  ug.owner_id as gallery_owner_entity_id,
  rg.created_at as relationship_created_at,
  ug.created_at as gallery_created_at,
  r.title as entity_title,
  r.status as entity_status,
  NULL::VARCHAR(50) as display_position
FROM resource_galleries rg
JOIN user_galleries ug ON ug.id = rg.gallery_id
JOIN resources r ON r.id = rg.resource_id

UNION ALL

SELECT 
  'page' as entity_type,
  pg.page_id as entity_id,
  pg.gallery_id,
  ug.title as gallery_title,
  ug.description as gallery_description,
  pg.gallery_type,
  pg.display_order,
  pg.is_featured,
  pg.description as relationship_description,
  ug.photo_count,
  ug.privacy_level,
  ug.visibility,
  ug.user_id as gallery_owner_id,
  ug.owner_type as gallery_owner_type,
  ug.owner_id as gallery_owner_entity_id,
  pg.created_at as relationship_created_at,
  ug.created_at as gallery_created_at,
  p.title as entity_title,
  p.status as entity_status,
  pg.display_position
FROM page_galleries pg
JOIN user_galleries ug ON ug.id = pg.gallery_id
JOIN pages p ON p.id = pg.page_id

UNION ALL

SELECT 
  'user_profile' as entity_type,
  upg.user_id as entity_id,
  upg.gallery_id,
  ug.title as gallery_title,
  ug.description as gallery_description,
  upg.gallery_type,
  upg.display_order,
  upg.is_featured,
  upg.description as relationship_description,
  ug.photo_count,
  ug.privacy_level,
  ug.visibility,
  ug.user_id as gallery_owner_id,
  ug.owner_type as gallery_owner_type,
  ug.owner_id as gallery_owner_entity_id,
  upg.created_at as relationship_created_at,
  ug.created_at as gallery_created_at,
  m.name as entity_title,
  m.status as entity_status,
  NULL::VARCHAR(50) as display_position
FROM user_profile_galleries upg
JOIN user_galleries ug ON ug.id = upg.gallery_id
JOIN members m ON m.id = upg.user_id

UNION ALL

SELECT 
  'marketplace' as entity_type,
  mg.listing_id as entity_id,
  mg.gallery_id,
  ug.title as gallery_title,
  ug.description as gallery_description,
  mg.gallery_type,
  mg.display_order,
  mg.is_featured,
  mg.description as relationship_description,
  ug.photo_count,
  ug.privacy_level,
  ug.visibility,
  ug.user_id as gallery_owner_id,
  ug.owner_type as gallery_owner_type,
  ug.owner_id as gallery_owner_entity_id,
  mg.created_at as relationship_created_at,
  ug.created_at as gallery_created_at,
  ml.title as entity_title,
  ml.status as entity_status,
  NULL::VARCHAR(50) as display_position
FROM marketplace_galleries mg
JOIN user_galleries ug ON ug.id = mg.gallery_id
JOIN marketplace_listings ml ON ml.id = mg.listing_id;

-- =====================================================
-- GALLERY SUMMARY VIEW WITH STATISTICS
-- =====================================================

CREATE OR REPLACE VIEW gallery_summary_with_stats AS
SELECT 
  ug.id,
  ug.title,
  ug.description,
  ug.slug,
  ug.user_id,
  ug.owner_type,
  ug.owner_id,
  ug.privacy_level,
  ug.visibility,
  ug.photo_count,
  ug.view_count,
  ug.is_featured,
  ug.created_at,
  ug.updated_at,
  
  -- Entity relationship counts
  COALESCE(event_count.count, 0) as attached_to_events,
  COALESCE(news_count.count, 0) as attached_to_news,
  COALESCE(resource_count.count, 0) as attached_to_resources,
  COALESCE(page_count.count, 0) as attached_to_pages,
  COALESCE(profile_count.count, 0) as attached_to_profiles,
  COALESCE(marketplace_count.count, 0) as attached_to_marketplace,
  
  -- Total entity attachments
  (COALESCE(event_count.count, 0) + 
   COALESCE(news_count.count, 0) + 
   COALESCE(resource_count.count, 0) + 
   COALESCE(page_count.count, 0) + 
   COALESCE(profile_count.count, 0) + 
   COALESCE(marketplace_count.count, 0)) as total_entity_attachments,
   
  -- Owner information
  m.name as owner_name,
  m.slug as owner_slug
  
FROM user_galleries ug
LEFT JOIN members m ON m.id = ug.user_id
LEFT JOIN (
  SELECT gallery_id, COUNT(*) as count 
  FROM event_galleries 
  GROUP BY gallery_id
) event_count ON event_count.gallery_id = ug.id
LEFT JOIN (
  SELECT gallery_id, COUNT(*) as count 
  FROM news_galleries 
  GROUP BY gallery_id
) news_count ON news_count.gallery_id = ug.id
LEFT JOIN (
  SELECT gallery_id, COUNT(*) as count 
  FROM resource_galleries 
  GROUP BY gallery_id
) resource_count ON resource_count.gallery_id = ug.id
LEFT JOIN (
  SELECT gallery_id, COUNT(*) as count 
  FROM page_galleries 
  GROUP BY gallery_id
) page_count ON page_count.gallery_id = ug.id
LEFT JOIN (
  SELECT gallery_id, COUNT(*) as count 
  FROM user_profile_galleries 
  GROUP BY gallery_id
) profile_count ON profile_count.gallery_id = ug.id
LEFT JOIN (
  SELECT gallery_id, COUNT(*) as count 
  FROM marketplace_galleries 
  GROUP BY gallery_id
) marketplace_count ON marketplace_count.gallery_id = ug.id;

-- =====================================================
-- HELPER FUNCTIONS FOR GALLERY OPERATIONS
-- =====================================================

-- Function to bulk attach galleries to multiple entities
CREATE OR REPLACE FUNCTION bulk_attach_gallery_to_entities(
  p_gallery_id UUID,
  p_entity_type VARCHAR(50),
  p_entity_ids UUID[],
  p_gallery_type VARCHAR(50) DEFAULT 'main',
  p_is_featured BOOLEAN DEFAULT false
)
RETURNS INTEGER AS $$
DECLARE
  v_entity_id UUID;
  v_count INTEGER := 0;
BEGIN
  FOREACH v_entity_id IN ARRAY p_entity_ids
  LOOP
    CASE p_entity_type
      WHEN 'event' THEN
        INSERT INTO event_galleries (event_id, gallery_id, gallery_type, is_featured)
        VALUES (v_entity_id, p_gallery_id, p_gallery_type, p_is_featured)
        ON CONFLICT DO NOTHING;
        
      WHEN 'news' THEN
        INSERT INTO news_galleries (news_id, gallery_id, gallery_type, is_featured)
        VALUES (v_entity_id, p_gallery_id, p_gallery_type, p_is_featured)
        ON CONFLICT DO NOTHING;
        
      WHEN 'resource' THEN
        INSERT INTO resource_galleries (resource_id, gallery_id, gallery_type, is_featured)
        VALUES (v_entity_id, p_gallery_id, p_gallery_type, p_is_featured)
        ON CONFLICT DO NOTHING;
        
      WHEN 'page' THEN
        INSERT INTO page_galleries (page_id, gallery_id, gallery_type, is_featured)
        VALUES (v_entity_id, p_gallery_id, p_gallery_type, p_is_featured)
        ON CONFLICT DO NOTHING;
        
      WHEN 'user_profile' THEN
        INSERT INTO user_profile_galleries (user_id, gallery_id, gallery_type, is_featured)
        VALUES (v_entity_id, p_gallery_id, p_gallery_type, p_is_featured)
        ON CONFLICT DO NOTHING;
        
      WHEN 'marketplace' THEN
        INSERT INTO marketplace_galleries (listing_id, gallery_id, gallery_type, is_featured)
        VALUES (v_entity_id, p_gallery_id, p_gallery_type, p_is_featured)
        ON CONFLICT DO NOTHING;
    END CASE;
    
    v_count := v_count + 1;
  END LOOP;
  
  RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- Function to detach gallery from entity
CREATE OR REPLACE FUNCTION detach_gallery_from_entity(
  p_entity_type VARCHAR(50),
  p_entity_id UUID,
  p_gallery_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_deleted_count INTEGER := 0;
BEGIN
  CASE p_entity_type
    WHEN 'event' THEN
      DELETE FROM event_galleries 
      WHERE event_id = p_entity_id AND gallery_id = p_gallery_id;
      GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
      
      -- Clear featured gallery if it was the featured one
      UPDATE events 
      SET featured_gallery_id = NULL 
      WHERE id = p_entity_id AND featured_gallery_id = p_gallery_id;
      
    WHEN 'news' THEN
      DELETE FROM news_galleries 
      WHERE news_id = p_entity_id AND gallery_id = p_gallery_id;
      GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
      
      UPDATE news 
      SET featured_gallery_id = NULL 
      WHERE id = p_entity_id AND featured_gallery_id = p_gallery_id;
      
    WHEN 'resource' THEN
      DELETE FROM resource_galleries 
      WHERE resource_id = p_entity_id AND gallery_id = p_gallery_id;
      GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
      
      UPDATE resources 
      SET featured_gallery_id = NULL 
      WHERE id = p_entity_id AND featured_gallery_id = p_gallery_id;
      
    WHEN 'page' THEN
      DELETE FROM page_galleries 
      WHERE page_id = p_entity_id AND gallery_id = p_gallery_id;
      GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
      
      UPDATE pages 
      SET default_gallery_id = NULL 
      WHERE id = p_entity_id AND default_gallery_id = p_gallery_id;
      
    WHEN 'user_profile' THEN
      DELETE FROM user_profile_galleries 
      WHERE user_id = p_entity_id AND gallery_id = p_gallery_id;
      GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
      
      UPDATE members 
      SET featured_gallery_id = NULL, profile_gallery_id = NULL
      WHERE id = p_entity_id 
      AND (featured_gallery_id = p_gallery_id OR profile_gallery_id = p_gallery_id);
      
    WHEN 'marketplace' THEN
      DELETE FROM marketplace_galleries 
      WHERE listing_id = p_entity_id AND gallery_id = p_gallery_id;
      GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
      
      UPDATE marketplace_listings 
      SET featured_gallery_id = NULL 
      WHERE id = p_entity_id AND featured_gallery_id = p_gallery_id;
  END CASE;
  
  RETURN v_deleted_count > 0;
END;
$$ LANGUAGE plpgsql;

-- Function to reorder galleries for an entity
CREATE OR REPLACE FUNCTION reorder_entity_galleries(
  p_entity_type VARCHAR(50),
  p_entity_id UUID,
  p_gallery_orders JSONB -- Format: [{"gallery_id": "uuid", "display_order": 1}, ...]
)
RETURNS BOOLEAN AS $$
DECLARE
  v_order_item JSONB;
  v_gallery_id UUID;
  v_display_order INTEGER;
BEGIN
  FOR v_order_item IN SELECT * FROM jsonb_array_elements(p_gallery_orders)
  LOOP
    v_gallery_id := (v_order_item ->> 'gallery_id')::UUID;
    v_display_order := (v_order_item ->> 'display_order')::INTEGER;
    
    CASE p_entity_type
      WHEN 'event' THEN
        UPDATE event_galleries 
        SET display_order = v_display_order 
        WHERE event_id = p_entity_id AND gallery_id = v_gallery_id;
        
      WHEN 'news' THEN
        UPDATE news_galleries 
        SET display_order = v_display_order 
        WHERE news_id = p_entity_id AND gallery_id = v_gallery_id;
        
      WHEN 'resource' THEN
        UPDATE resource_galleries 
        SET display_order = v_display_order 
        WHERE resource_id = p_entity_id AND gallery_id = v_gallery_id;
        
      WHEN 'page' THEN
        UPDATE page_galleries 
        SET display_order = v_display_order 
        WHERE page_id = p_entity_id AND gallery_id = v_gallery_id;
        
      WHEN 'user_profile' THEN
        UPDATE user_profile_galleries 
        SET display_order = v_display_order 
        WHERE user_id = p_entity_id AND gallery_id = v_gallery_id;
        
      WHEN 'marketplace' THEN
        UPDATE marketplace_galleries 
        SET display_order = v_display_order 
        WHERE listing_id = p_entity_id AND gallery_id = v_gallery_id;
    END CASE;
  END LOOP;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- MIGRATION HELPER FUNCTIONS
-- =====================================================

-- Function to migrate existing image fields to galleries
CREATE OR REPLACE FUNCTION migrate_existing_images_to_galleries()
RETURNS TABLE (
  entity_type VARCHAR(50),
  migrated_count BIGINT
) AS $$
DECLARE
  v_event_count BIGINT := 0;
  v_news_count BIGINT := 0;
  v_marketplace_count BIGINT := 0;
BEGIN
  -- This is a placeholder function for migrating existing image fields
  -- Implementation would depend on specific image field structures
  
  -- Example for events (if they have image fields to migrate)
  -- INSERT INTO user_galleries (user_id, title, description, ...)
  -- SELECT organizer_id, 'Event Images', 'Migrated from event images', ...
  -- FROM events WHERE image IS NOT NULL;
  
  RETURN QUERY VALUES 
    ('events'::VARCHAR(50), v_event_count),
    ('news'::VARCHAR(50), v_news_count),
    ('marketplace'::VARCHAR(50), v_marketplace_count);
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- GRANT PERMISSIONS FOR NEW FUNCTIONS AND VIEWS
-- =====================================================

-- Grant access to views
GRANT SELECT ON entity_galleries_unified TO authenticated, anon;
GRANT SELECT ON gallery_summary_with_stats TO authenticated, anon;

-- Grant function permissions
GRANT EXECUTE ON FUNCTION bulk_attach_gallery_to_entities TO authenticated;
GRANT EXECUTE ON FUNCTION detach_gallery_from_entity TO authenticated;
GRANT EXECUTE ON FUNCTION reorder_entity_galleries TO authenticated;

-- Migration function only for service_role
GRANT EXECUTE ON FUNCTION migrate_existing_images_to_galleries TO service_role;

-- =====================================================
-- UPDATE TIMESTAMPS TRIGGER
-- =====================================================

-- Function to update timestamps on relationship tables
CREATE OR REPLACE FUNCTION update_gallery_relationship_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for all relationship tables
DROP TRIGGER IF EXISTS trigger_update_event_galleries_timestamp ON event_galleries;
CREATE TRIGGER trigger_update_event_galleries_timestamp
BEFORE UPDATE ON event_galleries
FOR EACH ROW EXECUTE FUNCTION update_gallery_relationship_timestamp();

DROP TRIGGER IF EXISTS trigger_update_news_galleries_timestamp ON news_galleries;
CREATE TRIGGER trigger_update_news_galleries_timestamp
BEFORE UPDATE ON news_galleries
FOR EACH ROW EXECUTE FUNCTION update_gallery_relationship_timestamp();

DROP TRIGGER IF EXISTS trigger_update_resource_galleries_timestamp ON resource_galleries;
CREATE TRIGGER trigger_update_resource_galleries_timestamp
BEFORE UPDATE ON resource_galleries
FOR EACH ROW EXECUTE FUNCTION update_gallery_relationship_timestamp();

DROP TRIGGER IF EXISTS trigger_update_page_galleries_timestamp ON page_galleries;
CREATE TRIGGER trigger_update_page_galleries_timestamp
BEFORE UPDATE ON page_galleries
FOR EACH ROW EXECUTE FUNCTION update_gallery_relationship_timestamp();

DROP TRIGGER IF EXISTS trigger_update_user_profile_galleries_timestamp ON user_profile_galleries;
CREATE TRIGGER trigger_update_user_profile_galleries_timestamp
BEFORE UPDATE ON user_profile_galleries
FOR EACH ROW EXECUTE FUNCTION update_gallery_relationship_timestamp();

DROP TRIGGER IF EXISTS trigger_update_marketplace_galleries_timestamp ON marketplace_galleries;
CREATE TRIGGER trigger_update_marketplace_galleries_timestamp
BEFORE UPDATE ON marketplace_galleries
FOR EACH ROW EXECUTE FUNCTION update_gallery_relationship_timestamp();

-- =====================================================
-- FINAL COMMENTS AND DOCUMENTATION
-- =====================================================

COMMENT ON VIEW entity_galleries_unified IS 'Unified view of all entity-gallery relationships across all entity types';
COMMENT ON VIEW gallery_summary_with_stats IS 'Gallery summary with attachment statistics and owner information';

COMMENT ON FUNCTION bulk_attach_gallery_to_entities IS 'Attach a single gallery to multiple entities of the same type';
COMMENT ON FUNCTION detach_gallery_from_entity IS 'Remove gallery attachment from a specific entity';
COMMENT ON FUNCTION reorder_entity_galleries IS 'Update display order of galleries for a specific entity';

COMMIT;