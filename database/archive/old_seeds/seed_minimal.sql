-- Minimal seed script with only essential fields

-- Add more members if needed
INSERT INTO members (name, title, bio, location, image, status, featured) VALUES
('Sarah Mitchell', 'Senior Full-Stack Developer', 'Passionate about building scalable web applications with React and Node.js.', 'Nelson, BC', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400', 'published', true),
('Marcus Chen', 'Product Manager', 'Experienced product manager with 8+ years in tech startups.', 'Castlegar, BC', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400', 'published', true)
ON CONFLICT (id) DO NOTHING;

-- Add groups without the 'type' field (we'll discover what fields exist)
INSERT INTO groups (name, description, location, image, status, featured, visibility) VALUES
('Nelson Tech Meetup', 'Monthly meetups for developers, designers, and tech enthusiasts in the Nelson area.', 'Nelson, BC', 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800', 'published', true, 'open'),
('Kootenay Entrepreneurs', 'Supporting startup founders and business owners throughout the Kootenay region.', 'Kootenay Region', 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800', 'published', true, 'open')
ON CONFLICT (id) DO NOTHING;

-- Add events (these should work based on our earlier check)
INSERT INTO events (title, description, date, time, location, image, status, featured, organizer_id, type) 
SELECT 
  'React Workshop', 
  'Learn React hooks and modern patterns.', 
  '2025-02-15', 
  '18:00', 
  'Nelson Tech Hub', 
  'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800', 
  'published', 
  true, 
  (SELECT id FROM members LIMIT 1),
  'in-person'
WHERE EXISTS (SELECT 1 FROM members)
ON CONFLICT (id) DO NOTHING;

-- Verify what was inserted
SELECT 'Groups inserted:' as info, COUNT(*) FROM groups WHERE status = 'published';
SELECT 'Events inserted:' as info, COUNT(*) FROM events WHERE status = 'published';
SELECT 'Members total:' as info, COUNT(*) FROM members WHERE status = 'published';