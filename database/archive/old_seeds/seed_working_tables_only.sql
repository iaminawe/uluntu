-- Seed only the tables we know work

-- Members (confirmed working)
INSERT INTO members (name, title, bio, location, image, status, featured) VALUES
('Sarah Mitchell', 'Senior Full-Stack Developer', 'Passionate about building scalable web applications with React and Node.js.', 'Nelson, BC', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400', 'published', true),
('Marcus Chen', 'Product Manager', 'Experienced product manager with 8+ years in tech startups.', 'Castlegar, BC', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400', 'published', true),
('Emily Rodriguez', 'UX/UI Designer', 'Creative designer focused on user-centered design principles.', 'Nelson, BC', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400', 'published', false),
('David Thompson', 'DevOps Engineer', 'Infrastructure specialist with cloud expertise.', 'Kaslo, BC', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400', 'published', false)
ON CONFLICT (id) DO NOTHING;

-- Groups (confirmed working with hero_image)
INSERT INTO groups (name, description, hero_image, visibility, status, featured) VALUES
('Nelson Tech Meetup', 'Monthly meetups for developers, designers, and tech enthusiasts in the Nelson area.', 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800', 'open', 'published', true),
('Kootenay Entrepreneurs', 'Supporting startup founders and business owners throughout the Kootenay region.', 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800', 'open', 'published', true),
('Women in Tech Kootenays', 'Empowering women in technology through mentorship and networking.', 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800', 'closed', 'published', false),
('Outdoor Tech Adventures', 'Combining technology with outdoor activities.', 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800', 'open', 'published', false)
ON CONFLICT (id) DO NOTHING;

-- Companies (confirmed working)
INSERT INTO companies (name, description, industry, website, size, founded, location, logo, status, featured) VALUES
('Tech Innovations Ltd', 'Leading software development company in the Kootenays.', ARRAY['Technology', 'Software'], 'https://techinnovations.ca', '25-50', '2019', 'Nelson, BC', 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400', 'published', true),
('Digital Creators Co', 'Creative digital agency specializing in web and mobile.', ARRAY['Design', 'Marketing'], 'https://digitalcreators.ca', '10-25', '2021', 'Castlegar, BC', 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=400', 'published', false)
ON CONFLICT (id) DO NOTHING;

-- News (confirmed working)
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

-- Verify all data was inserted (skip events for now)
SELECT 'Data insertion complete. Checking counts:' as status;
SELECT entity, total, published FROM (
  SELECT 'Members' as entity, COUNT(*) as total, COUNT(*) FILTER (WHERE status = 'published') as published FROM members
  UNION ALL
  SELECT 'Companies', COUNT(*), COUNT(*) FILTER (WHERE status = 'published') FROM companies
  UNION ALL
  SELECT 'Groups', COUNT(*), COUNT(*) FILTER (WHERE status = 'published') FROM groups
  UNION ALL
  SELECT 'News', COUNT(*), COUNT(*) FILTER (WHERE status = 'published') FROM news
) counts
ORDER BY entity;