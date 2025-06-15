-- Corrected Database Seed Script
-- Matches the actual database schema

-- Sample Members (if not already exists)
INSERT INTO members (name, title, bio, location, image, status, featured) VALUES
('Sarah Mitchell', 'Senior Full-Stack Developer', 'Passionate about building scalable web applications with React and Node.js. Love mentoring junior developers and contributing to open source projects. Currently working on improving developer tools and accessibility.', 'Nelson, BC', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400', 'published', true),
('Marcus Chen', 'Product Manager', 'Experienced product manager with 8+ years in tech startups. Specialized in user research, agile development, and bringing innovative digital products to market. Always looking to connect with fellow entrepreneurs.', 'Castlegar, BC', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400', 'published', true),
('Emily Rodriguez', 'UX/UI Designer', 'Creative designer focused on user-centered design principles. Expertise in design systems, prototyping, and user research. Passionate about making technology accessible and inclusive for all users.', 'Nelson, BC', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400', 'published', false),
('David Thompson', 'DevOps Engineer', 'Infrastructure and automation specialist with expertise in cloud platforms, CI/CD, and containerization. Helping teams deploy faster and more reliably while maintaining security best practices.', 'Kaslo, BC', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400', 'published', false),
('Lisa Park', 'Data Scientist', 'Machine learning enthusiast working on predictive analytics and business intelligence solutions. Background in statistics and computer science with focus on environmental data analysis.', 'Nelson, BC', 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400', 'published', false)
ON CONFLICT (id) DO NOTHING;

-- Sample Groups with visibility field
INSERT INTO groups (name, description, type, max_members, location, image, status, featured, visibility) VALUES
('Nelson Tech Meetup', 'Monthly meetups for developers, designers, and tech enthusiasts in the Nelson area. We discuss latest trends, share knowledge, and network with like-minded professionals.', 'meetup', 100, 'Nelson, BC', 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800', 'published', true, 'open'),
('Kootenay Entrepreneurs', 'Supporting startup founders and business owners throughout the Kootenay region. Monthly pitch nights, networking events, and mentorship opportunities.', 'business', 75, 'Kootenay Region', 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800', 'published', true, 'open'),
('Women in Tech Kootenays', 'Empowering women in technology through mentorship, networking, and professional development. Creating an inclusive community for all skill levels and career stages.', 'professional', 150, 'Kootenay Region', 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800', 'published', false, 'closed'),
('Outdoor Tech Adventures', 'Combining our love for technology with outdoor activities. Hiking meetups, tech talks in nature, and discussions about outdoor gear and apps.', 'hobby', 50, 'Nelson, BC', 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800', 'published', false, 'open')
ON CONFLICT (id) DO NOTHING;

-- Sample Events with type field
INSERT INTO events (title, description, date, time, location, image, status, featured, organizer_id, type) 
SELECT 
  title, description, date, time, location, image, status, featured, 
  (SELECT id FROM members WHERE name = 'Sarah Mitchell' LIMIT 1) as organizer_id,
  type
FROM (VALUES
  ('React Hooks Deep Dive Workshop', 'Join us for an intensive workshop covering advanced React Hooks patterns, custom hooks, and performance optimization techniques. Perfect for intermediate to advanced React developers.', '2025-02-15', '18:00', 'Nelson Tech Hub, 123 Baker St, Nelson, BC', 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800', 'published', true, 'in-person'),
  ('Startup Pitch Night', 'Monthly pitch event where local entrepreneurs present their ideas to a panel of investors and community members. Great networking opportunity for founders and supporters.', '2025-02-22', '19:00', 'Kootenay Co-op Community Room, Nelson, BC', 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800', 'published', true, 'in-person'),
  ('AI and Machine Learning Panel', 'Expert panel discussion on the current state and future of AI/ML technologies, with focus on practical applications for small businesses and startups.', '2025-02-28', '17:30', 'Selkirk College, Castlegar Campus', 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800', 'published', false, 'hybrid'),
  ('Tech Career Fair', 'Connect with local tech companies and remote-friendly employers. Bring your resume and meet hiring managers from across the Kootenay region.', '2025-03-05', '10:00', 'Nelson Community Centre, Nelson, BC', 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800', 'published', false, 'in-person'),
  ('Remote Work Best Practices', 'Learn tips and tricks for effective remote work from seasoned professionals. Topics include communication, productivity tools, and work-life balance.', '2025-03-12', '12:00', 'Online', 'https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b?w=800', 'published', true, 'online')
) AS event_data(title, description, date, time, location, image, status, featured, type)
WHERE EXISTS (SELECT 1 FROM members WHERE name = 'Sarah Mitchell' LIMIT 1)
ON CONFLICT (id) DO NOTHING;

-- Sample News Articles
INSERT INTO news (title, slug, summary, content, image, author_id, status, featured, published_at) 
SELECT 
  title, slug, summary, content, image, 
  (SELECT id FROM members WHERE name = 'Marcus Chen' LIMIT 1) as author_id,
  status, featured, published_at
FROM (VALUES
  ('Nelson Tech Community Hits 500 Members Milestone', 'nelson-tech-500-members', 'Our growing community celebrates reaching 500 active members with exciting plans for expanded programming and resources.', 'We are thrilled to announce that the Nelson Tech Community has reached an incredible milestone of 500 active members!', 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800', 'published', true, '2025-01-10 09:00:00'),
  ('New Partnership with Selkirk College Announced', 'selkirk-college-partnership', 'Exciting collaboration will provide students with mentorship opportunities and real-world project experience with local tech companies.', 'We''re excited to announce a groundbreaking partnership between the Nelson Tech Community and Selkirk College.', 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800', 'published', false, '2025-01-05 14:30:00')
) AS news_data(title, slug, summary, content, image, status, featured, published_at)
WHERE EXISTS (SELECT 1 FROM members WHERE name = 'Marcus Chen' LIMIT 1)
ON CONFLICT (id) DO NOTHING;

-- Verify data was inserted
SELECT 'Members:' as table_name, COUNT(*) as count FROM members WHERE status = 'published'
UNION ALL
SELECT 'Companies:' as table_name, COUNT(*) as count FROM companies WHERE status = 'published'
UNION ALL
SELECT 'Groups:' as table_name, COUNT(*) as count FROM groups WHERE status = 'published'
UNION ALL
SELECT 'Events:' as table_name, COUNT(*) as count FROM events WHERE status = 'published'
UNION ALL
SELECT 'News:' as table_name, COUNT(*) as count FROM news WHERE status = 'published';