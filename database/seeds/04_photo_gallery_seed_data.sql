-- Photo Gallery System Seed Data
-- Creates sample galleries, photos, and related data for testing

-- First, let's create some sample galleries for existing users
INSERT INTO user_galleries (id, user_id, title, description, slug, privacy_level, visibility, sort_order, tags, created_at, updated_at) 
SELECT 
  gen_random_uuid(),
  m.id,
  'Nature Photography',
  'A collection of stunning nature photographs from around the Kootenay region, capturing the raw beauty of British Columbia''s wilderness.',
  'nature-photography',
  'public',
  'visible',
  1,
  ARRAY['nature', 'landscape', 'kootenays', 'outdoors'],
  now() - interval '30 days',
  now() - interval '30 days'
FROM members m WHERE m.name = 'Sarah Johnson'
ON CONFLICT (user_id, slug) DO NOTHING;

INSERT INTO user_galleries (id, user_id, title, description, slug, privacy_level, visibility, sort_order, tags, created_at, updated_at) 
SELECT 
  gen_random_uuid(),
  m.id,
  'Tech Events & Meetups',
  'Photo highlights from various tech community events, workshops, and networking sessions in Nelson.',
  'tech-events',
  'public',
  'visible',
  2,
  ARRAY['events', 'technology', 'community', 'networking'],
  now() - interval '45 days',
  now() - interval '20 days'
FROM members m WHERE m.name = 'Mike Chen'
ON CONFLICT (user_id, slug) DO NOTHING;

INSERT INTO user_galleries (id, user_id, title, description, slug, privacy_level, visibility, sort_order, tags, created_at, updated_at) 
SELECT 
  gen_random_uuid(),
  m.id,
  'Street Photography',
  'Candid moments and urban scenes from Nelson''s vibrant downtown core and surrounding neighborhoods.',
  'street-photography',
  'members_only',
  'visible',
  1,
  ARRAY['street', 'urban', 'people', 'candid'],
  now() - interval '60 days',
  now() - interval '10 days'
FROM members m WHERE m.name = 'Emma Thompson'
ON CONFLICT (user_id, slug) DO NOTHING;

INSERT INTO user_galleries (id, user_id, title, description, slug, privacy_level, visibility, sort_order, tags, created_at, updated_at) 
SELECT 
  gen_random_uuid(),
  m.id,
  'Local Business Profiles',
  'Professional photography for local businesses, showcasing Nelson''s entrepreneurial spirit.',
  'business-profiles',
  'public',
  'visible',
  1,
  ARRAY['business', 'professional', 'commercial', 'portraits'],
  now() - interval '25 days',
  now() - interval '5 days'
FROM members m WHERE m.name = 'Alex Rodriguez'
ON CONFLICT (user_id, slug) DO NOTHING;

INSERT INTO user_galleries (id, user_id, title, description, slug, privacy_level, visibility, sort_order, tags, created_at, updated_at) 
SELECT 
  gen_random_uuid(),
  m.id,
  'Product Photography',
  'High-quality product shots for local artisans and tech companies, emphasizing clean aesthetics.',
  'product-photography',
  'public',
  'visible',
  2,
  ARRAY['products', 'commercial', 'studio', 'clean'],
  now() - interval '15 days',
  now() - interval '2 days'
FROM members m WHERE m.name = 'Lisa Park'
ON CONFLICT (user_id, slug) DO NOTHING;

-- Now create sample photos for these galleries
-- Nature Photography Gallery Photos
INSERT INTO gallery_photos (
  id, gallery_id, user_id, file_name, original_file_name, file_size, mime_type, 
  storage_path, thumbnail_path, medium_path, title, description, alt_text, caption,
  width, height, camera_make, camera_model, focal_length, aperture, shutter_speed, iso_speed,
  taken_at, location_name, latitude, longitude, sort_order, visibility, processing_status,
  moderation_status, is_featured, tags, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  g.id,
  g.user_id,
  'kootenay-lake-sunset-001.jpg',
  'IMG_2847.JPG',
  2456789,
  'image/jpeg',
  'photos/' || g.user_id || '/' || g.id || '/originals/kootenay-lake-sunset-001.jpg',
  'photos/' || g.user_id || '/' || g.id || '/thumbnails/kootenay-lake-sunset-001.jpg',
  'photos/' || g.user_id || '/' || g.id || '/medium/kootenay-lake-sunset-001.jpg',
  'Golden Hour at Kootenay Lake',
  'A breathtaking sunset over Kootenay Lake, with the Selkirk Mountains reflected in the calm waters. The golden light creates a perfect mirror effect.',
  'Sunset over Kootenay Lake with mountain reflections',
  'Captured during the perfect golden hour, this shot showcases the natural beauty of our region.',
  4000, 2667, 'Canon', 'EOS R5', '70mm', 'f/8.0', '1/125s', 200,
  now() - interval '28 days' + interval '14:30:00',
  'Kootenay Lake, BC',
  49.5938, -117.0794,
  1, 'visible', 'completed', 'approved', true,
  ARRAY['sunset', 'lake', 'mountains', 'reflection', 'golden-hour'],
  now() - interval '28 days',
  now() - interval '28 days'
FROM user_galleries g WHERE g.slug = 'nature-photography';

INSERT INTO gallery_photos (
  id, gallery_id, user_id, file_name, original_file_name, file_size, mime_type, 
  storage_path, thumbnail_path, medium_path, title, description, alt_text,
  width, height, camera_make, camera_model, focal_length, aperture, shutter_speed, iso_speed,
  taken_at, location_name, latitude, longitude, sort_order, visibility, processing_status,
  moderation_status, tags, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  g.id,
  g.user_id,
  'nelson-mountain-trail-002.jpg',
  'DSC_5432.JPG',
  3124567,
  'image/jpeg',
  'photos/' || g.user_id || '/' || g.id || '/originals/nelson-mountain-trail-002.jpg',
  'photos/' || g.user_id || '/' || g.id || '/thumbnails/nelson-mountain-trail-002.jpg',
  'photos/' || g.user_id || '/' || g.id || '/medium/nelson-mountain-trail-002.jpg',
  'Morning Mist on the Trail',
  'Early morning hike on one of Nelson''s mountain trails, with mist rising through the old-growth forest.',
  'Misty forest trail with tall trees and morning light',
  3840, 2560, 'Nikon', 'D850', '24mm', 'f/5.6', '1/60s', 800,
  now() - interval '25 days' + interval '07:15:00',
  'Pulpit Rock Trail, Nelson BC',
  49.4969, -117.3224,
  2, 'visible', 'completed', 'approved',
  ARRAY['forest', 'trail', 'mist', 'morning', 'hiking'],
  now() - interval '25 days',
  now() - interval '25 days'
FROM user_galleries g WHERE g.slug = 'nature-photography';

-- Tech Events Gallery Photos
INSERT INTO gallery_photos (
  id, gallery_id, user_id, file_name, original_file_name, file_size, mime_type, 
  storage_path, thumbnail_path, medium_path, title, description, alt_text,
  width, height, camera_make, camera_model, focal_length, aperture, shutter_speed, iso_speed,
  taken_at, location_name, sort_order, visibility, processing_status,
  moderation_status, is_featured, tags, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  g.id,
  g.user_id,
  'tech-meetup-presentation-001.jpg',
  'EVENT_001.JPG',
  1845632,
  'image/jpeg',
  'photos/' || g.user_id || '/' || g.id || '/originals/tech-meetup-presentation-001.jpg',
  'photos/' || g.user_id || '/' || g.id || '/thumbnails/tech-meetup-presentation-001.jpg',
  'photos/' || g.user_id || '/' || g.id || '/medium/tech-meetup-presentation-001.jpg',
  'AI Workshop Presentation',
  'An engaging presentation on machine learning applications during our monthly AI workshop.',
  'Speaker presenting to an engaged audience at tech workshop',
  2992, 2000, 'Sony', 'A7III', '85mm', 'f/2.8', '1/100s', 1600,
  now() - interval '18 days' + interval '19:30:00',
  'Nelson Innovation Centre',
  1, 'visible', 'completed', 'approved', true,
  ARRAY['workshop', 'presentation', 'ai', 'education', 'community'],
  now() - interval '18 days',
  now() - interval '18 days'
FROM user_galleries g WHERE g.slug = 'tech-events';

INSERT INTO gallery_photos (
  id, gallery_id, user_id, file_name, original_file_name, file_size, mime_type, 
  storage_path, thumbnail_path, medium_path, title, description, alt_text,
  width, height, camera_make, camera_model, focal_length, aperture, shutter_speed, iso_speed,
  taken_at, location_name, sort_order, visibility, processing_status,
  moderation_status, tags, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  g.id,
  g.user_id,
  'networking-session-002.jpg',
  'NET_045.JPG',
  2167890,
  'image/jpeg',
  'photos/' || g.user_id || '/' || g.id || '/originals/networking-session-002.jpg',
  'photos/' || g.user_id || '/' || g.id || '/thumbnails/networking-session-002.jpg',
  'photos/' || g.user_id || '/' || g.id || '/medium/networking-session-002.jpg',
  'Community Networking',
  'Members connecting and sharing ideas during our post-meetup networking session.',
  'Tech community members networking and discussing projects',
  3456, 2304, 'Canon', 'EOS R6', '50mm', 'f/2.0', '1/80s', 1250,
  now() - interval '12 days' + interval '20:45:00',
  'Craft Connection, Nelson BC',
  2, 'visible', 'completed', 'approved',
  ARRAY['networking', 'community', 'discussion', 'collaboration'],
  now() - interval '12 days',
  now() - interval '12 days'
FROM user_galleries g WHERE g.slug = 'tech-events';

-- Street Photography Gallery Photos
INSERT INTO gallery_photos (
  id, gallery_id, user_id, file_name, original_file_name, file_size, mime_type, 
  storage_path, thumbnail_path, medium_path, title, description, alt_text,
  width, height, camera_make, camera_model, focal_length, aperture, shutter_speed, iso_speed,
  taken_at, location_name, sort_order, visibility, processing_status,
  moderation_status, tags, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  g.id,
  g.user_id,
  'baker-street-morning-001.jpg',
  'STR_234.JPG',
  1967543,
  'image/jpeg',
  'photos/' || g.user_id || '/' || g.id || '/originals/baker-street-morning-001.jpg',
  'photos/' || g.user_id || '/' || g.id || '/thumbnails/baker-street-morning-001.jpg',
  'photos/' || g.user_id || '/' || g.id || '/medium/baker-street-morning-001.jpg',
  'Baker Street Morning Rush',
  'The quiet energy of Baker Street during the morning commute, with soft light filtering through the heritage buildings.',
  'Baker Street in Nelson with morning light and pedestrians',
  3200, 2133, 'Fujifilm', 'X-T4', '35mm', 'f/4.0', '1/200s', 400,
  now() - interval '8 days' + interval '08:20:00',
  'Baker Street, Nelson BC',
  1, 'visible', 'completed', 'approved',
  ARRAY['street', 'morning', 'downtown', 'heritage', 'urban'],
  now() - interval '8 days',
  now() - interval '8 days'
FROM user_galleries g WHERE g.slug = 'street-photography';

-- Business Profile Photos
INSERT INTO gallery_photos (
  id, gallery_id, user_id, file_name, original_file_name, file_size, mime_type, 
  storage_path, thumbnail_path, medium_path, title, description, alt_text,
  width, height, camera_make, camera_model, focal_length, aperture, shutter_speed, iso_speed,
  taken_at, location_name, sort_order, visibility, processing_status,
  moderation_status, is_featured, tags, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  g.id,
  g.user_id,
  'tech-startup-team-001.jpg',
  'BIZ_678.JPG',
  2543210,
  'image/jpeg',
  'photos/' || g.user_id || '/' || g.id || '/originals/tech-startup-team-001.jpg',
  'photos/' || g.user_id || '/' || g.id || '/thumbnails/tech-startup-team-001.jpg',
  'photos/' || g.user_id || '/' || g.id || '/medium/tech-startup-team-001.jpg',
  'Innovative Team Portrait',
  'Professional team portrait for a local tech startup, showcasing their collaborative and innovative spirit.',
  'Professional team portrait of tech startup employees in modern office',
  4096, 2731, 'Canon', 'EOS R5', '24mm', 'f/8.0', '1/125s', 200,
  now() - interval '15 days' + interval '14:00:00',
  'Kootenay Co-op Building, Nelson BC',
  1, 'visible', 'completed', 'approved', true,
  ARRAY['business', 'team', 'professional', 'startup', 'portrait'],
  now() - interval '15 days',
  now() - interval '15 days'
FROM user_galleries g WHERE g.slug = 'business-profiles';

-- Product Photography Photos
INSERT INTO gallery_photos (
  id, gallery_id, user_id, file_name, original_file_name, file_size, mime_type, 
  storage_path, thumbnail_path, medium_path, title, description, alt_text,
  width, height, camera_make, camera_model, focal_length, aperture, shutter_speed, iso_speed,
  taken_at, location_name, sort_order, visibility, processing_status,
  moderation_status, tags, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  g.id,
  g.user_id,
  'artisan-pottery-set-001.jpg',
  'PROD_123.JPG',
  1789654,
  'image/jpeg',
  'photos/' || g.user_id || '/' || g.id || '/originals/artisan-pottery-set-001.jpg',
  'photos/' || g.user_id || '/' || g.id || '/thumbnails/artisan-pottery-set-001.jpg',
  'photos/' || g.user_id || '/' || g.id || '/medium/artisan-pottery-set-001.jpg',
  'Handcrafted Pottery Collection',
  'Beautiful ceramic pieces created by local artisan, showcasing traditional techniques with modern design.',
  'Collection of handcrafted ceramic bowls and vases with natural glazes',
  3600, 2400, 'Sony', 'A7R IV', '90mm', 'f/11.0', '1/60s', 100,
  now() - interval '5 days' + interval '13:15:00',
  'Studio, Nelson BC',
  1, 'visible', 'completed', 'approved',
  ARRAY['pottery', 'artisan', 'handcraft', 'ceramic', 'local'],
  now() - interval '5 days',
  now() - interval '5 days'
FROM user_galleries g WHERE g.slug = 'product-photography';

-- Update gallery photo counts and set cover photos
UPDATE user_galleries SET 
  photo_count = (SELECT COUNT(*) FROM gallery_photos WHERE gallery_id = user_galleries.id),
  cover_photo_id = (SELECT id FROM gallery_photos WHERE gallery_id = user_galleries.id ORDER BY sort_order LIMIT 1),
  updated_at = now();

-- Create some photo likes
INSERT INTO photo_likes (photo_id, user_id, created_at)
SELECT 
  gp.id,
  m.id,
  now() - interval '1 day' * (random() * 10)
FROM gallery_photos gp
CROSS JOIN members m
WHERE gp.is_featured = true
  AND m.id != gp.user_id
  AND random() < 0.6  -- 60% chance of like
ON CONFLICT (photo_id, user_id) DO NOTHING;

-- Update photo like counts
UPDATE gallery_photos SET 
  like_count = (SELECT COUNT(*) FROM photo_likes WHERE photo_id = gallery_photos.id),
  updated_at = now();

-- Create some photo comments
INSERT INTO photo_comments (photo_id, user_id, content, created_at)
SELECT 
  gp.id,
  m.id,
  CASE 
    WHEN random() < 0.3 THEN 'Amazing shot! The composition is perfect.'
    WHEN random() < 0.6 THEN 'Love the lighting in this photo. Great work!'
    WHEN random() < 0.8 THEN 'This really captures the essence of Nelson beautifully.'
    ELSE 'Incredible detail and color. Thanks for sharing!'
  END,
  now() - interval '1 day' * (random() * 8)
FROM gallery_photos gp
CROSS JOIN members m
WHERE gp.visibility = 'visible'
  AND m.id != gp.user_id
  AND random() < 0.4  -- 40% chance of comment
ON CONFLICT DO NOTHING;

-- Update photo comment counts
UPDATE gallery_photos SET 
  comment_count = (SELECT COUNT(*) FROM photo_comments WHERE photo_id = gallery_photos.id),
  updated_at = now();

-- Create photo promotions
INSERT INTO photo_promotions (
  photo_id, promoted_by, promotion_type, promotion_status, priority, 
  start_date, end_date, context_type, reviewed_by, reviewed_at, 
  created_at, updated_at
)
SELECT 
  gp.id,
  admin.id,
  'featured',
  'approved',
  10,
  now() - interval '7 days',
  now() + interval '30 days',
  'general',
  admin.id,
  now() - interval '6 days',
  now() - interval '7 days',
  now() - interval '6 days'
FROM gallery_photos gp
CROSS JOIN members admin
WHERE gp.is_featured = true
  AND admin.email = 'admin@nelsontech.ca'
  AND gp.title = 'Golden Hour at Kootenay Lake';

INSERT INTO photo_promotions (
  photo_id, promoted_by, promotion_type, promotion_status, priority, 
  start_date, end_date, context_type, reviewed_by, reviewed_at, 
  created_at, updated_at
)
SELECT 
  gp.id,
  admin.id,
  'homepage_hero',
  'approved',
  20,
  now() - interval '3 days',
  now() + interval '14 days',
  'page',
  admin.id,
  now() - interval '2 days',
  now() - interval '3 days',
  now() - interval '2 days'
FROM gallery_photos gp
CROSS JOIN members admin
WHERE admin.email = 'admin@nelsontech.ca'
  AND gp.title = 'AI Workshop Presentation';

-- Create page headers
INSERT INTO page_headers (
  page_slug, photo_id, title, subtitle, overlay_text, overlay_position, 
  overlay_opacity, text_color, background_color, darken_image, priority, 
  is_active, start_date, end_date, created_by, created_at, updated_at
)
SELECT 
  'home',
  gp.id,
  'Welcome to Nelson Tech Community',
  'Connecting Technology Professionals in the Kootenays',
  'Join our vibrant community of innovators, developers, and tech enthusiasts in beautiful Nelson, BC.',
  'center',
  0.8,
  '#ffffff',
  '#000000',
  true,
  10,
  true,
  now() - interval '5 days',
  now() + interval '60 days',
  admin.id,
  now() - interval '5 days',
  now() - interval '5 days'
FROM gallery_photos gp
CROSS JOIN members admin
WHERE gp.title = 'Golden Hour at Kootenay Lake'
  AND admin.email = 'admin@nelsontech.ca';

INSERT INTO page_headers (
  page_slug, photo_id, title, subtitle, overlay_position, 
  overlay_opacity, text_color, darken_image, priority, 
  is_active, created_by, created_at, updated_at
)
SELECT 
  'events',
  gp.id,
  'Tech Events & Workshops',
  'Learn, Connect, and Grow Together',
  'bottom-left',
  0.7,
  '#ffffff',
  true,
  5,
  true,
  admin.id,
  now() - interval '3 days',
  now() - interval '3 days'
FROM gallery_photos gp
CROSS JOIN members admin
WHERE gp.title = 'AI Workshop Presentation'
  AND admin.email = 'admin@nelsontech.ca';

-- Add photo tags using the junction table
INSERT INTO photo_tags (photo_id, tag_id, tagged_by, created_at)
SELECT 
  gp.id,
  t.id,
  gp.user_id,
  gp.created_at
FROM gallery_photos gp
CROSS JOIN tags t
WHERE 
  (gp.title = 'Golden Hour at Kootenay Lake' AND t.slug IN ('photography', 'landscape', 'nature')) OR
  (gp.title = 'AI Workshop Presentation' AND t.slug IN ('photography', 'event-photography', 'ai', 'events')) OR
  (gp.title = 'Innovative Team Portrait' AND t.slug IN ('photography', 'portrait', 'business')) OR
  (gp.title = 'Handcrafted Pottery Collection' AND t.slug IN ('photography', 'products', 'local'))
ON CONFLICT (photo_id, tag_id) DO NOTHING;

-- Add gallery tags using the junction table
INSERT INTO gallery_tags (gallery_id, tag_id, tagged_by, created_at)
SELECT 
  g.id,
  t.id,
  g.user_id,
  g.created_at
FROM user_galleries g
CROSS JOIN tags t
WHERE 
  (g.slug = 'nature-photography' AND t.slug IN ('photography', 'landscape', 'nature')) OR
  (g.slug = 'tech-events' AND t.slug IN ('photography', 'event-photography', 'events', 'community')) OR
  (g.slug = 'street-photography' AND t.slug IN ('photography', 'street-photography')) OR
  (g.slug = 'business-profiles' AND t.slug IN ('photography', 'portrait', 'business')) OR
  (g.slug = 'product-photography' AND t.slug IN ('photography', 'products'))
ON CONFLICT (gallery_id, tag_id) DO NOTHING;

-- Update tag usage counts
UPDATE tags SET usage_count = (
  SELECT COUNT(*) FROM (
    SELECT tag_id FROM photo_tags WHERE tag_id = tags.id
    UNION ALL
    SELECT tag_id FROM gallery_tags WHERE tag_id = tags.id
  ) AS combined_usage
);

-- Set some random view counts for engagement
UPDATE gallery_photos SET 
  view_count = floor(random() * 500) + 50,
  updated_at = now()
WHERE visibility = 'visible' AND moderation_status = 'approved';

UPDATE user_galleries SET 
  view_count = floor(random() * 200) + 25,
  updated_at = now()
WHERE visibility = 'visible' AND privacy_level = 'public';

-- Create a sample private gallery
INSERT INTO user_galleries (id, user_id, title, description, slug, privacy_level, visibility, sort_order, tags, created_at, updated_at) 
SELECT 
  gen_random_uuid(),
  m.id,
  'Personal Projects',
  'Work-in-progress shots and experimental photography. Private collection for personal reference.',
  'personal-projects',
  'private',
  'visible',
  99,
  ARRAY['experimental', 'personal', 'wip'],
  now() - interval '10 days',
  now() - interval '1 day'
FROM members m WHERE m.name = 'Sarah Johnson'
ON CONFLICT (user_id, slug) DO NOTHING;

-- Add a photo to the private gallery
INSERT INTO gallery_photos (
  id, gallery_id, user_id, file_name, original_file_name, file_size, mime_type, 
  storage_path, thumbnail_path, medium_path, title, description, alt_text,
  width, height, sort_order, visibility, processing_status,
  moderation_status, tags, created_at, updated_at
)
SELECT 
  gen_random_uuid(),
  g.id,
  g.user_id,
  'experimental-macro-001.jpg',
  'EXP_001.JPG',
  1234567,
  'image/jpeg',
  'photos/' || g.user_id || '/' || g.id || '/originals/experimental-macro-001.jpg',
  'photos/' || g.user_id || '/' || g.id || '/thumbnails/experimental-macro-001.jpg',
  'photos/' || g.user_id || '/' || g.id || '/medium/experimental-macro-001.jpg',
  'Macro Experiment #1',
  'Testing new macro lens techniques with water droplets on leaves.',
  'Close-up experimental macro photography of water droplets',
  2400, 1600, 1, 'visible', 'completed', 'pending',
  ARRAY['macro', 'experimental', 'water', 'leaves'],
  now() - interval '8 days',
  now() - interval '8 days'
FROM user_galleries g WHERE g.slug = 'personal-projects';

-- Final update of all counts
UPDATE user_galleries SET 
  photo_count = (SELECT COUNT(*) FROM gallery_photos WHERE gallery_id = user_galleries.id),
  updated_at = now();

-- Add some sample EXIF data to a few photos
UPDATE gallery_photos SET 
  exif_data = jsonb_build_object(
    'camera', jsonb_build_object(
      'make', camera_make,
      'model', camera_model,
      'lens', 'RF 24-70mm f/2.8L IS USM'
    ),
    'settings', jsonb_build_object(
      'focal_length', focal_length,
      'aperture', aperture,
      'shutter_speed', shutter_speed,
      'iso', iso_speed
    ),
    'location', jsonb_build_object(
      'altitude', 543.2,
      'direction', 'NW'
    ),
    'processing', jsonb_build_object(
      'software', 'Adobe Lightroom',
      'version', '2024.1',
      'preset', 'Landscape Enhanced'
    )
  )
WHERE title IN ('Golden Hour at Kootenay Lake', 'Morning Mist on the Trail', 'AI Workshop Presentation');