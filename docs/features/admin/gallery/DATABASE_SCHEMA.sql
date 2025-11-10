-- Admin Gallery Management Database Schema
-- Extends existing gallery schema with admin-specific views and functions

-- ==================================================
-- ADMIN VIEWS
-- ==================================================

-- Admin Galleries View with extended metadata
CREATE OR REPLACE VIEW admin_galleries AS
SELECT 
  g.*,
  -- Owner information
  CASE 
    WHEN g.owner_type = 'user' THEN 
      (SELECT json_build_object(
        'id', m.id,
        'name', m.name,
        'email', m.email,
        'type', 'user',
        'avatar', m.avatar_url
      ) FROM members m WHERE m.id = g.user_id)
    WHEN g.owner_type = 'group' THEN
      (SELECT json_build_object(
        'id', gr.id,
        'name', gr.name,
        'email', gr.contact_email,
        'type', 'group',
        'avatar', gr.hero_image
      ) FROM groups gr WHERE gr.id = g.owner_id)
    WHEN g.owner_type = 'company' THEN
      (SELECT json_build_object(
        'id', c.id,
        'name', c.name,
        'email', c.contact_email,
        'type', 'company',
        'avatar', c.logo
      ) FROM companies c WHERE c.id = g.owner_id)
    ELSE
      json_build_object('id', g.user_id, 'name', 'Unknown', 'email', '', 'type', 'user', 'avatar', '')
  END as owner,

  -- Photo count
  (SELECT COUNT(*) FROM gallery_photos WHERE gallery_id = g.id) as photo_count,
  
  -- Statistics
  json_build_object(
    'viewCount', COALESCE(g.view_count, 0),
    'likeCount', (SELECT COUNT(*) FROM gallery_likes WHERE gallery_id = g.id),
    'commentCount', (SELECT COUNT(*) FROM photo_comments pc 
                     JOIN gallery_photos gp ON pc.photo_id = gp.id 
                     WHERE gp.gallery_id = g.id),
    'downloadCount', (SELECT COALESCE(SUM(
      CASE 
        WHEN jsonb_typeof(gp.metadata->'stats'->'downloadCount') = 'number' 
        THEN (gp.metadata->'stats'->>'downloadCount')::int 
        ELSE 0 
      END
    ), 0) FROM gallery_photos gp WHERE gp.gallery_id = g.id)
  ) as stats,
  
  -- Moderation status
  CASE 
    WHEN EXISTS(
      SELECT 1 FROM moderation_queue 
      WHERE entity_type = 'gallery' 
      AND entity_id = g.id 
      AND status = 'pending'
    ) THEN 'pending'
    WHEN EXISTS(
      SELECT 1 FROM moderation_queue 
      WHERE entity_type = 'gallery' 
      AND entity_id = g.id 
      AND status = 'rejected'
    ) THEN 'rejected'
    ELSE 'approved'
  END as moderation_status,
  
  -- Last activity
  GREATEST(g.updated_at, 
    COALESCE((SELECT MAX(created_at) FROM gallery_photos WHERE gallery_id = g.id), g.created_at)
  ) as last_activity,
  
  -- Settings
  json_build_object(
    'featured', g.is_featured,
    'allowDownload', COALESCE((g.settings->>'allowDownload')::boolean, true),
    'allowComments', COALESCE((g.settings->>'allowComments')::boolean, true),
    'watermarkEnabled', COALESCE((g.settings->>'watermark')::boolean, false)
  ) as admin_settings

FROM user_galleries g
WHERE g.visibility != 'deleted';

-- Admin Photos View with extended metadata
CREATE OR REPLACE VIEW admin_photos AS
SELECT 
  p.*,
  
  -- Gallery information
  g.title as gallery_title,
  g.privacy_level as gallery_privacy,
  
  -- Uploader information
  (SELECT json_build_object(
    'id', m.id,
    'name', m.name,
    'email', m.email,
    'avatar', m.avatar_url
  ) FROM members m WHERE m.id = p.user_id) as uploader,
  
  -- Moderation status
  CASE 
    WHEN EXISTS(
      SELECT 1 FROM moderation_queue 
      WHERE entity_type = 'photo' 
      AND entity_id = p.id 
      AND status = 'pending'
    ) THEN 'pending'
    WHEN EXISTS(
      SELECT 1 FROM moderation_queue 
      WHERE entity_type = 'photo' 
      AND entity_id = p.id 
      AND status = 'rejected'
    ) THEN 'rejected'
    ELSE 'approved'
  END as moderation_status,
  
  -- Statistics
  json_build_object(
    'viewCount', COALESCE((p.metadata->'stats'->>'viewCount')::int, 0),
    'downloadCount', COALESCE((p.metadata->'stats'->>'downloadCount')::int, 0),
    'likeCount', (SELECT COUNT(*) FROM photo_likes WHERE photo_id = p.id),
    'commentCount', (SELECT COUNT(*) FROM photo_comments WHERE photo_id = p.id AND moderation_status = 'approved')
  ) as stats,
  
  -- Processing info
  COALESCE(p.processing_status, 'completed') as processing_status,
  
  -- Cover photo indicator
  (g.cover_photo_id = p.id) as is_cover,
  
  -- Last modification tracking
  GREATEST(p.updated_at, p.created_at) as last_modified

FROM gallery_photos p
JOIN user_galleries g ON p.gallery_id = g.id
WHERE p.visibility != 'deleted';

-- ==================================================
-- MODERATION QUEUE TABLE
-- ==================================================

CREATE TABLE IF NOT EXISTS moderation_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type VARCHAR(20) NOT NULL CHECK (entity_type IN ('gallery', 'photo', 'comment')),
  entity_id UUID NOT NULL,
  action VARCHAR(20) NOT NULL CHECK (action IN ('create', 'update', 'report', 'flag')),
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  priority VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  
  -- Submission info
  submitted_by UUID REFERENCES auth.users(id),
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  submission_data JSONB,
  
  -- Review info
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  
  -- Auto-detection flags
  auto_flags TEXT[],
  confidence_score DECIMAL(3,2),
  
  -- Report details (if action = 'report')
  report_reason TEXT,
  report_details JSONB,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for moderation queue
CREATE INDEX IF NOT EXISTS idx_moderation_queue_status ON moderation_queue(status);
CREATE INDEX IF NOT EXISTS idx_moderation_queue_entity ON moderation_queue(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_moderation_queue_priority ON moderation_queue(priority, created_at);
CREATE INDEX IF NOT EXISTS idx_moderation_queue_submitted ON moderation_queue(submitted_by, submitted_at);

-- ==================================================
-- ADMIN STATISTICS FUNCTIONS
-- ==================================================

-- Function to get gallery aggregations
CREATE OR REPLACE FUNCTION get_gallery_aggregations(filters JSONB DEFAULT '{}')
RETURNS JSONB AS $$
DECLARE
  result JSONB;
  base_query TEXT;
  where_conditions TEXT[] DEFAULT ARRAY[]::TEXT[];
BEGIN
  -- Build where conditions based on filters
  IF filters ? 'privacyLevel' AND jsonb_array_length(filters->'privacyLevel') > 0 THEN
    where_conditions := array_append(where_conditions, 
      format('privacy_level = ANY(%L)', 
        array(SELECT jsonb_array_elements_text(filters->'privacyLevel'))));
  END IF;
  
  IF filters ? 'visibility' AND jsonb_array_length(filters->'visibility') > 0 THEN
    where_conditions := array_append(where_conditions, 
      format('visibility = ANY(%L)', 
        array(SELECT jsonb_array_elements_text(filters->'visibility'))));
  END IF;
  
  IF filters ? 'moderationStatus' AND jsonb_array_length(filters->'moderationStatus') > 0 THEN
    where_conditions := array_append(where_conditions, 
      format('moderation_status = ANY(%L)', 
        array(SELECT jsonb_array_elements_text(filters->'moderationStatus'))));
  END IF;

  -- Build base query
  base_query := 'SELECT * FROM admin_galleries';
  IF array_length(where_conditions, 1) > 0 THEN
    base_query := base_query || ' WHERE ' || array_to_string(where_conditions, ' AND ');
  END IF;

  -- Execute aggregation queries
  EXECUTE format('
    SELECT json_build_object(
      ''byPrivacyLevel'', (
        SELECT json_object_agg(privacy_level, count)
        FROM (
          SELECT privacy_level, COUNT(*) as count
          FROM (%s) sub
          GROUP BY privacy_level
        ) privacy_counts
      ),
      ''byModerationStatus'', (
        SELECT json_object_agg(moderation_status, count)
        FROM (
          SELECT moderation_status, COUNT(*) as count
          FROM (%s) sub
          GROUP BY moderation_status
        ) mod_counts
      ),
      ''byOwnerType'', (
        SELECT json_object_agg(owner_type, count)
        FROM (
          SELECT owner_type, COUNT(*) as count
          FROM (%s) sub
          GROUP BY owner_type
        ) owner_counts
      ),
      ''totalPhotos'', (
        SELECT COALESCE(SUM(photo_count), 0)
        FROM (%s) sub
      ),
      ''totalViews'', (
        SELECT COALESCE(SUM(view_count), 0)
        FROM (%s) sub
      )
    )', base_query, base_query, base_query, base_query, base_query)
  INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get photo aggregations
CREATE OR REPLACE FUNCTION get_photo_aggregations(gallery_id UUID, filters JSONB DEFAULT '{}')
RETURNS JSONB AS $$
DECLARE
  result JSONB;
  base_query TEXT;
  where_conditions TEXT[] DEFAULT ARRAY[]::TEXT[];
BEGIN
  -- Always filter by gallery
  where_conditions := array_append(where_conditions, format('gallery_id = %L', gallery_id));
  
  -- Build additional where conditions
  IF filters ? 'visibility' AND jsonb_array_length(filters->'visibility') > 0 THEN
    where_conditions := array_append(where_conditions, 
      format('visibility = ANY(%L)', 
        array(SELECT jsonb_array_elements_text(filters->'visibility'))));
  END IF;
  
  IF filters ? 'processingStatus' AND jsonb_array_length(filters->'processingStatus') > 0 THEN
    where_conditions := array_append(where_conditions, 
      format('processing_status = ANY(%L)', 
        array(SELECT jsonb_array_elements_text(filters->'processingStatus'))));
  END IF;

  -- Build base query
  base_query := 'SELECT * FROM admin_photos WHERE ' || array_to_string(where_conditions, ' AND ');

  -- Execute aggregation queries
  EXECUTE format('
    SELECT json_build_object(
      ''byModerationStatus'', (
        SELECT json_object_agg(moderation_status, count)
        FROM (
          SELECT moderation_status, COUNT(*) as count
          FROM (%s) sub
          GROUP BY moderation_status
        ) mod_counts
      ),
      ''byProcessingStatus'', (
        SELECT json_object_agg(processing_status, count)
        FROM (
          SELECT processing_status, COUNT(*) as count
          FROM (%s) sub
          GROUP BY processing_status
        ) proc_counts
      ),
      ''totalFileSize'', (
        SELECT COALESCE(SUM(file_size), 0)
        FROM (%s) sub
      ),
      ''averageFileSize'', (
        SELECT COALESCE(AVG(file_size), 0)
        FROM (%s) sub
      )
    )', base_query, base_query, base_query, base_query)
  INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==================================================
-- BULK OPERATION FUNCTIONS
-- ==================================================

-- Function for bulk gallery updates
CREATE OR REPLACE FUNCTION admin_bulk_update_galleries(
  gallery_ids UUID[],
  operation_type TEXT,
  payload JSONB DEFAULT '{}'
)
RETURNS TABLE (
  id UUID,
  success BOOLEAN,
  error_message TEXT
) AS $$
DECLARE
  gallery_id UUID;
  update_data JSONB;
BEGIN
  -- Validate operation type
  IF operation_type NOT IN ('delete', 'privacy', 'visibility', 'feature', 'moderate', 'transfer') THEN
    RAISE EXCEPTION 'Invalid operation type: %', operation_type;
  END IF;

  FOREACH gallery_id IN ARRAY gallery_ids LOOP
    BEGIN
      CASE operation_type
        WHEN 'delete' THEN
          -- Soft delete - move to archived status
          UPDATE user_galleries 
          SET visibility = 'archived', updated_at = NOW()
          WHERE user_galleries.id = gallery_id;
          
        WHEN 'privacy' THEN
          IF payload ? 'privacyLevel' THEN
            UPDATE user_galleries 
            SET privacy_level = (payload->>'privacyLevel'), updated_at = NOW()
            WHERE user_galleries.id = gallery_id;
          END IF;
          
        WHEN 'visibility' THEN
          IF payload ? 'visibility' THEN
            UPDATE user_galleries 
            SET visibility = (payload->>'visibility'), updated_at = NOW()
            WHERE user_galleries.id = gallery_id;
          END IF;
          
        WHEN 'feature' THEN
          IF payload ? 'featured' THEN
            UPDATE user_galleries 
            SET is_featured = (payload->>'featured')::boolean, updated_at = NOW()
            WHERE user_galleries.id = gallery_id;
          END IF;
          
        WHEN 'moderate' THEN
          -- Update moderation status
          INSERT INTO moderation_queue (entity_type, entity_id, action, status, reviewed_by, reviewed_at, review_notes)
          VALUES ('gallery', gallery_id, 'update', 
                  COALESCE(payload->>'moderationStatus', 'approved'),
                  auth.uid(), NOW(), payload->>'moderationNotes')
          ON CONFLICT (entity_type, entity_id) DO UPDATE
          SET status = EXCLUDED.status,
              reviewed_by = EXCLUDED.reviewed_by,
              reviewed_at = EXCLUDED.reviewed_at,
              review_notes = EXCLUDED.review_notes;
              
        WHEN 'transfer' THEN
          IF payload ? 'transferToUserId' THEN
            UPDATE user_galleries 
            SET user_id = (payload->>'transferToUserId')::UUID, updated_at = NOW()
            WHERE user_galleries.id = gallery_id;
          END IF;
      END CASE;
      
      RETURN QUERY SELECT gallery_id, TRUE, NULL::TEXT;
      
    EXCEPTION WHEN OTHERS THEN
      RETURN QUERY SELECT gallery_id, FALSE, SQLERRM;
    END;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function for bulk photo updates
CREATE OR REPLACE FUNCTION admin_bulk_update_photos(
  photo_ids UUID[],
  operation_type TEXT,
  payload JSONB DEFAULT '{}'
)
RETURNS TABLE (
  id UUID,
  success BOOLEAN,
  error_message TEXT
) AS $$
DECLARE
  photo_id UUID;
BEGIN
  -- Validate operation type
  IF operation_type NOT IN ('delete', 'visibility', 'move', 'tag', 'moderate', 'reprocess') THEN
    RAISE EXCEPTION 'Invalid operation type: %', operation_type;
  END IF;

  FOREACH photo_id IN ARRAY photo_ids LOOP
    BEGIN
      CASE operation_type
        WHEN 'delete' THEN
          -- Soft delete
          UPDATE gallery_photos 
          SET visibility = 'deleted', updated_at = NOW()
          WHERE gallery_photos.id = photo_id;
          
        WHEN 'visibility' THEN
          IF payload ? 'visibility' THEN
            UPDATE gallery_photos 
            SET visibility = (payload->>'visibility'), updated_at = NOW()
            WHERE gallery_photos.id = photo_id;
          END IF;
          
        WHEN 'move' THEN
          IF payload ? 'targetGalleryId' THEN
            UPDATE gallery_photos 
            SET gallery_id = (payload->>'targetGalleryId')::UUID, updated_at = NOW()
            WHERE gallery_photos.id = photo_id;
          END IF;
          
        WHEN 'tag' THEN
          -- Add or remove tags
          IF payload ? 'addTags' THEN
            UPDATE gallery_photos 
            SET tags = COALESCE(tags, ARRAY[]::TEXT[]) || 
                      array(SELECT jsonb_array_elements_text(payload->'addTags')),
                updated_at = NOW()
            WHERE gallery_photos.id = photo_id;
          END IF;
          
          IF payload ? 'removeTags' THEN
            UPDATE gallery_photos 
            SET tags = array(
              SELECT unnest(tags) 
              EXCEPT 
              SELECT jsonb_array_elements_text(payload->'removeTags')
            ),
            updated_at = NOW()
            WHERE gallery_photos.id = photo_id;
          END IF;
          
        WHEN 'moderate' THEN
          -- Update moderation status
          INSERT INTO moderation_queue (entity_type, entity_id, action, status, reviewed_by, reviewed_at, review_notes)
          VALUES ('photo', photo_id, 'update', 
                  COALESCE(payload->>'moderationStatus', 'approved'),
                  auth.uid(), NOW(), payload->>'moderationNotes')
          ON CONFLICT (entity_type, entity_id) DO UPDATE
          SET status = EXCLUDED.status,
              reviewed_by = EXCLUDED.reviewed_by,
              reviewed_at = EXCLUDED.reviewed_at,
              review_notes = EXCLUDED.review_notes;
              
        WHEN 'reprocess' THEN
          -- Mark for reprocessing
          UPDATE gallery_photos 
          SET processing_status = 'pending', updated_at = NOW()
          WHERE gallery_photos.id = photo_id;
      END CASE;
      
      RETURN QUERY SELECT photo_id, TRUE, NULL::TEXT;
      
    EXCEPTION WHEN OTHERS THEN
      RETURN QUERY SELECT photo_id, FALSE, SQLERRM;
    END;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==================================================
-- MODERATION FUNCTIONS
-- ==================================================

-- Function to process moderation decisions
CREATE OR REPLACE FUNCTION process_moderation_decision(
  item_id UUID,
  action TEXT,
  notes TEXT DEFAULT NULL,
  additional_actions JSONB DEFAULT '{}'
)
RETURNS BOOLEAN AS $$
DECLARE
  mod_item RECORD;
BEGIN
  -- Validate action
  IF action NOT IN ('approve', 'reject') THEN
    RAISE EXCEPTION 'Invalid moderation action: %', action;
  END IF;

  -- Get moderation item
  SELECT * INTO mod_item FROM moderation_queue WHERE id = item_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Moderation item not found: %', item_id;
  END IF;

  -- Update moderation status
  UPDATE moderation_queue
  SET 
    status = CASE WHEN action = 'approve' THEN 'approved' ELSE 'rejected' END,
    reviewed_by = auth.uid(),
    reviewed_at = NOW(),
    review_notes = notes,
    updated_at = NOW()
  WHERE id = item_id;

  -- Apply decision to entity
  IF mod_item.entity_type = 'gallery' THEN
    IF action = 'approve' THEN
      UPDATE user_galleries 
      SET visibility = 'visible', updated_at = NOW()
      WHERE id = mod_item.entity_id;
    ELSE
      UPDATE user_galleries 
      SET visibility = 'hidden', updated_at = NOW()
      WHERE id = mod_item.entity_id;
    END IF;
  ELSIF mod_item.entity_type = 'photo' THEN
    IF action = 'approve' THEN
      UPDATE gallery_photos 
      SET visibility = 'visible', updated_at = NOW()
      WHERE id = mod_item.entity_id;
    ELSE
      UPDATE gallery_photos 
      SET visibility = 'hidden', updated_at = NOW()
      WHERE id = mod_item.entity_id;
    END IF;
  END IF;

  -- Handle additional actions
  IF additional_actions ? 'deleteContent' AND (additional_actions->>'deleteContent')::boolean THEN
    IF mod_item.entity_type = 'gallery' THEN
      UPDATE user_galleries 
      SET visibility = 'deleted', updated_at = NOW()
      WHERE id = mod_item.entity_id;
    ELSIF mod_item.entity_type = 'photo' THEN
      UPDATE gallery_photos 
      SET visibility = 'deleted', updated_at = NOW()
      WHERE id = mod_item.entity_id;
    END IF;
  END IF;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==================================================
-- ANALYTICS FUNCTIONS
-- ==================================================

-- Function to get admin dashboard statistics
CREATE OR REPLACE FUNCTION get_admin_dashboard_stats()
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT json_build_object(
    'overview', json_build_object(
      'totalGalleries', (SELECT COUNT(*) FROM user_galleries WHERE visibility != 'deleted'),
      'totalPhotos', (SELECT COUNT(*) FROM gallery_photos WHERE visibility != 'deleted'),
      'totalUsers', (SELECT COUNT(DISTINCT user_id) FROM user_galleries),
      'storageUsed', (SELECT COALESCE(SUM(file_size), 0) FROM gallery_photos WHERE visibility != 'deleted'),
      'storageLimit', 107374182400 -- 100GB in bytes, make this configurable
    ),
    'recentActivity', json_build_object(
      'galleriesCreated', (SELECT COUNT(*) FROM user_galleries WHERE created_at >= NOW() - INTERVAL '30 days'),
      'photosUploaded', (SELECT COUNT(*) FROM gallery_photos WHERE created_at >= NOW() - INTERVAL '30 days'),
      'moderationItems', (SELECT COUNT(*) FROM moderation_queue WHERE status = 'pending'),
      'reportedContent', (SELECT COUNT(*) FROM moderation_queue WHERE action = 'report' AND status = 'pending')
    ),
    'topGalleries', (
      SELECT json_agg(json_build_object(
        'id', id,
        'title', title,
        'views', view_count,
        'photoCount', photo_count,
        'thumbnail', cover_photo_url
      ))
      FROM (
        SELECT id, title, view_count, photo_count, cover_photo_url
        FROM admin_galleries 
        WHERE visibility = 'visible'
        ORDER BY view_count DESC 
        LIMIT 5
      ) top_galleries
    ),
    'moderationQueue', json_build_object(
      'pending', (SELECT COUNT(*) FROM moderation_queue WHERE status = 'pending'),
      'urgent', (SELECT COUNT(*) FROM moderation_queue WHERE status = 'pending' AND priority = 'urgent'),
      'avgResolutionTime', (
        SELECT EXTRACT(EPOCH FROM AVG(reviewed_at - created_at)) / 3600
        FROM moderation_queue 
        WHERE reviewed_at IS NOT NULL 
        AND reviewed_at >= NOW() - INTERVAL '30 days'
      )
    ),
    'systemHealth', json_build_object(
      'uploadSuccess', 95.5, -- Mock data, implement actual tracking
      'processingSuccess', 98.2, -- Mock data, implement actual tracking
      'averageUploadTime', 2.3, -- Mock data, implement actual tracking
      'averageProcessingTime', 8.7 -- Mock data, implement actual tracking
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get gallery analytics
CREATE OR REPLACE FUNCTION get_gallery_analytics(gallery_id UUID, timeframe TEXT)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
  start_date TIMESTAMPTZ;
BEGIN
  -- Calculate start date based on timeframe
  CASE timeframe
    WHEN '24h' THEN start_date := NOW() - INTERVAL '24 hours';
    WHEN '7d' THEN start_date := NOW() - INTERVAL '7 days';
    WHEN '30d' THEN start_date := NOW() - INTERVAL '30 days';
    WHEN '90d' THEN start_date := NOW() - INTERVAL '90 days';
    WHEN '1y' THEN start_date := NOW() - INTERVAL '1 year';
    ELSE start_date := NOW() - INTERVAL '30 days';
  END CASE;

  -- Build analytics object
  SELECT json_build_object(
    'galleryId', gallery_id,
    'timeframe', timeframe,
    'metrics', json_build_object(
      'views', json_build_object(
        'total', g.view_count,
        'unique', g.view_count, -- Mock data, implement proper tracking
        'trend', 5.2 -- Mock percentage change
      ),
      'photos', json_build_object(
        'total', (SELECT COUNT(*) FROM gallery_photos WHERE gallery_id = g.id AND visibility != 'deleted'),
        'uploaded', (SELECT COUNT(*) FROM gallery_photos WHERE gallery_id = g.id AND created_at >= start_date),
        'deleted', 0 -- Mock data
      ),
      'engagement', json_build_object(
        'likes', (SELECT COUNT(*) FROM gallery_likes WHERE gallery_id = g.id),
        'comments', (SELECT COUNT(*) FROM photo_comments pc 
                      JOIN gallery_photos gp ON pc.photo_id = gp.id 
                      WHERE gp.gallery_id = g.id AND pc.moderation_status = 'approved'),
        'downloads', 0, -- Mock data, implement tracking
        'shares', 0 -- Mock data, implement tracking
      ),
      'performance', json_build_object(
        'loadTime', 1.2, -- Mock data
        'errorRate', 0.1 -- Mock data
      )
    ),
    'topPhotos', (
      SELECT json_agg(json_build_object(
        'photoId', id,
        'title', title,
        'views', COALESCE((metadata->'stats'->>'viewCount')::int, 0),
        'thumbnail', thumbnail_url
      ))
      FROM (
        SELECT id, title, metadata, thumbnail_url
        FROM gallery_photos 
        WHERE gallery_id = g.id AND visibility = 'visible'
        ORDER BY COALESCE((metadata->'stats'->>'viewCount')::int, 0) DESC
        LIMIT 5
      ) top_photos
    )
  ) INTO result
  FROM user_galleries g
  WHERE g.id = gallery_id;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==================================================
-- RLS POLICIES FOR ADMIN VIEWS
-- ==================================================

-- Enable RLS on moderation queue
ALTER TABLE moderation_queue ENABLE ROW LEVEL SECURITY;

-- Admin access to moderation queue
CREATE POLICY admin_moderation_queue_access ON moderation_queue
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
      AND r.name IN ('admin', 'moderator')
    )
  );

-- Users can see their own submitted items
CREATE POLICY user_own_moderation_submissions ON moderation_queue
  FOR SELECT USING (submitted_by = auth.uid());

-- ==================================================
-- TRIGGERS FOR AUTOMATED MODERATION
-- ==================================================

-- Function to auto-flag content for moderation
CREATE OR REPLACE FUNCTION auto_flag_content()
RETURNS TRIGGER AS $$
BEGIN
  -- Simple content flagging logic (expand as needed)
  IF TG_TABLE_NAME = 'user_galleries' THEN
    -- Flag galleries with certain keywords
    IF NEW.title ~* '(test|spam|fake)' OR NEW.description ~* '(test|spam|fake)' THEN
      INSERT INTO moderation_queue (entity_type, entity_id, action, priority, auto_flags)
      VALUES ('gallery', NEW.id, 'flag', 'medium', ARRAY['keyword_detected']);
    END IF;
  ELSIF TG_TABLE_NAME = 'gallery_photos' THEN
    -- Flag large files or suspicious content
    IF NEW.file_size > 50 * 1024 * 1024 THEN -- 50MB
      INSERT INTO moderation_queue (entity_type, entity_id, action, priority, auto_flags)
      VALUES ('photo', NEW.id, 'flag', 'low', ARRAY['large_file']);
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers for auto-flagging
CREATE TRIGGER auto_flag_galleries
  AFTER INSERT ON user_galleries
  FOR EACH ROW EXECUTE FUNCTION auto_flag_content();

CREATE TRIGGER auto_flag_photos
  AFTER INSERT ON gallery_photos
  FOR EACH ROW EXECUTE FUNCTION auto_flag_content();

-- ==================================================
-- INDEXES FOR PERFORMANCE
-- ==================================================

-- Indexes for admin views
CREATE INDEX IF NOT EXISTS idx_user_galleries_admin ON user_galleries(visibility, moderation_status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_gallery_photos_admin ON gallery_photos(gallery_id, visibility, processing_status);
CREATE INDEX IF NOT EXISTS idx_gallery_photos_stats ON gallery_photos USING GIN ((metadata->'stats'));

-- Indexes for analytics
CREATE INDEX IF NOT EXISTS idx_user_galleries_views ON user_galleries(view_count DESC) WHERE visibility = 'visible';
CREATE INDEX IF NOT EXISTS idx_gallery_photos_created ON gallery_photos(created_at DESC) WHERE visibility != 'deleted';

-- Full-text search indexes
CREATE INDEX IF NOT EXISTS idx_user_galleries_search ON user_galleries USING GIN (to_tsvector('english', title || ' ' || COALESCE(description, '')));
CREATE INDEX IF NOT EXISTS idx_gallery_photos_search ON gallery_photos USING GIN (to_tsvector('english', title || ' ' || COALESCE(description, '')));

-- ==================================================
-- CLEANUP FUNCTIONS
-- ==================================================

-- Function to cleanup old moderation records
CREATE OR REPLACE FUNCTION cleanup_old_moderation_records()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Delete resolved moderation records older than 6 months
  DELETE FROM moderation_queue 
  WHERE status IN ('approved', 'rejected') 
  AND reviewed_at < NOW() - INTERVAL '6 months';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update gallery stats
CREATE OR REPLACE FUNCTION update_gallery_stats()
RETURNS INTEGER AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  -- Update photo counts for all galleries
  UPDATE user_galleries 
  SET photo_count = (
    SELECT COUNT(*) 
    FROM gallery_photos 
    WHERE gallery_id = user_galleries.id 
    AND visibility != 'deleted'
  ),
  updated_at = NOW()
  WHERE photo_count != (
    SELECT COUNT(*) 
    FROM gallery_photos 
    WHERE gallery_id = user_galleries.id 
    AND visibility != 'deleted'
  );
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  
  RETURN updated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==================================================
-- GRANTS AND PERMISSIONS
-- ==================================================

-- Grant access to admin roles
GRANT SELECT, INSERT, UPDATE, DELETE ON moderation_queue TO authenticated;
GRANT SELECT ON admin_galleries TO authenticated;
GRANT SELECT ON admin_photos TO authenticated;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION get_gallery_aggregations(JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION get_photo_aggregations(UUID, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION admin_bulk_update_galleries(UUID[], TEXT, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION admin_bulk_update_photos(UUID[], TEXT, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION process_moderation_decision(UUID, TEXT, TEXT, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION get_admin_dashboard_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION get_gallery_analytics(UUID, TEXT) TO authenticated;