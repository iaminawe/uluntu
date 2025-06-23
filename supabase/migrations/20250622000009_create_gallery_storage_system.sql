-- Gallery Storage System Migration
-- Creates comprehensive storage buckets, policies, and functions for photo gallery system

-- Create gallery storage bucket for photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'gallery-photos',
  'gallery-photos',
  true,
  52428800, -- 50MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/bmp', 'image/tiff']
) ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Create gallery thumbnails bucket (public for optimized images)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'gallery-thumbnails',
  'gallery-thumbnails',
  true,
  10485760, -- 10MB limit for thumbnails
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Create gallery temp bucket for processing uploads
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'gallery-temp',
  'gallery-temp',
  false,
  52428800, -- 50MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/bmp', 'image/tiff']
) ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Storage policies for gallery-photos bucket
-- Policy: Users can view public gallery photos
CREATE POLICY "Users can view public gallery photos" ON storage.objects
FOR SELECT USING (
  bucket_id = 'gallery-photos' AND
  (
    -- Public photos (path structure: users/{user_id}/galleries/{gallery_id}/originals/{filename})
    EXISTS (
      SELECT 1 FROM user_galleries ug
      JOIN gallery_photos gp ON ug.id = gp.gallery_id
      WHERE ug.privacy_level = 'public' 
        AND ug.visibility = 'visible'
        AND gp.visibility = 'visible'
        AND gp.moderation_status = 'approved'
        AND storage.objects.name = gp.storage_path
    )
    OR
    -- Users can view their own photos
    (auth.uid()::text = (string_to_array(storage.objects.name, '/'))[2])
  )
);

-- Policy: Users can upload to their own folder
CREATE POLICY "Users can upload to their own gallery folder" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'gallery-photos' AND
  auth.uid()::text = (string_to_array(name, '/'))[2] AND
  name ~ '^users/[0-9a-f-]+/galleries/[0-9a-f-]+/(originals|thumbnails|medium)/[^/]+\.(jpg|jpeg|png|webp|gif|bmp|tiff)$'
);

-- Policy: Users can update their own photos
CREATE POLICY "Users can update their own gallery photos" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'gallery-photos' AND
  auth.uid()::text = (string_to_array(name, '/'))[2]
) WITH CHECK (
  bucket_id = 'gallery-photos' AND
  auth.uid()::text = (string_to_array(name, '/'))[2]
);

-- Policy: Users can delete their own photos
CREATE POLICY "Users can delete their own gallery photos" ON storage.objects
FOR DELETE USING (
  bucket_id = 'gallery-photos' AND
  auth.uid()::text = (string_to_array(name, '/'))[2]
);

-- Storage policies for gallery-thumbnails bucket
-- Policy: Anyone can view thumbnails (public bucket)
CREATE POLICY "Anyone can view gallery thumbnails" ON storage.objects
FOR SELECT USING (
  bucket_id = 'gallery-thumbnails'
);

-- Policy: Users can upload thumbnails to their own folder
CREATE POLICY "Users can upload thumbnails to their own folder" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'gallery-thumbnails' AND
  auth.uid()::text = (string_to_array(name, '/'))[2] AND
  name ~ '^users/[0-9a-f-]+/galleries/[0-9a-f-]+/(thumbs|medium)/[^/]+\.(jpg|jpeg|png|webp)$'
);

-- Policy: Users can update their own thumbnails
CREATE POLICY "Users can update their own thumbnails" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'gallery-thumbnails' AND
  auth.uid()::text = (string_to_array(name, '/'))[2]
) WITH CHECK (
  bucket_id = 'gallery-thumbnails' AND
  auth.uid()::text = (string_to_array(name, '/'))[2]
);

-- Policy: Users can delete their own thumbnails
CREATE POLICY "Users can delete their own thumbnails" ON storage.objects
FOR DELETE USING (
  bucket_id = 'gallery-thumbnails' AND
  auth.uid()::text = (string_to_array(name, '/'))[2]
);

-- Storage policies for gallery-temp bucket
-- Policy: Users can upload to their own temp folder
CREATE POLICY "Users can upload to their temp folder" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'gallery-temp' AND
  auth.uid()::text = (string_to_array(name, '/'))[2] AND
  name ~ '^users/[0-9a-f-]+/temp/[^/]+\.(jpg|jpeg|png|webp|gif|bmp|tiff)$'
);

-- Policy: Users can access their own temp files
CREATE POLICY "Users can access their own temp files" ON storage.objects
FOR SELECT USING (
  bucket_id = 'gallery-temp' AND
  auth.uid()::text = (string_to_array(name, '/'))[2]
);

-- Policy: Users can delete their own temp files
CREATE POLICY "Users can delete their own temp files" ON storage.objects
FOR DELETE USING (
  bucket_id = 'gallery-temp' AND
  auth.uid()::text = (string_to_array(name, '/'))[2]
);

-- Create function to generate storage paths
CREATE OR REPLACE FUNCTION generate_gallery_storage_path(
  user_id UUID,
  gallery_id UUID,
  filename TEXT,
  size_variant TEXT DEFAULT 'originals'
) RETURNS TEXT AS $$
DECLARE
  sanitized_filename TEXT;
  file_extension TEXT;
  base_name TEXT;
  timestamp_str TEXT;
BEGIN
  -- Sanitize filename
  file_extension := lower(split_part(filename, '.', -1));
  base_name := regexp_replace(split_part(filename, '.', 1), '[^a-zA-Z0-9_-]', '_', 'g');
  timestamp_str := extract(epoch from now())::bigint::text;
  
  -- Create sanitized filename with timestamp
  sanitized_filename := base_name || '_' || timestamp_str || '.' || file_extension;
  
  -- Return full path
  RETURN 'users/' || user_id::text || '/galleries/' || gallery_id::text || '/' || size_variant || '/' || sanitized_filename;
END;
$$ LANGUAGE plpgsql;

-- Create function to validate file upload
CREATE OR REPLACE FUNCTION validate_gallery_file_upload(
  filename TEXT,
  file_size BIGINT,
  mime_type TEXT
) RETURNS BOOLEAN AS $$
DECLARE
  allowed_types TEXT[] := ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/bmp', 'image/tiff'];
  max_size BIGINT := 52428800; -- 50MB
BEGIN
  -- Check file size
  IF file_size > max_size THEN
    RAISE EXCEPTION 'File size exceeds maximum allowed size of %MB', (max_size / 1048576);
  END IF;
  
  -- Check MIME type
  IF NOT (mime_type = ANY(allowed_types)) THEN
    RAISE EXCEPTION 'File type % is not allowed. Allowed types: %', mime_type, array_to_string(allowed_types, ', ');
  END IF;
  
  -- Check filename
  IF NOT (filename ~ '\.(jpg|jpeg|png|webp|gif|bmp|tiff)$') THEN
    RAISE EXCEPTION 'Invalid file extension. Allowed extensions: jpg, jpeg, png, webp, gif, bmp, tiff';
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Create function to clean up orphaned storage files
CREATE OR REPLACE FUNCTION cleanup_orphaned_gallery_files()
RETURNS INTEGER AS $$
DECLARE
  cleanup_count INTEGER := 0;
  file_record RECORD;
BEGIN
  -- Find storage objects that don't have corresponding gallery_photos records
  FOR file_record IN
    SELECT name FROM storage.objects 
    WHERE bucket_id = 'gallery-photos'
    AND NOT EXISTS (
      SELECT 1 FROM gallery_photos 
      WHERE storage_path = storage.objects.name
    )
    AND created_at < (now() - INTERVAL '24 hours') -- Only clean up files older than 24 hours
  LOOP
    -- Delete the orphaned file
    DELETE FROM storage.objects 
    WHERE bucket_id = 'gallery-photos' AND name = file_record.name;
    
    cleanup_count := cleanup_count + 1;
  END LOOP;
  
  RETURN cleanup_count;
END;
$$ LANGUAGE plpgsql;

-- Create function to get storage usage by user
CREATE OR REPLACE FUNCTION get_user_storage_usage(user_uuid UUID)
RETURNS JSON AS $$
DECLARE
  usage_stats JSON;
BEGIN
  SELECT json_build_object(
    'total_files', COUNT(*),
    'total_size_bytes', COALESCE(SUM(size), 0),
    'total_size_mb', ROUND(COALESCE(SUM(size), 0) / 1048576.0, 2),
    'photos_count', COUNT(*) FILTER (WHERE bucket_id = 'gallery-photos'),
    'thumbnails_count', COUNT(*) FILTER (WHERE bucket_id = 'gallery-thumbnails'),
    'temp_files_count', COUNT(*) FILTER (WHERE bucket_id = 'gallery-temp')
  ) INTO usage_stats
  FROM storage.objects
  WHERE (string_to_array(name, '/'))[2] = user_uuid::text;
  
  RETURN usage_stats;
END;
$$ LANGUAGE plpgsql;

-- Create function to generate thumbnail path from original path
CREATE OR REPLACE FUNCTION generate_thumbnail_path(original_path TEXT, size TEXT DEFAULT 'thumb')
RETURNS TEXT AS $$
DECLARE
  path_parts TEXT[];
  filename TEXT;
  base_name TEXT;
  extension TEXT;
BEGIN
  path_parts := string_to_array(original_path, '/');
  filename := path_parts[array_length(path_parts, 1)];
  
  -- Extract base name and extension
  extension := split_part(filename, '.', -1);
  base_name := split_part(filename, '.', 1);
  
  -- Replace 'originals' with size variant and create new filename
  path_parts[4] := CASE 
    WHEN size = 'thumb' THEN 'thumbs'
    WHEN size = 'medium' THEN 'medium'
    ELSE 'thumbs'
  END;
  
  -- Create optimized filename
  path_parts[array_length(path_parts, 1)] := base_name || '_' || size || '.webp';
  
  RETURN array_to_string(path_parts, '/');
END;
$$ LANGUAGE plpgsql;

-- Create storage configuration table for dynamic settings
CREATE TABLE IF NOT EXISTS storage_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_key VARCHAR(100) NOT NULL UNIQUE,
  config_value JSONB NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insert default storage configuration
INSERT INTO storage_config (config_key, config_value, description) VALUES
('max_file_size', '52428800', 'Maximum file size in bytes (50MB)'),
('allowed_mime_types', '["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif", "image/bmp", "image/tiff"]', 'Allowed MIME types for uploads'),
('thumbnail_sizes', '{"thumb": {"width": 300, "height": 300}, "medium": {"width": 800, "height": 800}}', 'Thumbnail size configurations'),
('auto_cleanup_enabled', 'true', 'Enable automatic cleanup of orphaned files'),
('cleanup_age_hours', '24', 'Age in hours before orphaned files are cleaned up')
ON CONFLICT (config_key) DO UPDATE SET
  config_value = EXCLUDED.config_value,
  updated_at = now();

-- Create indexes for storage performance
CREATE INDEX IF NOT EXISTS idx_storage_objects_name_pattern ON storage.objects(name) WHERE bucket_id IN ('gallery-photos', 'gallery-thumbnails');
CREATE INDEX IF NOT EXISTS idx_storage_objects_bucket_created ON storage.objects(bucket_id, created_at);
CREATE INDEX IF NOT EXISTS idx_storage_config_key ON storage_config(config_key);

-- Enable RLS on storage_config
ALTER TABLE storage_config ENABLE ROW LEVEL SECURITY;

-- RLS policy for storage_config (read-only for authenticated users, admin-only for writes)
CREATE POLICY "Anyone can read storage config" ON storage_config
  FOR SELECT USING (true);

-- Create trigger to update storage_config updated_at
CREATE TRIGGER update_storage_config_updated_at_trigger
  BEFORE UPDATE ON storage_config
  FOR EACH ROW EXECUTE FUNCTION update_photo_gallery_updated_at();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA storage TO authenticated;
GRANT ALL ON storage.objects TO authenticated;
GRANT ALL ON storage.buckets TO authenticated;

-- Create comprehensive views for storage management
CREATE OR REPLACE VIEW storage_usage_by_user AS
SELECT 
  (string_to_array(o.name, '/'))[2]::uuid as user_id,
  m.name as user_name,
  m.email as user_email,
  COUNT(*) as total_files,
  SUM(o.size) as total_size_bytes,
  ROUND(SUM(o.size) / 1048576.0, 2) as total_size_mb,
  COUNT(*) FILTER (WHERE o.bucket_id = 'gallery-photos') as photos_count,
  COUNT(*) FILTER (WHERE o.bucket_id = 'gallery-thumbnails') as thumbnails_count,
  COUNT(*) FILTER (WHERE o.bucket_id = 'gallery-temp') as temp_files_count,
  MAX(o.created_at) as last_upload
FROM storage.objects o
LEFT JOIN members m ON m.id = (string_to_array(o.name, '/'))[2]::uuid
WHERE o.bucket_id IN ('gallery-photos', 'gallery-thumbnails', 'gallery-temp')
GROUP BY (string_to_array(o.name, '/'))[2], m.name, m.email;

CREATE OR REPLACE VIEW orphaned_storage_files AS
SELECT 
  o.bucket_id,
  o.name,
  o.size,
  o.created_at,
  'No matching gallery_photos record' as reason
FROM storage.objects o
WHERE o.bucket_id = 'gallery-photos'
AND NOT EXISTS (
  SELECT 1 FROM gallery_photos gp 
  WHERE gp.storage_path = o.name
)
AND o.created_at < (now() - INTERVAL '1 hour')
UNION ALL
SELECT 
  o.bucket_id,
  o.name,
  o.size,
  o.created_at,
  'Temp file older than 24 hours' as reason
FROM storage.objects o
WHERE o.bucket_id = 'gallery-temp'
AND o.created_at < (now() - INTERVAL '24 hours');