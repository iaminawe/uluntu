-- Admin Gallery RLS Policies
-- Creates Row Level Security policies for admin gallery operations

-- Enable RLS on admin activity logs if not already enabled
ALTER TABLE admin_activity_logs ENABLE ROW LEVEL SECURITY;

-- Admin Activity Logs Policies
-- Allow admins to read all audit logs
CREATE POLICY "admin_can_read_audit_logs" ON admin_activity_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur 
      JOIN roles r ON ur.role_id = r.id 
      WHERE ur.user_id = auth.uid() 
      AND r.name IN ('super_admin', 'admin')
    )
  );

-- Allow admins to insert audit logs
CREATE POLICY "admin_can_insert_audit_logs" ON admin_activity_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles ur 
      JOIN roles r ON ur.role_id = r.id 
      WHERE ur.user_id = auth.uid() 
      AND r.name IN ('super_admin', 'admin')
    )
    AND admin_id = auth.uid()
  );

-- Gallery Photos Admin Policies
-- Allow admins to read all photos (in addition to existing policies)
CREATE POLICY "admin_can_read_all_photos" ON gallery_photos
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur 
      JOIN roles r ON ur.role_id = r.id 
      WHERE ur.user_id = auth.uid() 
      AND r.name IN ('super_admin', 'admin', 'moderator')
    )
  );

-- Allow admins to update any photo
CREATE POLICY "admin_can_update_any_photo" ON gallery_photos
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur 
      JOIN roles r ON ur.role_id = r.id 
      WHERE ur.user_id = auth.uid() 
      AND r.name IN ('super_admin', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles ur 
      JOIN roles r ON ur.role_id = r.id 
      WHERE ur.user_id = auth.uid() 
      AND r.name IN ('super_admin', 'admin')
    )
  );

-- Allow admins to delete any photo
CREATE POLICY "admin_can_delete_any_photo" ON gallery_photos
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur 
      JOIN roles r ON ur.role_id = r.id 
      WHERE ur.user_id = auth.uid() 
      AND r.name IN ('super_admin', 'admin')
    )
  );

-- Allow admins to insert photos on behalf of users (for bulk uploads)
CREATE POLICY "admin_can_insert_photos" ON gallery_photos
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles ur 
      JOIN roles r ON ur.role_id = r.id 
      WHERE ur.user_id = auth.uid() 
      AND r.name IN ('super_admin', 'admin')
    )
  );

-- User Galleries Admin Policies
-- Allow admins to read all galleries
CREATE POLICY "admin_can_read_all_galleries" ON user_galleries
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur 
      JOIN roles r ON ur.role_id = r.id 
      WHERE ur.user_id = auth.uid() 
      AND r.name IN ('super_admin', 'admin', 'moderator')
    )
  );

-- Allow admins to update any gallery
CREATE POLICY "admin_can_update_any_gallery" ON user_galleries
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur 
      JOIN roles r ON ur.role_id = r.id 
      WHERE ur.user_id = auth.uid() 
      AND r.name IN ('super_admin', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles ur 
      JOIN roles r ON ur.role_id = r.id 
      WHERE ur.user_id = auth.uid() 
      AND r.name IN ('super_admin', 'admin')
    )
  );

-- Allow admins to delete any gallery
CREATE POLICY "admin_can_delete_any_gallery" ON user_galleries
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur 
      JOIN roles r ON ur.role_id = r.id 
      WHERE ur.user_id = auth.uid() 
      AND r.name IN ('super_admin', 'admin')
    )
  );

-- Allow admins to create galleries on behalf of users
CREATE POLICY "admin_can_create_galleries" ON user_galleries
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles ur 
      JOIN roles r ON ur.role_id = r.id 
      WHERE ur.user_id = auth.uid() 
      AND r.name IN ('super_admin', 'admin')
    )
  );

-- Photo Likes Admin Policies (for moderation)
-- Allow admins to read all photo likes
CREATE POLICY "admin_can_read_photo_likes" ON photo_likes
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur 
      JOIN roles r ON ur.role_id = r.id 
      WHERE ur.user_id = auth.uid() 
      AND r.name IN ('super_admin', 'admin', 'moderator')
    )
  );

-- Allow admins to delete inappropriate likes
CREATE POLICY "admin_can_delete_photo_likes" ON photo_likes
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur 
      JOIN roles r ON ur.role_id = r.id 
      WHERE ur.user_id = auth.uid() 
      AND r.name IN ('super_admin', 'admin')
    )
  );

-- Photo Comments Admin Policies (if exists)
-- Allow admins to read all photo comments
CREATE POLICY "admin_can_read_photo_comments" ON photo_comments
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur 
      JOIN roles r ON ur.role_id = r.id 
      WHERE ur.user_id = auth.uid() 
      AND r.name IN ('super_admin', 'admin', 'moderator')
    )
  );

-- Allow admins to update comment moderation status
CREATE POLICY "admin_can_moderate_photo_comments" ON photo_comments
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur 
      JOIN roles r ON ur.role_id = r.id 
      WHERE ur.user_id = auth.uid() 
      AND r.name IN ('super_admin', 'admin', 'moderator')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles ur 
      JOIN roles r ON ur.role_id = r.id 
      WHERE ur.user_id = auth.uid() 
      AND r.name IN ('super_admin', 'admin', 'moderator')
    )
  );

-- Allow admins to delete inappropriate comments
CREATE POLICY "admin_can_delete_photo_comments" ON photo_comments
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur 
      JOIN roles r ON ur.role_id = r.id 
      WHERE ur.user_id = auth.uid() 
      AND r.name IN ('super_admin', 'admin')
    )
  );

-- Photo Promotions Admin Policies (if table exists)
-- Allow admins to read all photo promotions
CREATE POLICY "admin_can_read_photo_promotions" ON photo_promotions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur 
      JOIN roles r ON ur.role_id = r.id 
      WHERE ur.user_id = auth.uid() 
      AND r.name IN ('super_admin', 'admin', 'moderator')
    )
  );

-- Allow admins to manage photo promotions
CREATE POLICY "admin_can_manage_photo_promotions" ON photo_promotions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur 
      JOIN roles r ON ur.role_id = r.id 
      WHERE ur.user_id = auth.uid() 
      AND r.name IN ('super_admin', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles ur 
      JOIN roles r ON ur.role_id = r.id 
      WHERE ur.user_id = auth.uid() 
      AND r.name IN ('super_admin', 'admin')
    )
  );

-- Page Headers Admin Policies (if table exists)
-- Allow admins to manage page headers
CREATE POLICY "admin_can_manage_page_headers" ON page_headers
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur 
      JOIN roles r ON ur.role_id = r.id 
      WHERE ur.user_id = auth.uid() 
      AND r.name IN ('super_admin', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles ur 
      JOIN roles r ON ur.role_id = r.id 
      WHERE ur.user_id = auth.uid() 
      AND r.name IN ('super_admin', 'admin')
    )
    AND created_by = auth.uid()
  );

-- Create function to check admin role (helper for policies)
CREATE OR REPLACE FUNCTION is_admin_user()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles ur 
    JOIN roles r ON ur.role_id = r.id 
    WHERE ur.user_id = auth.uid() 
    AND r.name IN ('super_admin', 'admin')
  );
END;
$$;

-- Create function to check moderator role
CREATE OR REPLACE FUNCTION is_moderator_user()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles ur 
    JOIN roles r ON ur.role_id = r.id 
    WHERE ur.user_id = auth.uid() 
    AND r.name IN ('super_admin', 'admin', 'moderator')
  );
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION is_admin_user TO authenticated;
GRANT EXECUTE ON FUNCTION is_moderator_user TO authenticated;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_admin_activity_logs_admin_id ON admin_activity_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_activity_logs_entity_type ON admin_activity_logs(entity_type);
CREATE INDEX IF NOT EXISTS idx_admin_activity_logs_action ON admin_activity_logs(action);
CREATE INDEX IF NOT EXISTS idx_admin_activity_logs_created_at ON admin_activity_logs(created_at DESC);

-- Create composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_admin_activity_logs_admin_entity ON admin_activity_logs(admin_id, entity_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_gallery_photos_moderation ON gallery_photos(moderation_status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_gallery_photos_visibility ON gallery_photos(visibility, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_galleries_privacy_visibility ON user_galleries(privacy_level, visibility, created_at DESC);