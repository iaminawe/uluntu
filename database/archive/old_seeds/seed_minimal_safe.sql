-- Minimal seed script using only essential columns

-- Members (these should work based on previous successful inserts)
INSERT INTO members (name, title, bio, location, image, status, featured) VALUES
('Sarah Mitchell', 'Senior Full-Stack Developer', 'React and Node.js expert.', 'Nelson, BC', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400', 'published', true),
('Marcus Chen', 'Product Manager', 'Tech startup veteran.', 'Castlegar, BC', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400', 'published', true),
('Emily Rodriguez', 'UX/UI Designer', 'User-centered design expert.', 'Nelson, BC', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400', 'published', false)
ON CONFLICT (id) DO NOTHING;

-- Groups - using only the most basic columns we know exist
INSERT INTO groups (name, description, status, visibility) VALUES
('Nelson Tech Meetup', 'Monthly tech meetups in Nelson.', 'published', 'open'),
('Kootenay Entrepreneurs', 'Supporting local founders.', 'published', 'open'),
('Women in Tech Kootenays', 'Empowering women in technology.', 'published', 'closed'),
('Outdoor Tech Adventures', 'Tech meets outdoor activities.', 'published', 'open')
ON CONFLICT (id) DO NOTHING;

-- Events - these columns worked before
INSERT INTO events (title, description, date, time, location, status, organizer_id, type) 
SELECT 
  'React Workshop', 
  'Learn React hooks.', 
  '2025-02-15', 
  '18:00', 
  'Nelson Tech Hub', 
  'published',
  (SELECT id FROM members WHERE name = 'Sarah Mitchell' LIMIT 1),
  'in-person'
WHERE EXISTS (SELECT 1 FROM members WHERE name = 'Sarah Mitchell')
ON CONFLICT (id) DO NOTHING;

-- News with correct columns
INSERT INTO news (title, slug, content, excerpt, hero_image, author_id, status, publish_date) 
SELECT 
  'Tech Community Milestone', 
  'tech-community-milestone', 
  'We reached 500 members!',
  'Community milestone achieved.',
  'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800',
  (SELECT id FROM members WHERE name = 'Marcus Chen' LIMIT 1),
  'published',
  '2025-01-10'::date
WHERE EXISTS (SELECT 1 FROM members WHERE name = 'Marcus Chen')
ON CONFLICT (id) DO NOTHING;

-- Check what was inserted
SELECT 'Data seeded. Checking counts...' as status;
SELECT 'Members:' as table_name, COUNT(*) as count FROM members;
SELECT 'Groups:' as table_name, COUNT(*) as count FROM groups;
SELECT 'Events:' as table_name, COUNT(*) as count FROM events;
SELECT 'News:' as table_name, COUNT(*) as count FROM news;