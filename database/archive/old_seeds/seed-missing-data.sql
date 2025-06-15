-- Seed only the missing data (events and groups)

-- Sample Groups (since groups table is empty)
INSERT INTO groups (name, description, type, max_members, location, image, status, featured, visibility) VALUES
('Nelson Tech Meetup', 'Monthly meetups for developers, designers, and tech enthusiasts in the Nelson area. We discuss latest trends, share knowledge, and network with like-minded professionals.', 'meetup', 100, 'Nelson, BC', 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800', 'published', true, 'open'),
('Kootenay Entrepreneurs', 'Supporting startup founders and business owners throughout the Kootenay region. Monthly pitch nights, networking events, and mentorship opportunities.', 'business', 75, 'Kootenay Region', 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800', 'published', true, 'open'),
('Women in Tech Kootenays', 'Empowering women in technology through mentorship, networking, and professional development. Creating an inclusive community for all skill levels and career stages.', 'professional', 150, 'Kootenay Region', 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800', 'published', false, 'closed'),
('Outdoor Tech Adventures', 'Combining our love for technology with outdoor activities. Hiking meetups, tech talks in nature, and discussions about outdoor gear and apps.', 'hobby', 50, 'Nelson, BC', 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800', 'published', false, 'open')
ON CONFLICT DO NOTHING;

-- Sample Events (since events table is empty)
-- First, we need to get a member ID to use as organizer
-- Using a subquery to get the first available member
INSERT INTO events (title, description, date, time, location, image, status, featured, organizer_id, type) 
SELECT 
  title, description, date, time, location, image, status, featured, 
  (SELECT id FROM members LIMIT 1) as organizer_id,
  type
FROM (VALUES
  ('React Hooks Deep Dive Workshop', 'Join us for an intensive workshop covering advanced React Hooks patterns, custom hooks, and performance optimization techniques. Perfect for intermediate to advanced React developers.', '2025-02-15', '18:00', 'Nelson Tech Hub, 123 Baker St, Nelson, BC', 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800', 'published', true, 'in-person'),
  ('Startup Pitch Night', 'Monthly pitch event where local entrepreneurs present their ideas to a panel of investors and community members. Great networking opportunity for founders and supporters.', '2025-02-22', '19:00', 'Kootenay Co-op Community Room, Nelson, BC', 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800', 'published', true, 'in-person'),
  ('AI and Machine Learning Panel', 'Expert panel discussion on the current state and future of AI/ML technologies, with focus on practical applications for small businesses and startups.', '2025-02-28', '17:30', 'Selkirk College, Castlegar Campus', 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800', 'published', false, 'hybrid'),
  ('Tech Career Fair', 'Connect with local tech companies and remote-friendly employers. Bring your resume and meet hiring managers from across the Kootenay region.', '2025-03-05', '10:00', 'Nelson Community Centre, Nelson, BC', 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800', 'published', false, 'in-person'),
  ('Remote Work Best Practices', 'Learn tips and tricks for effective remote work from seasoned professionals. Topics include communication, productivity tools, and work-life balance.', '2025-03-12', '12:00', 'Online', 'https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b?w=800', 'published', true, 'online')
) AS event_data(title, description, date, time, location, image, status, featured, type)
WHERE EXISTS (SELECT 1 FROM members LIMIT 1) -- Only insert if we have at least one member
ON CONFLICT DO NOTHING;

-- Verify the data was inserted
SELECT 'Groups inserted:' as info, COUNT(*) as count FROM groups WHERE status = 'published';
SELECT 'Events inserted:' as info, COUNT(*) as count FROM events WHERE status = 'published';