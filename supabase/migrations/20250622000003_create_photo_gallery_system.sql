-- Photo Gallery System Migration
-- Creates comprehensive photo gallery system with user galleries, admin promotion workflows, and page header assignments

-- Create user_galleries table for user-owned photo collections
CREATE TABLE IF NOT EXISTS user_galleries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  slug VARCHAR(255) NOT NULL,
  cover_photo_id UUID, -- Self-referencing to gallery_photos
  privacy_level VARCHAR(20) NOT NULL DEFAULT 'public' CHECK (privacy_level IN ('public', 'members_only', 'private')),
  visibility VARCHAR(20) NOT NULL DEFAULT 'visible' CHECK (visibility IN ('visible', 'hidden', 'archived')),
  sort_order INTEGER DEFAULT 0,
  photo_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Unique constraint on user_id + slug for user-specific gallery URLs
  CONSTRAINT user_galleries_user_slug_unique UNIQUE (user_id, slug),
  
  -- Ensure reasonable limits
  CONSTRAINT user_galleries_title_length CHECK (char_length(title) >= 1 AND char_length(title) <= 255),
  CONSTRAINT user_galleries_slug_format CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

-- Create gallery_photos table for individual photos with comprehensive metadata
CREATE TABLE IF NOT EXISTS gallery_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gallery_id UUID NOT NULL REFERENCES user_galleries(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  
  -- File and storage information
  file_name VARCHAR(255) NOT NULL,
  original_file_name VARCHAR(255) NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  storage_path TEXT NOT NULL, -- Full path in Supabase storage
  thumbnail_path TEXT, -- Optimized thumbnail path
  medium_path TEXT, -- Medium-sized optimized version
  
  -- Photo metadata
  title VARCHAR(255),
  description TEXT,
  alt_text VARCHAR(500),
  caption TEXT,
  
  -- Technical metadata (EXIF data)
  width INTEGER,
  height INTEGER,
  exif_data JSONB DEFAULT '{}',
  camera_make VARCHAR(100),
  camera_model VARCHAR(100),
  focal_length VARCHAR(50),
  aperture VARCHAR(50),
  shutter_speed VARCHAR(50),
  iso_speed INTEGER,
  taken_at TIMESTAMP WITH TIME ZONE,
  
  -- Location data
  location_name VARCHAR(255),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  
  -- Organization and status
  sort_order INTEGER DEFAULT 0,
  visibility VARCHAR(20) NOT NULL DEFAULT 'visible' CHECK (visibility IN ('visible', 'hidden', 'archived')),
  processing_status VARCHAR(20) DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
  
  -- Engagement metrics
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  
  -- Moderation and promotion
  moderation_status VARCHAR(20) DEFAULT 'pending' CHECK (moderation_status IN ('pending', 'approved', 'rejected', 'flagged')),
  is_featured BOOLEAN DEFAULT false,
  featured_at TIMESTAMP WITH TIME ZONE,
  featured_by UUID REFERENCES members(id),
  
  -- Tags for categorization
  tags TEXT[],
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Constraints
  CONSTRAINT gallery_photos_file_size_check CHECK (file_size > 0 AND file_size <= 50000000), -- 50MB max
  CONSTRAINT gallery_photos_dimensions_check CHECK (width > 0 AND height > 0),
  CONSTRAINT gallery_photos_coordinates_check CHECK (
    (latitude IS NULL AND longitude IS NULL) OR 
    (latitude IS NOT NULL AND longitude IS NOT NULL AND 
     latitude >= -90 AND latitude <= 90 AND 
     longitude >= -180 AND longitude <= 180)
  )
);

-- Create photo_promotions table for admin promotion workflow tracking
CREATE TABLE IF NOT EXISTS photo_promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  photo_id UUID NOT NULL REFERENCES gallery_photos(id) ON DELETE CASCADE,
  promoted_by UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  
  -- Promotion details
  promotion_type VARCHAR(50) NOT NULL CHECK (promotion_type IN ('featured', 'homepage_hero', 'gallery_cover', 'event_banner', 'news_image')),
  promotion_status VARCHAR(20) DEFAULT 'pending' CHECK (promotion_status IN ('pending', 'approved', 'rejected', 'active', 'expired')),
  priority INTEGER DEFAULT 0,
  
  -- Scheduling
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  auto_expire BOOLEAN DEFAULT true,
  
  -- Promotion context
  context_type VARCHAR(50), -- 'page', 'event', 'news', 'general'
  context_id UUID, -- ID of the related entity
  context_data JSONB DEFAULT '{}',
  
  -- Admin workflow
  reviewed_by UUID REFERENCES members(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  review_notes TEXT,
  rejection_reason TEXT,
  
  -- Metrics
  impression_count INTEGER DEFAULT 0,
  click_count INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Constraints
  CONSTRAINT photo_promotions_dates_check CHECK (
    (start_date IS NULL AND end_date IS NULL) OR
    (start_date IS NOT NULL AND end_date IS NOT NULL AND end_date > start_date)
  )
);

-- Create page_headers table for page header assignments with advanced scheduling
CREATE TABLE IF NOT EXISTS page_headers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_slug VARCHAR(255) NOT NULL, -- References pages.slug or special pages like 'home', 'about'
  photo_id UUID REFERENCES gallery_photos(id) ON DELETE SET NULL,
  
  -- Header configuration
  title VARCHAR(255),
  subtitle VARCHAR(255),
  overlay_text TEXT,
  overlay_position VARCHAR(20) DEFAULT 'center' CHECK (overlay_position IN ('top', 'center', 'bottom', 'left', 'right', 'top-left', 'top-right', 'bottom-left', 'bottom-right')),
  overlay_opacity DECIMAL(3,2) DEFAULT 0.7 CHECK (overlay_opacity >= 0 AND overlay_opacity <= 1),
  
  -- Styling options
  text_color VARCHAR(7) DEFAULT '#ffffff', -- Hex color
  background_color VARCHAR(7), -- Optional background color for overlay
  blur_background BOOLEAN DEFAULT false,
  darken_image BOOLEAN DEFAULT true,
  custom_css TEXT,
  
  -- Priority and scheduling
  priority INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  
  -- Responsive configuration
  mobile_photo_id UUID REFERENCES gallery_photos(id) ON DELETE SET NULL,
  tablet_photo_id UUID REFERENCES gallery_photos(id) ON DELETE SET NULL,
  
  -- Admin tracking
  created_by UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  updated_by UUID REFERENCES members(id),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Constraints
  CONSTRAINT page_headers_dates_check CHECK (
    (start_date IS NULL AND end_date IS NULL) OR
    (start_date IS NOT NULL AND end_date IS NOT NULL AND end_date > start_date)
  ),
  CONSTRAINT page_headers_hex_color_format CHECK (
    text_color ~ '^#[0-9A-Fa-f]{6}$' AND
    (background_color IS NULL OR background_color ~ '^#[0-9A-Fa-f]{6}$')
  )
);

-- Create photo_likes table for user engagement
CREATE TABLE IF NOT EXISTS photo_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  photo_id UUID NOT NULL REFERENCES gallery_photos(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Prevent duplicate likes
  CONSTRAINT photo_likes_unique UNIQUE (photo_id, user_id)
);

-- Create photo_comments table for user engagement
CREATE TABLE IF NOT EXISTS photo_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  photo_id UUID NOT NULL REFERENCES gallery_photos(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  parent_comment_id UUID REFERENCES photo_comments(id) ON DELETE CASCADE,
  
  content TEXT NOT NULL,
  is_edited BOOLEAN DEFAULT false,
  edited_at TIMESTAMP WITH TIME ZONE,
  
  -- Moderation
  moderation_status VARCHAR(20) DEFAULT 'approved' CHECK (moderation_status IN ('pending', 'approved', 'rejected', 'flagged')),
  moderated_by UUID REFERENCES members(id),
  moderated_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  CONSTRAINT photo_comments_content_length CHECK (char_length(content) >= 1 AND char_length(content) <= 2000)
);

-- Create photo_tags junction table for enhanced tagging
CREATE TABLE IF NOT EXISTS photo_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  photo_id UUID NOT NULL REFERENCES gallery_photos(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  tagged_by UUID REFERENCES members(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Prevent duplicate tags
  CONSTRAINT photo_tags_unique UNIQUE (photo_id, tag_id)
);

-- Create gallery_tags junction table for gallery tagging
CREATE TABLE IF NOT EXISTS gallery_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gallery_id UUID NOT NULL REFERENCES user_galleries(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  tagged_by UUID REFERENCES members(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Prevent duplicate tags
  CONSTRAINT gallery_tags_unique UNIQUE (gallery_id, tag_id)
);

-- Add foreign key constraint for cover_photo_id after gallery_photos table exists
ALTER TABLE user_galleries 
ADD CONSTRAINT user_galleries_cover_photo_fkey 
FOREIGN KEY (cover_photo_id) REFERENCES gallery_photos(id) ON DELETE SET NULL;

-- Create comprehensive indexes for performance
CREATE INDEX idx_user_galleries_user_id ON user_galleries(user_id);
CREATE INDEX idx_user_galleries_privacy_level ON user_galleries(privacy_level);
CREATE INDEX idx_user_galleries_visibility ON user_galleries(visibility);
CREATE INDEX idx_user_galleries_is_featured ON user_galleries(is_featured);
CREATE INDEX idx_user_galleries_created_at ON user_galleries(created_at);
CREATE INDEX idx_user_galleries_updated_at ON user_galleries(updated_at);
CREATE INDEX idx_user_galleries_slug ON user_galleries(slug);
CREATE INDEX idx_user_galleries_tags ON user_galleries USING GIN(tags);

CREATE INDEX idx_gallery_photos_gallery_id ON gallery_photos(gallery_id);
CREATE INDEX idx_gallery_photos_user_id ON gallery_photos(user_id);
CREATE INDEX idx_gallery_photos_visibility ON gallery_photos(visibility);
CREATE INDEX idx_gallery_photos_processing_status ON gallery_photos(processing_status);
CREATE INDEX idx_gallery_photos_moderation_status ON gallery_photos(moderation_status);
CREATE INDEX idx_gallery_photos_is_featured ON gallery_photos(is_featured);
CREATE INDEX idx_gallery_photos_featured_at ON gallery_photos(featured_at);
CREATE INDEX idx_gallery_photos_taken_at ON gallery_photos(taken_at);
CREATE INDEX idx_gallery_photos_created_at ON gallery_photos(created_at);
CREATE INDEX idx_gallery_photos_location ON gallery_photos(latitude, longitude);
CREATE INDEX idx_gallery_photos_tags ON gallery_photos USING GIN(tags);
CREATE INDEX idx_gallery_photos_exif_data ON gallery_photos USING GIN(exif_data);

CREATE INDEX idx_photo_promotions_photo_id ON photo_promotions(photo_id);
CREATE INDEX idx_photo_promotions_promoted_by ON photo_promotions(promoted_by);
CREATE INDEX idx_photo_promotions_promotion_type ON photo_promotions(promotion_type);
CREATE INDEX idx_photo_promotions_promotion_status ON photo_promotions(promotion_status);
CREATE INDEX idx_photo_promotions_priority ON photo_promotions(priority);
CREATE INDEX idx_photo_promotions_start_date ON photo_promotions(start_date);
CREATE INDEX idx_photo_promotions_end_date ON photo_promotions(end_date);
CREATE INDEX idx_photo_promotions_context ON photo_promotions(context_type, context_id);

CREATE INDEX idx_page_headers_page_slug ON page_headers(page_slug);
CREATE INDEX idx_page_headers_photo_id ON page_headers(photo_id);
CREATE INDEX idx_page_headers_is_active ON page_headers(is_active);
CREATE INDEX idx_page_headers_priority ON page_headers(priority);
CREATE INDEX idx_page_headers_start_date ON page_headers(start_date);
CREATE INDEX idx_page_headers_end_date ON page_headers(end_date);
CREATE INDEX idx_page_headers_created_by ON page_headers(created_by);

CREATE INDEX idx_photo_likes_photo_id ON photo_likes(photo_id);
CREATE INDEX idx_photo_likes_user_id ON photo_likes(user_id);
CREATE INDEX idx_photo_likes_created_at ON photo_likes(created_at);

CREATE INDEX idx_photo_comments_photo_id ON photo_comments(photo_id);
CREATE INDEX idx_photo_comments_user_id ON photo_comments(user_id);
CREATE INDEX idx_photo_comments_parent_comment_id ON photo_comments(parent_comment_id);
CREATE INDEX idx_photo_comments_moderation_status ON photo_comments(moderation_status);
CREATE INDEX idx_photo_comments_created_at ON photo_comments(created_at);

CREATE INDEX idx_photo_tags_photo_id ON photo_tags(photo_id);
CREATE INDEX idx_photo_tags_tag_id ON photo_tags(tag_id);
CREATE INDEX idx_gallery_tags_gallery_id ON gallery_tags(gallery_id);
CREATE INDEX idx_gallery_tags_tag_id ON gallery_tags(tag_id);

-- Create trigger functions for automated updates
CREATE OR REPLACE FUNCTION update_gallery_photo_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE user_galleries 
    SET photo_count = photo_count + 1, updated_at = now()
    WHERE id = NEW.gallery_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE user_galleries 
    SET photo_count = photo_count - 1, updated_at = now()
    WHERE id = OLD.gallery_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_photo_like_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE gallery_photos 
    SET like_count = like_count + 1, updated_at = now()
    WHERE id = NEW.photo_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE gallery_photos 
    SET like_count = like_count - 1, updated_at = now()
    WHERE id = OLD.photo_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_photo_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE gallery_photos 
    SET comment_count = comment_count + 1, updated_at = now()
    WHERE id = NEW.photo_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE gallery_photos 
    SET comment_count = comment_count - 1, updated_at = now()
    WHERE id = OLD.photo_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_photo_gallery_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER gallery_photo_count_trigger
  AFTER INSERT OR DELETE ON gallery_photos
  FOR EACH ROW EXECUTE FUNCTION update_gallery_photo_count();

CREATE TRIGGER photo_like_count_trigger
  AFTER INSERT OR DELETE ON photo_likes
  FOR EACH ROW EXECUTE FUNCTION update_photo_like_count();

CREATE TRIGGER photo_comment_count_trigger
  AFTER INSERT OR DELETE ON photo_comments
  FOR EACH ROW EXECUTE FUNCTION update_photo_comment_count();

CREATE TRIGGER update_user_galleries_updated_at_trigger
  BEFORE UPDATE ON user_galleries
  FOR EACH ROW EXECUTE FUNCTION update_photo_gallery_updated_at();

CREATE TRIGGER update_gallery_photos_updated_at_trigger
  BEFORE UPDATE ON gallery_photos
  FOR EACH ROW EXECUTE FUNCTION update_photo_gallery_updated_at();

CREATE TRIGGER update_photo_promotions_updated_at_trigger
  BEFORE UPDATE ON photo_promotions
  FOR EACH ROW EXECUTE FUNCTION update_photo_gallery_updated_at();

CREATE TRIGGER update_page_headers_updated_at_trigger
  BEFORE UPDATE ON page_headers
  FOR EACH ROW EXECUTE FUNCTION update_photo_gallery_updated_at();

CREATE TRIGGER update_photo_comments_updated_at_trigger
  BEFORE UPDATE ON photo_comments
  FOR EACH ROW EXECUTE FUNCTION update_photo_gallery_updated_at();

-- Create trigger for tag usage tracking
CREATE TRIGGER photo_tags_usage_trigger
  AFTER INSERT OR DELETE ON photo_tags
  FOR EACH ROW EXECUTE FUNCTION update_tag_usage_count();

CREATE TRIGGER gallery_tags_usage_trigger
  AFTER INSERT OR DELETE ON gallery_tags
  FOR EACH ROW EXECUTE FUNCTION update_tag_usage_count();

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE user_galleries ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE photo_promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_headers ENABLE ROW LEVEL SECURITY;
ALTER TABLE photo_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE photo_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE photo_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_tags ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_galleries
CREATE POLICY "Public can view public galleries" ON user_galleries
  FOR SELECT USING (privacy_level = 'public' AND visibility = 'visible');

CREATE POLICY "Members can view members-only galleries" ON user_galleries
  FOR SELECT USING (
    (privacy_level = 'public' AND visibility = 'visible') OR
    (privacy_level = 'members_only' AND visibility = 'visible' AND 
     EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('authenticated', 'group_member', 'admin', 'superadmin')))
  );

CREATE POLICY "Users can view their own galleries" ON user_galleries
  FOR SELECT USING (user_id = (SELECT id FROM members WHERE user_id = auth.uid()));

CREATE POLICY "Admins can view all galleries" ON user_galleries
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'superadmin'))
  );

CREATE POLICY "Users can create their own galleries" ON user_galleries
  FOR INSERT WITH CHECK (
    user_id = (SELECT id FROM members WHERE user_id = auth.uid()) AND
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('authenticated', 'group_member', 'admin', 'superadmin'))
  );

CREATE POLICY "Users can update their own galleries" ON user_galleries
  FOR UPDATE USING (
    user_id = (SELECT id FROM members WHERE user_id = auth.uid())
  ) WITH CHECK (
    user_id = (SELECT id FROM members WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins can update any gallery" ON user_galleries
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'superadmin'))
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'superadmin'))
  );

CREATE POLICY "Users can delete their own galleries" ON user_galleries
  FOR DELETE USING (
    user_id = (SELECT id FROM members WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins can delete any gallery" ON user_galleries
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'superadmin'))
  );

-- RLS Policies for gallery_photos
CREATE POLICY "Public can view public gallery photos" ON gallery_photos
  FOR SELECT USING (
    visibility = 'visible' AND
    moderation_status = 'approved' AND
    EXISTS (
      SELECT 1 FROM user_galleries 
      WHERE id = gallery_photos.gallery_id 
      AND privacy_level = 'public' 
      AND visibility = 'visible'
    )
  );

CREATE POLICY "Members can view member gallery photos" ON gallery_photos
  FOR SELECT USING (
    visibility = 'visible' AND
    moderation_status = 'approved' AND
    EXISTS (
      SELECT 1 FROM user_galleries 
      WHERE id = gallery_photos.gallery_id 
      AND (
        (privacy_level = 'public' AND visibility = 'visible') OR
        (privacy_level = 'members_only' AND visibility = 'visible' AND 
         EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('authenticated', 'group_member', 'admin', 'superadmin')))
      )
    )
  );

CREATE POLICY "Users can view their own photos" ON gallery_photos
  FOR SELECT USING (
    user_id = (SELECT id FROM members WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins can view all photos" ON gallery_photos
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'superadmin'))
  );

CREATE POLICY "Users can upload photos to their galleries" ON gallery_photos
  FOR INSERT WITH CHECK (
    user_id = (SELECT id FROM members WHERE user_id = auth.uid()) AND
    EXISTS (
      SELECT 1 FROM user_galleries 
      WHERE id = gallery_photos.gallery_id 
      AND user_id = (SELECT id FROM members WHERE user_id = auth.uid())
    ) AND
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('authenticated', 'group_member', 'admin', 'superadmin'))
  );

CREATE POLICY "Users can update their own photos" ON gallery_photos
  FOR UPDATE USING (
    user_id = (SELECT id FROM members WHERE user_id = auth.uid())
  ) WITH CHECK (
    user_id = (SELECT id FROM members WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins can update any photo" ON gallery_photos
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'superadmin'))
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'superadmin'))
  );

CREATE POLICY "Users can delete their own photos" ON gallery_photos
  FOR DELETE USING (
    user_id = (SELECT id FROM members WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins can delete any photo" ON gallery_photos
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'superadmin'))
  );

-- RLS Policies for photo_promotions (Admin only)
CREATE POLICY "Admins can manage photo promotions" ON photo_promotions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'superadmin'))
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'superadmin'))
  );

-- RLS Policies for page_headers (Admin only)
CREATE POLICY "Anyone can view active page headers" ON page_headers
  FOR SELECT USING (
    is_active = true AND
    (start_date IS NULL OR start_date <= now()) AND
    (end_date IS NULL OR end_date >= now())
  );

CREATE POLICY "Admins can manage page headers" ON page_headers
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'superadmin'))
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'superadmin'))
  );

-- RLS Policies for photo_likes
CREATE POLICY "Anyone can view photo likes" ON photo_likes
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can like photos" ON photo_likes
  FOR INSERT WITH CHECK (
    user_id = (SELECT id FROM members WHERE user_id = auth.uid()) AND
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('authenticated', 'group_member', 'admin', 'superadmin'))
  );

CREATE POLICY "Users can remove their own likes" ON photo_likes
  FOR DELETE USING (
    user_id = (SELECT id FROM members WHERE user_id = auth.uid())
  );

-- RLS Policies for photo_comments
CREATE POLICY "Anyone can view approved comments" ON photo_comments
  FOR SELECT USING (moderation_status = 'approved');

CREATE POLICY "Users can view their own comments" ON photo_comments
  FOR SELECT USING (
    user_id = (SELECT id FROM members WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins can view all comments" ON photo_comments
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'superadmin'))
  );

CREATE POLICY "Authenticated users can comment" ON photo_comments
  FOR INSERT WITH CHECK (
    user_id = (SELECT id FROM members WHERE user_id = auth.uid()) AND
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('authenticated', 'group_member', 'admin', 'superadmin'))
  );

CREATE POLICY "Users can update their own comments" ON photo_comments
  FOR UPDATE USING (
    user_id = (SELECT id FROM members WHERE user_id = auth.uid())
  ) WITH CHECK (
    user_id = (SELECT id FROM members WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins can moderate comments" ON photo_comments
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'superadmin'))
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'superadmin'))
  );

CREATE POLICY "Users can delete their own comments" ON photo_comments
  FOR DELETE USING (
    user_id = (SELECT id FROM members WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins can delete any comment" ON photo_comments
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'superadmin'))
  );

-- RLS Policies for photo_tags
CREATE POLICY "Anyone can view photo tags" ON photo_tags
  FOR SELECT USING (true);

CREATE POLICY "Photo owners can manage photo tags" ON photo_tags
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM gallery_photos 
      WHERE id = photo_tags.photo_id 
      AND user_id = (SELECT id FROM members WHERE user_id = auth.uid())
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM gallery_photos 
      WHERE id = photo_tags.photo_id 
      AND user_id = (SELECT id FROM members WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Admins can manage all photo tags" ON photo_tags
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'superadmin'))
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'superadmin'))
  );

-- RLS Policies for gallery_tags
CREATE POLICY "Anyone can view gallery tags" ON gallery_tags
  FOR SELECT USING (true);

CREATE POLICY "Gallery owners can manage gallery tags" ON gallery_tags
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_galleries 
      WHERE id = gallery_tags.gallery_id 
      AND user_id = (SELECT id FROM members WHERE user_id = auth.uid())
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_galleries 
      WHERE id = gallery_tags.gallery_id 
      AND user_id = (SELECT id FROM members WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Admins can manage all gallery tags" ON gallery_tags
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'superadmin'))
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'superadmin'))
  );

-- Add specialized photo tags for galleries
INSERT INTO tags (name, slug, color, category, description, usage_count, created_by)
SELECT 
  'Photography', 'photography', '#FF6B6B', 'Features', 'Photos and visual content', 0,
  (SELECT id FROM members WHERE email = 'admin@nelsontech.ca' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM tags WHERE slug = 'photography')
AND EXISTS (SELECT 1 FROM members WHERE email = 'admin@nelsontech.ca');

INSERT INTO tags (name, slug, color, category, description, usage_count, created_by)
SELECT 
  'Landscape', 'landscape', '#4ECDC4', 'Features', 'Landscape photography', 0,
  (SELECT id FROM members WHERE email = 'admin@nelsontech.ca' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM tags WHERE slug = 'landscape')
AND EXISTS (SELECT 1 FROM members WHERE email = 'admin@nelsontech.ca');

INSERT INTO tags (name, slug, color, category, description, usage_count, created_by)
SELECT 
  'Portrait', 'portrait', '#45B7D1', 'Features', 'Portrait photography', 0,
  (SELECT id FROM members WHERE email = 'admin@nelsontech.ca' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM tags WHERE slug = 'portrait')
AND EXISTS (SELECT 1 FROM members WHERE email = 'admin@nelsontech.ca');

INSERT INTO tags (name, slug, color, category, description, usage_count, created_by)
SELECT 
  'Street Photography', 'street-photography', '#96CEB4', 'Features', 'Street and urban photography', 0,
  (SELECT id FROM members WHERE email = 'admin@nelsontech.ca' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM tags WHERE slug = 'street-photography')
AND EXISTS (SELECT 1 FROM members WHERE email = 'admin@nelsontech.ca');

INSERT INTO tags (name, slug, color, category, description, usage_count, created_by)
SELECT 
  'Event Photography', 'event-photography', '#FECA57', 'Features', 'Event and gathering photography', 0,
  (SELECT id FROM members WHERE email = 'admin@nelsontech.ca' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM tags WHERE slug = 'event-photography')
AND EXISTS (SELECT 1 FROM members WHERE email = 'admin@nelsontech.ca');

INSERT INTO tags (name, slug, color, category, description, usage_count, created_by)
SELECT 
  'Nature', 'nature', '#6C5CE7', 'Features', 'Nature and wildlife photography', 0,
  (SELECT id FROM members WHERE email = 'admin@nelsontech.ca' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM tags WHERE slug = 'nature')
AND EXISTS (SELECT 1 FROM members WHERE email = 'admin@nelsontech.ca');

-- Create helpful views for common queries
CREATE OR REPLACE VIEW public_galleries AS
SELECT 
  g.*,
  m.name as user_name,
  m.image as user_image,
  gp.storage_path as cover_image_path
FROM user_galleries g
JOIN members m ON g.user_id = m.id
LEFT JOIN gallery_photos gp ON g.cover_photo_id = gp.id
WHERE g.privacy_level = 'public' AND g.visibility = 'visible';

CREATE OR REPLACE VIEW featured_photos AS
SELECT 
  p.*,
  g.title as gallery_title,
  g.slug as gallery_slug,
  m.name as user_name,
  m.image as user_image
FROM gallery_photos p
JOIN user_galleries g ON p.gallery_id = g.id
JOIN members m ON p.user_id = m.id
WHERE p.is_featured = true 
  AND p.visibility = 'visible' 
  AND p.moderation_status = 'approved'
  AND g.privacy_level = 'public' 
  AND g.visibility = 'visible';

CREATE OR REPLACE VIEW active_page_headers AS
SELECT 
  ph.*,
  gp.storage_path as photo_path,
  gp.thumbnail_path,
  gp.width,
  gp.height,
  gp.alt_text
FROM page_headers ph
LEFT JOIN gallery_photos gp ON ph.photo_id = gp.id
WHERE ph.is_active = true
  AND (ph.start_date IS NULL OR ph.start_date <= now())
  AND (ph.end_date IS NULL OR ph.end_date >= now())
ORDER BY ph.priority DESC, ph.created_at DESC;

-- Create function to get gallery statistics
CREATE OR REPLACE FUNCTION get_gallery_stats(gallery_uuid UUID)
RETURNS JSON AS $$
DECLARE
  stats JSON;
BEGIN
  SELECT json_build_object(
    'total_photos', COUNT(*),
    'total_views', COALESCE(SUM(view_count), 0),
    'total_likes', COALESCE(SUM(like_count), 0),
    'total_comments', COALESCE(SUM(comment_count), 0),
    'featured_photos', COUNT(*) FILTER (WHERE is_featured = true),
    'pending_moderation', COUNT(*) FILTER (WHERE moderation_status = 'pending')
  ) INTO stats
  FROM gallery_photos
  WHERE gallery_id = gallery_uuid;
  
  RETURN stats;
END;
$$ LANGUAGE plpgsql;

-- Create function to get user photo statistics
CREATE OR REPLACE FUNCTION get_user_photo_stats(user_uuid UUID)
RETURNS JSON AS $$
DECLARE
  stats JSON;
BEGIN
  SELECT json_build_object(
    'total_galleries', (SELECT COUNT(*) FROM user_galleries WHERE user_id = user_uuid),
    'total_photos', COUNT(*),
    'total_views', COALESCE(SUM(view_count), 0),
    'total_likes', COALESCE(SUM(like_count), 0),
    'total_comments', COALESCE(SUM(comment_count), 0),
    'featured_photos', COUNT(*) FILTER (WHERE is_featured = true),
    'public_galleries', (SELECT COUNT(*) FROM user_galleries WHERE user_id = user_uuid AND privacy_level = 'public')
  ) INTO stats
  FROM gallery_photos
  WHERE user_id = user_uuid;
  
  RETURN stats;
END;
$$ LANGUAGE plpgsql;