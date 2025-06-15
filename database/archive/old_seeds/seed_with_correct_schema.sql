-- Seed script with correct schema based on actual database structure

-- First ensure we have members to reference
INSERT INTO members (name, title, bio, location, image, status, featured) VALUES
('Sarah Mitchell', 'Senior Full-Stack Developer', 'Passionate about building scalable web applications with React and Node.js.', 'Nelson, BC', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400', 'published', true),
('Marcus Chen', 'Product Manager', 'Experienced product manager with 8+ years in tech startups.', 'Castlegar, BC', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400', 'published', true),
('Emily Rodriguez', 'UX/UI Designer', 'Creative designer focused on user-centered design principles.', 'Nelson, BC', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400', 'published', false)
ON CONFLICT (id) DO NOTHING;

-- Groups table (without 'type' column since it doesn't exist)
-- Need to check if max_members exists or not
INSERT INTO groups (name, description, location, image, status, featured, visibility) VALUES
('Nelson Tech Meetup', 'Monthly meetups for developers, designers, and tech enthusiasts in the Nelson area.', 'Nelson, BC', 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800', 'published', true, 'open'),
('Kootenay Entrepreneurs', 'Supporting startup founders and business owners throughout the Kootenay region.', 'Kootenay Region', 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800', 'published', true, 'open'),
('Women in Tech Kootenays', 'Empowering women in technology through mentorship and networking.', 'Kootenay Region', 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800', 'published', false, 'closed'),
('Outdoor Tech Adventures', 'Combining technology with outdoor activities.', 'Nelson, BC', 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800', 'published', false, 'open')
ON CONFLICT (id) DO NOTHING;

-- Events table (with correct columns)
INSERT INTO events (title, description, date, time, location, image, status, featured, organizer_id, type) 
SELECT 
  title, description, date, time, location, image, status, featured, 
  (SELECT id FROM members WHERE name = 'Sarah Mitchell' LIMIT 1) as organizer_id,
  type
FROM (VALUES
  ('React Hooks Workshop', 'Learn advanced React patterns and hooks.', '2025-02-15', '18:00', 'Nelson Tech Hub', 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800', 'published', true, 'in-person'),
  ('Startup Pitch Night', 'Monthly pitch event for entrepreneurs.', '2025-02-22', '19:00', 'Kootenay Co-op', 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800', 'published', true, 'in-person'),
  ('Remote Work Best Practices', 'Tips for effective remote work.', '2025-03-12', '12:00', 'Online', 'https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b?w=800', 'published', true, 'online')
) AS event_data(title, description, date, time, location, image, status, featured, type)
WHERE EXISTS (SELECT 1 FROM members WHERE name = 'Sarah Mitchell')
ON CONFLICT (id) DO NOTHING;

-- News table (with correct column names - no 'summary', use 'excerpt' instead)
INSERT INTO news (title, slug, content, excerpt, hero_image, author_id, status, featured, publish_date, tags) 
SELECT 
  title, slug, content, excerpt, hero_image,
  (SELECT id FROM members WHERE name = 'Marcus Chen' LIMIT 1) as author_id,
  status, featured, publish_date, tags
FROM (VALUES
  (
    'Nelson Tech Community Hits 500 Members', 
    'nelson-tech-500-members', 
    'We are thrilled to announce that the Nelson Tech Community has reached an incredible milestone of 500 active members! This achievement represents the growing strength of our local tech ecosystem.',
    'Our growing community celebrates reaching 500 active members.',
    'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800',
    'published', 
    true, 
    '2025-01-10'::date,
    ARRAY['community', 'milestone', 'growth']
  ),
  (
    'New Partnership with Selkirk College', 
    'selkirk-college-partnership', 
    'We are excited to announce a groundbreaking partnership between the Nelson Tech Community and Selkirk College that will bridge the gap between education and industry.',
    'Exciting collaboration with Selkirk College for student mentorship.',
    'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800',
    'published', 
    false, 
    '2025-01-05'::date,
    ARRAY['education', 'partnership', 'students']
  )
) AS news_data(title, slug, content, excerpt, hero_image, status, featured, publish_date, tags)
WHERE EXISTS (SELECT 1 FROM members WHERE name = 'Marcus Chen')
ON CONFLICT (id) DO NOTHING;

-- Resources table (if it exists)
INSERT INTO resources (title, description, url, status, featured, created_by) 
SELECT 
  title, description, url, status, featured,
  (SELECT id FROM members WHERE name = 'Emily Rodriguez' LIMIT 1) as created_by
FROM (VALUES
  ('React Developer Course', 'Comprehensive React course from basics to advanced.', 'https://example.com/react-course', 'published', true),
  ('JavaScript ES6 Cheat Sheet', 'Quick reference for modern JavaScript.', 'https://example.com/js-cheatsheet', 'published', true)
) AS resource_data(title, description, url, status, featured)
WHERE EXISTS (SELECT 1 FROM members WHERE name = 'Emily Rodriguez')
ON CONFLICT (id) DO NOTHING;

-- Verify insertions
SELECT 'Members:' as entity, COUNT(*) as total, COUNT(*) FILTER (WHERE status = 'published') as published FROM members
UNION ALL
SELECT 'Companies:' as entity, COUNT(*) as total, COUNT(*) FILTER (WHERE status = 'published') as published FROM companies
UNION ALL
SELECT 'Groups:' as entity, COUNT(*) as total, COUNT(*) FILTER (WHERE status = 'published') as published FROM groups
UNION ALL
SELECT 'Events:' as entity, COUNT(*) as total, COUNT(*) FILTER (WHERE status = 'published') as published FROM events
UNION ALL
SELECT 'News:' as entity, COUNT(*) as total, COUNT(*) FILTER (WHERE status = 'published') as published FROM news;