-- Admin Gallery RPC Functions
-- Creates comprehensive RPC functions for admin gallery management operations

-- Function to get all galleries with admin stats and filtering
CREATE OR REPLACE FUNCTION get_admin_galleries(
  p_filters JSONB DEFAULT '{}',
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  title VARCHAR,
  photo_count INTEGER,
  view_count INTEGER,
  total_file_size BIGINT,
  storage_usage BIGINT,
  privacy_level VARCHAR,
  visibility VARCHAR,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  user_id UUID,
  user_name TEXT,
  user_email TEXT,
  recent_activity TIMESTAMP WITH TIME ZONE,
  flagged_photos_count INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check admin permissions
  IF NOT EXISTS (
    SELECT 1 FROM user_roles ur 
    JOIN roles r ON ur.role_id = r.id 
    WHERE ur.user_id = auth.uid() 
    AND r.name IN ('super_admin', 'admin')
  ) THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;

  RETURN QUERY
  SELECT 
    g.id,
    g.title,
    g.photo_count,
    g.view_count,
    COALESCE(ps.total_file_size, 0) as total_file_size,
    COALESCE(ps.total_file_size, 0) as storage_usage,
    g.privacy_level,
    g.visibility,
    g.created_at,
    g.updated_at,
    g.user_id,
    m.name as user_name,
    m.email as user_email,
    g.updated_at as recent_activity,
    COALESCE(fps.flagged_count, 0) as flagged_photos_count
  FROM user_galleries g
  JOIN members m ON g.user_id = m.id
  LEFT JOIN (
    SELECT 
      gallery_id,
      SUM(file_size) as total_file_size
    FROM gallery_photos
    WHERE visibility = 'visible'
    GROUP BY gallery_id
  ) ps ON g.id = ps.gallery_id
  LEFT JOIN (
    SELECT 
      gallery_id,
      COUNT(*) as flagged_count
    FROM gallery_photos
    WHERE moderation_status = 'flagged'
    GROUP BY gallery_id
  ) fps ON g.id = fps.gallery_id
  WHERE 
    -- Apply search filter
    CASE 
      WHEN p_filters ? 'search' THEN
        (g.title ILIKE '%' || (p_filters->>'search') || '%' OR
         g.description ILIKE '%' || (p_filters->>'search') || '%' OR
         m.name ILIKE '%' || (p_filters->>'search') || '%')
      ELSE TRUE
    END
    -- Apply user filter
    AND CASE 
      WHEN p_filters ? 'user_id' THEN g.user_id = (p_filters->>'user_id')::UUID
      ELSE TRUE
    END
    -- Apply privacy filter
    AND CASE 
      WHEN p_filters ? 'privacy_level' THEN g.privacy_level = (p_filters->>'privacy_level')
      ELSE TRUE
    END
    -- Apply visibility filter
    AND CASE 
      WHEN p_filters ? 'visibility' THEN g.visibility = (p_filters->>'visibility')
      ELSE TRUE
    END
    -- Apply date filters
    AND CASE 
      WHEN p_filters ? 'created_after' THEN g.created_at >= (p_filters->>'created_after')::TIMESTAMP WITH TIME ZONE
      ELSE TRUE
    END
    AND CASE 
      WHEN p_filters ? 'created_before' THEN g.created_at <= (p_filters->>'created_before')::TIMESTAMP WITH TIME ZONE
      ELSE TRUE
    END
    -- Apply photo count filters
    AND CASE 
      WHEN p_filters ? 'min_photos' THEN g.photo_count >= (p_filters->>'min_photos')::INTEGER
      ELSE TRUE
    END
    AND CASE 
      WHEN p_filters ? 'max_photos' THEN g.photo_count <= (p_filters->>'max_photos')::INTEGER
      ELSE TRUE
    END
    -- Apply flagged content filter
    AND CASE 
      WHEN p_filters ? 'has_flagged_content' AND (p_filters->>'has_flagged_content')::BOOLEAN THEN
        fps.flagged_count > 0
      ELSE TRUE
    END
    -- Apply storage usage filters
    AND CASE 
      WHEN p_filters ? 'storage_usage_min' THEN ps.total_file_size >= (p_filters->>'storage_usage_min')::BIGINT
      ELSE TRUE
    END
    AND CASE 
      WHEN p_filters ? 'storage_usage_max' THEN ps.total_file_size <= (p_filters->>'storage_usage_max')::BIGINT
      ELSE TRUE
    END
  ORDER BY 
    CASE 
      WHEN p_filters ? 'sort_by' AND (p_filters->>'sort_by') = 'created_at' THEN g.created_at
      WHEN p_filters ? 'sort_by' AND (p_filters->>'sort_by') = 'updated_at' THEN g.updated_at
      WHEN p_filters ? 'sort_by' AND (p_filters->>'sort_by') = 'photo_count' THEN g.photo_count::TIMESTAMP WITH TIME ZONE
      WHEN p_filters ? 'sort_by' AND (p_filters->>'sort_by') = 'view_count' THEN g.view_count::TIMESTAMP WITH TIME ZONE
      WHEN p_filters ? 'sort_by' AND (p_filters->>'sort_by') = 'storage_usage' THEN ps.total_file_size::TIMESTAMP WITH TIME ZONE
      ELSE g.created_at
    END DESC
  LIMIT p_limit OFFSET p_offset;
END;
$$;

-- Function to get storage analytics
CREATE OR REPLACE FUNCTION get_storage_analytics()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
BEGIN
  -- Check admin permissions
  IF NOT EXISTS (
    SELECT 1 FROM user_roles ur 
    JOIN roles r ON ur.role_id = r.id 
    WHERE ur.user_id = auth.uid() 
    AND r.name IN ('super_admin', 'admin')
  ) THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;

  -- Build comprehensive analytics
  SELECT jsonb_build_object(
    'total_storage_used', COALESCE(total_stats.total_storage, 0),
    'total_photos', COALESCE(total_stats.total_photos, 0),
    'total_galleries', COALESCE(total_stats.total_galleries, 0),
    'average_file_size', COALESCE(total_stats.avg_file_size, 0),
    'storage_by_user', COALESCE(user_stats.users, '[]'::JSONB),
    'storage_by_month', COALESCE(month_stats.months, '[]'::JSONB),
    'largest_files', COALESCE(large_files.files, '[]'::JSONB)
  ) INTO result
  FROM (
    -- Total statistics
    SELECT 
      SUM(gp.file_size) as total_storage,
      COUNT(gp.id) as total_photos,
      COUNT(DISTINCT gp.gallery_id) as total_galleries,
      AVG(gp.file_size)::BIGINT as avg_file_size
    FROM gallery_photos gp
    WHERE gp.visibility = 'visible'
  ) total_stats,
  (
    -- Storage by user
    SELECT jsonb_agg(
      jsonb_build_object(
        'user_id', user_id,
        'user_name', user_name,
        'user_email', user_email,
        'storage_used', storage_used,
        'photo_count', photo_count,
        'gallery_count', gallery_count
      )
    ) as users
    FROM (
      SELECT 
        m.id as user_id,
        m.name as user_name,
        m.email as user_email,
        COALESCE(SUM(gp.file_size), 0) as storage_used,
        COUNT(gp.id) as photo_count,
        COUNT(DISTINCT gp.gallery_id) as gallery_count
      FROM members m
      LEFT JOIN gallery_photos gp ON m.id = gp.user_id AND gp.visibility = 'visible'
      GROUP BY m.id, m.name, m.email
      HAVING COUNT(gp.id) > 0
      ORDER BY storage_used DESC
      LIMIT 20
    ) user_storage
  ) user_stats,
  (
    -- Storage by month
    SELECT jsonb_agg(
      jsonb_build_object(
        'month', month,
        'storage_added', storage_added,
        'photos_added', photos_added
      )
    ) as months
    FROM (
      SELECT 
        DATE_TRUNC('month', gp.created_at) as month,
        SUM(gp.file_size) as storage_added,
        COUNT(gp.id) as photos_added
      FROM gallery_photos gp
      WHERE gp.visibility = 'visible'
        AND gp.created_at >= NOW() - INTERVAL '12 months'
      GROUP BY DATE_TRUNC('month', gp.created_at)
      ORDER BY month DESC
    ) monthly_storage
  ) month_stats,
  (
    -- Largest files
    SELECT jsonb_agg(
      jsonb_build_object(
        'id', id,
        'file_name', file_name,
        'file_size', file_size,
        'user_name', user_name,
        'gallery_title', gallery_title
      )
    ) as files
    FROM (
      SELECT 
        gp.id,
        gp.file_name,
        gp.file_size,
        m.name as user_name,
        g.title as gallery_title
      FROM gallery_photos gp
      JOIN members m ON gp.user_id = m.id
      JOIN user_galleries g ON gp.gallery_id = g.id
      WHERE gp.visibility = 'visible'
      ORDER BY gp.file_size DESC
      LIMIT 50
    ) large_files_query
  ) large_files;

  RETURN result;
END;
$$;

-- Function to get photo moderation queue
CREATE OR REPLACE FUNCTION get_photo_moderation_queue(
  p_status TEXT DEFAULT NULL,
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  photo_id UUID,
  gallery_id UUID,
  file_name VARCHAR,
  thumbnail_url TEXT,
  reported_reason TEXT,
  reported_by UUID,
  reported_at TIMESTAMP WITH TIME ZONE,
  status VARCHAR,
  reviewer_notes TEXT,
  photo JSONB,
  user_info JSONB,
  gallery JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check admin permissions
  IF NOT EXISTS (
    SELECT 1 FROM user_roles ur 
    JOIN roles r ON ur.role_id = r.id 
    WHERE ur.user_id = auth.uid() 
    AND r.name IN ('super_admin', 'admin')
  ) THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;

  RETURN QUERY
  SELECT 
    gen_random_uuid() as id, -- Generate ID for moderation queue item
    gp.id as photo_id,
    gp.gallery_id,
    gp.file_name,
    CASE 
      WHEN gp.thumbnail_url IS NOT NULL THEN gp.thumbnail_url
      WHEN gp.thumbnail_path IS NOT NULL THEN 
        (SELECT (storage.objects.public_url('gallery-photos', gp.thumbnail_path)).url)
      ELSE NULL
    END as thumbnail_url,
    'Content review required' as reported_reason, -- Default reason
    NULL::UUID as reported_by, -- Could be enhanced with actual reporting system
    gp.created_at as reported_at,
    gp.moderation_status as status,
    NULL as reviewer_notes, -- Could be enhanced
    jsonb_build_object(
      'id', gp.id,
      'file_name', gp.file_name,
      'title', gp.title,
      'description', gp.description,
      'tags', gp.tags,
      'storage_path', gp.storage_path,
      'thumbnail_url', gp.thumbnail_url,
      'medium_url', gp.medium_url,
      'created_at', gp.created_at
    ) as photo,
    jsonb_build_object(
      'id', m.id,
      'name', m.name,
      'email', m.email
    ) as user_info,
    jsonb_build_object(
      'id', g.id,
      'title', g.title
    ) as gallery
  FROM gallery_photos gp
  JOIN members m ON gp.user_id = m.id
  JOIN user_galleries g ON gp.gallery_id = g.id
  WHERE 
    CASE 
      WHEN p_status IS NOT NULL THEN gp.moderation_status = p_status
      ELSE gp.moderation_status IN ('pending', 'flagged')
    END
  ORDER BY gp.created_at ASC
  LIMIT p_limit OFFSET p_offset;
END;
$$;

-- Function to get moderation status counts
CREATE OR REPLACE FUNCTION get_moderation_status_counts()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
BEGIN
  -- Check admin permissions
  IF NOT EXISTS (
    SELECT 1 FROM user_roles ur 
    JOIN roles r ON ur.role_id = r.id 
    WHERE ur.user_id = auth.uid() 
    AND r.name IN ('super_admin', 'admin')
  ) THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;

  SELECT jsonb_build_object(
    'pending', COALESCE(pending_count, 0),
    'under_review', COALESCE(review_count, 0),
    'flagged', COALESCE(flagged_count, 0),
    'approved', COALESCE(approved_count, 0),
    'rejected', COALESCE(rejected_count, 0)
  ) INTO result
  FROM (
    SELECT 
      COUNT(*) FILTER (WHERE moderation_status = 'pending') as pending_count,
      COUNT(*) FILTER (WHERE moderation_status = 'under_review') as review_count,
      COUNT(*) FILTER (WHERE moderation_status = 'flagged') as flagged_count,
      COUNT(*) FILTER (WHERE moderation_status = 'approved') as approved_count,
      COUNT(*) FILTER (WHERE moderation_status = 'rejected') as rejected_count
    FROM gallery_photos
  ) counts;

  RETURN result;
END;
$$;

-- Function to bulk update photo moderation status
CREATE OR REPLACE FUNCTION bulk_update_photo_moderation(
  p_photo_ids UUID[],
  p_status VARCHAR,
  p_notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  updated_count INTEGER;
  admin_id UUID;
BEGIN
  -- Check admin permissions and get admin ID
  SELECT auth.uid() INTO admin_id;
  
  IF NOT EXISTS (
    SELECT 1 FROM user_roles ur 
    JOIN roles r ON ur.role_id = r.id 
    WHERE ur.user_id = admin_id 
    AND r.name IN ('super_admin', 'admin')
  ) THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;

  -- Validate status
  IF p_status NOT IN ('pending', 'approved', 'rejected', 'flagged') THEN
    RAISE EXCEPTION 'Invalid moderation status';
  END IF;

  -- Update photos
  UPDATE gallery_photos 
  SET 
    moderation_status = p_status,
    updated_at = NOW()
  WHERE id = ANY(p_photo_ids);

  GET DIAGNOSTICS updated_count = ROW_COUNT;

  -- Log the action (could be enhanced with proper audit table)
  INSERT INTO admin_activity_logs (
    admin_id,
    action,
    entity_type,
    details,
    created_at
  ) VALUES (
    admin_id,
    'BULK_MODERATE_PHOTOS',
    'photo',
    jsonb_build_object(
      'photo_ids', p_photo_ids,
      'new_status', p_status,
      'notes', p_notes,
      'updated_count', updated_count
    ),
    NOW()
  );

  RETURN jsonb_build_object(
    'updated_count', updated_count,
    'requested_count', array_length(p_photo_ids, 1),
    'success', true
  );
END;
$$;

-- Function to bulk delete photos with admin privileges
CREATE OR REPLACE FUNCTION bulk_delete_photos_admin(
  p_photo_ids UUID[],
  p_reason TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count INTEGER;
  admin_id UUID;
  photo_info RECORD;
  storage_paths TEXT[];
BEGIN
  -- Check admin permissions and get admin ID
  SELECT auth.uid() INTO admin_id;
  
  IF NOT EXISTS (
    SELECT 1 FROM user_roles ur 
    JOIN roles r ON ur.role_id = r.id 
    WHERE ur.user_id = admin_id 
    AND r.name IN ('super_admin', 'admin')
  ) THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;

  -- Get storage paths for cleanup (would need to be handled externally)
  SELECT array_agg(storage_path) INTO storage_paths
  FROM gallery_photos
  WHERE id = ANY(p_photo_ids);

  -- Delete photos
  DELETE FROM gallery_photos 
  WHERE id = ANY(p_photo_ids);

  GET DIAGNOSTICS deleted_count = ROW_COUNT;

  -- Log the action
  INSERT INTO admin_activity_logs (
    admin_id,
    action,
    entity_type,
    details,
    created_at
  ) VALUES (
    admin_id,
    'BULK_DELETE_PHOTOS',
    'photo',
    jsonb_build_object(
      'photo_ids', p_photo_ids,
      'deleted_count', deleted_count,
      'reason', p_reason,
      'storage_paths', storage_paths
    ),
    NOW()
  );

  RETURN jsonb_build_object(
    'deleted_count', deleted_count,
    'requested_count', array_length(p_photo_ids, 1),
    'storage_paths', storage_paths,
    'success', true
  );
END;
$$;

-- Function to get gallery access permissions (for future ACL implementation)
CREATE OR REPLACE FUNCTION get_gallery_access_control(p_gallery_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
BEGIN
  -- Check admin permissions
  IF NOT EXISTS (
    SELECT 1 FROM user_roles ur 
    JOIN roles r ON ur.role_id = r.id 
    WHERE ur.user_id = auth.uid() 
    AND r.name IN ('super_admin', 'admin')
  ) THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;

  -- For now, return basic info - can be extended with ACL tables
  SELECT jsonb_build_object(
    'gallery_id', g.id,
    'owner', jsonb_build_object(
      'user_id', g.user_id,
      'name', m.name,
      'email', m.email
    ),
    'privacy_level', g.privacy_level,
    'visibility', g.visibility,
    'user_permissions', '[]'::JSONB, -- Placeholder for future ACL
    'role_permissions', '[]'::JSONB   -- Placeholder for future ACL
  ) INTO result
  FROM user_galleries g
  JOIN members m ON g.user_id = m.id
  WHERE g.id = p_gallery_id;

  RETURN COALESCE(result, '{}'::JSONB);
END;
$$;

-- Grant execute permissions to authenticated users (will be restricted by function logic)
GRANT EXECUTE ON FUNCTION get_admin_galleries TO authenticated;
GRANT EXECUTE ON FUNCTION get_storage_analytics TO authenticated;
GRANT EXECUTE ON FUNCTION get_photo_moderation_queue TO authenticated;
GRANT EXECUTE ON FUNCTION get_moderation_status_counts TO authenticated;
GRANT EXECUTE ON FUNCTION bulk_update_photo_moderation TO authenticated;
GRANT EXECUTE ON FUNCTION bulk_delete_photos_admin TO authenticated;
GRANT EXECUTE ON FUNCTION get_gallery_access_control TO authenticated;