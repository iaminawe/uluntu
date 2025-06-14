-- Comprehensive Database Seed Script
-- Run this after applying newsletter migration and RLS policies

-- Sample Companies
INSERT INTO companies (name, description, industry, website, employees, founded, location, logo, status, featured) VALUES
('Nelson Tech Solutions', 'Full-service web development and digital solutions company specializing in modern tech stacks and user experience design.', 'Technology', 'https://nelsontechsolutions.com', '25-50', '2018', 'Nelson, BC', 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400', 'published', true),
('Kootenay Digital Marketing', 'Digital marketing agency helping local businesses grow their online presence through strategic SEO, social media, and content marketing.', 'Marketing', 'https://kootenaydigital.ca', '10-25', '2020', 'Castlegar, BC', 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=400', 'published', true),
('Mountain Innovation Labs', 'R&D company focused on sustainable technology solutions for rural communities and environmental monitoring systems.', 'Clean Technology', 'https://mountaininnovation.ca', '15-30', '2019', 'Kaslo, BC', 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400', 'published', false),
('Selkirk Software Co.', 'Custom software development company specializing in enterprise solutions and mobile applications for outdoor recreation industry.', 'Software Development', 'https://selkirksoftware.com', '5-15', '2021', 'Nelson, BC', 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=400', 'published', false)
ON CONFLICT DO NOTHING;

-- Sample Members (Published Profiles)
INSERT INTO members (name, title, bio, location, image, status, featured) VALUES
('Sarah Mitchell', 'Senior Full-Stack Developer', 'Passionate about building scalable web applications with React and Node.js. Love mentoring junior developers and contributing to open source projects. Currently working on improving developer tools and accessibility.', 'Nelson, BC', 'https://images.unsplash.com/photo-1494790108755-2616b612b789?w=400', 'published', true),
('Marcus Chen', 'Product Manager', 'Experienced product manager with 8+ years in tech startups. Specialized in user research, agile development, and bringing innovative digital products to market. Always looking to connect with fellow entrepreneurs.', 'Castlegar, BC', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400', 'published', true),
('Emily Rodriguez', 'UX/UI Designer', 'Creative designer focused on user-centered design principles. Expertise in design systems, prototyping, and user research. Passionate about making technology accessible and inclusive for all users.', 'Nelson, BC', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400', 'published', false),
('David Thompson', 'DevOps Engineer', 'Infrastructure and automation specialist with expertise in cloud platforms, CI/CD, and containerization. Helping teams deploy faster and more reliably while maintaining security best practices.', 'Kaslo, BC', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400', 'published', false),
('Lisa Park', 'Data Scientist', 'Machine learning enthusiast working on predictive analytics and business intelligence solutions. Background in statistics and computer science with focus on environmental data analysis.', 'Nelson, BC', 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400', 'published', false)
ON CONFLICT DO NOTHING;

-- Sample Member Skills
INSERT INTO member_skills (member_id, skill) 
SELECT m.id, skill
FROM members m, UNNEST(ARRAY[
  'React', 'Node.js', 'TypeScript', 'PostgreSQL', 'Docker'
]) AS skill
WHERE m.name = 'Sarah Mitchell'
ON CONFLICT DO NOTHING;

INSERT INTO member_skills (member_id, skill) 
SELECT m.id, skill
FROM members m, UNNEST(ARRAY[
  'Product Management', 'Agile', 'User Research', 'Analytics', 'Strategy'
]) AS skill
WHERE m.name = 'Marcus Chen'
ON CONFLICT DO NOTHING;

INSERT INTO member_skills (member_id, skill) 
SELECT m.id, skill
FROM members m, UNNEST(ARRAY[
  'UI Design', 'UX Research', 'Figma', 'Prototyping', 'Design Systems'
]) AS skill
WHERE m.name = 'Emily Rodriguez'
ON CONFLICT DO NOTHING;

-- Sample Groups
INSERT INTO groups (name, description, type, max_members, location, image, status, featured) VALUES
('Nelson Tech Meetup', 'Monthly meetups for developers, designers, and tech enthusiasts in the Nelson area. We discuss latest trends, share knowledge, and network with like-minded professionals.', 'meetup', 100, 'Nelson, BC', 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800', 'published', true),
('Kootenay Entrepreneurs', 'Supporting startup founders and business owners throughout the Kootenay region. Monthly pitch nights, networking events, and mentorship opportunities.', 'business', 75, 'Kootenay Region', 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800', 'published', true),
('Women in Tech Kootenays', 'Empowering women in technology through mentorship, networking, and professional development. Creating an inclusive community for all skill levels and career stages.', 'professional', 150, 'Kootenay Region', 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800', 'published', false),
('Outdoor Tech Adventures', 'Combining our love for technology with outdoor activities. Hiking meetups, tech talks in nature, and discussions about outdoor gear and apps.', 'hobby', 50, 'Nelson, BC', 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800', 'published', false)
ON CONFLICT DO NOTHING;

-- Sample Events
INSERT INTO events (title, description, date, time, location, image, status, featured, organizer_id) 
SELECT 
  title, description, date, time, location, image, status, featured, m.id
FROM (VALUES
  ('React Hooks Deep Dive Workshop', 'Join us for an intensive workshop covering advanced React Hooks patterns, custom hooks, and performance optimization techniques. Perfect for intermediate to advanced React developers.', '2024-07-15', '18:00', 'Nelson Tech Hub, 123 Baker St, Nelson, BC', 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800', 'published', true),
  ('Startup Pitch Night', 'Monthly pitch event where local entrepreneurs present their ideas to a panel of investors and community members. Great networking opportunity for founders and supporters.', '2024-07-22', '19:00', 'Kootenay Co-op Community Room, Nelson, BC', 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800', 'published', true),
  ('AI and Machine Learning Panel', 'Expert panel discussion on the current state and future of AI/ML technologies, with focus on practical applications for small businesses and startups.', '2024-07-28', '17:30', 'Selkirk College, Castlegar Campus', 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800', 'published', false),
  ('Tech Career Fair', 'Connect with local tech companies and remote-friendly employers. Bring your resume and meet hiring managers from across the Kootenay region.', '2024-08-05', '10:00', 'Nelson Community Centre, Nelson, BC', 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800', 'published', false)
) AS event_data(title, description, date, time, location, image, status, featured)
CROSS JOIN (SELECT id FROM members WHERE name = 'Sarah Mitchell' LIMIT 1) m
ON CONFLICT DO NOTHING;

-- Sample News Articles
INSERT INTO news (title, slug, summary, content, image, author_id, status, featured, published_at) 
SELECT 
  title, slug, summary, content, image, m.id, status, featured, published_at
FROM (VALUES
  ('Nelson Tech Community Hits 500 Members Milestone', 'nelson-tech-500-members', 'Our growing community celebrates reaching 500 active members with exciting plans for expanded programming and resources.', 'We are thrilled to announce that the Nelson Tech Community has reached an incredible milestone of 500 active members! This achievement represents the growing strength and vibrancy of our local technology ecosystem.

When we started this community three years ago, our goal was simple: connect technology professionals, entrepreneurs, and enthusiasts throughout the Kootenay region. What we''ve built together exceeds our wildest expectations.

Our members represent diverse backgrounds - from seasoned software architects to budding entrepreneurs, from UX designers to data scientists. This diversity is our strength, fostering innovation and collaboration across disciplines.

**What''s Next:**
- Monthly speaker series featuring industry experts
- Expanded mentorship program
- Annual tech conference planning underway
- New partnership with Selkirk College for student programs

Thank you to every member who has contributed to making this community special. Here''s to the next 500 members and beyond!', 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800', 'published', true, '2024-06-10 09:00:00'),
  
  ('New Partnership with Selkirk College Announced', 'selkirk-college-partnership', 'Exciting collaboration will provide students with mentorship opportunities and real-world project experience with local tech companies.', 'We''re excited to announce a groundbreaking partnership between the Nelson Tech Community and Selkirk College that will bridge the gap between education and industry.

This collaboration will offer computer science and business students unprecedented access to mentorship, internships, and collaborative projects with established tech professionals and companies in our region.

**Program Highlights:**
- Monthly mentorship matching sessions
- Student showcase events
- Industry guest lectures and workshops
- Collaborative capstone project opportunities
- Career placement assistance

The program officially launches in September 2024, with applications opening in July. We encourage both students and industry professionals to participate in this exciting initiative.

"This partnership represents exactly the kind of industry-education collaboration our region needs," says Dr. Sarah Williams, Program Director at Selkirk College. "Our students will gain invaluable real-world experience while contributing fresh perspectives to local businesses."

Stay tuned for more details on how to get involved!', 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800', 'published', false, '2024-06-05 14:30:00')
) AS news_data(title, slug, summary, content, image, status, featured, published_at)
CROSS JOIN (SELECT id FROM members WHERE name = 'Marcus Chen' LIMIT 1) m
ON CONFLICT DO NOTHING;

-- Sample Job Opportunities
INSERT INTO opportunities (title, type, description, requirements, location, company_name, salary_range, remote_ok, status, featured, posted_by) 
SELECT 
  title, type, description, requirements, location, company_name, salary_range, remote_ok, status, featured, m.id
FROM (VALUES
  ('Senior Full Stack Developer', 'job', 'We are seeking a senior full stack developer to join our growing team. You will be responsible for developing and maintaining web applications using modern technologies and best practices.', 'Minimum 5 years experience with React, Node.js, and PostgreSQL. Experience with cloud platforms (AWS/Azure). Strong problem-solving skills and ability to work independently.', 'Nelson, BC', 'Nelson Tech Solutions', '$75,000 - $95,000', true, 'active', true),
  ('UX/UI Designer', 'job', 'Creative designer needed to join our product team. You will be responsible for user research, wireframing, prototyping, and creating beautiful, user-friendly interfaces.', 'Bachelor''s degree in Design or related field. 3+ years experience with Figma, Adobe Creative Suite. Portfolio demonstrating user-centered design process. Experience with design systems preferred.', 'Remote', 'Mountain Innovation Labs', '$60,000 - $80,000', true, 'active', true),
  ('Volunteer: Website Redesign for Local Nonprofit', 'volunteer', 'Help redesign the website for Kootenay Wildlife Rehabilitation Center. This is a great opportunity to give back to the community while building your portfolio.', 'Experience with WordPress or modern web frameworks. Basic understanding of SEO and accessibility. Available for 10-15 hours over 6 weeks.', 'Remote', 'Kootenay Wildlife Rehabilitation', 'Volunteer', true, 'active', false),
  ('Marketing Coordinator', 'job', 'Join our dynamic marketing team to help grow our digital presence and manage client campaigns. Perfect for someone passionate about digital marketing and tech.', '2+ years marketing experience, preferably in tech industry. Experience with Google Analytics, social media management, content creation. Strong communication skills.', 'Castlegar, BC', 'Kootenay Digital Marketing', '$45,000 - $60,000', false, 'active', false)
) AS opp_data(title, type, description, requirements, location, company_name, salary_range, remote_ok, status, featured)
CROSS JOIN (SELECT id FROM members WHERE name = 'Sarah Mitchell' LIMIT 1) m
ON CONFLICT DO NOTHING;

-- Sample Resources
INSERT INTO resources (title, description, type, url, difficulty, group_id, status, featured, created_by) 
SELECT 
  title, description, type, url, difficulty, g.id, status, featured, m.id
FROM (VALUES
  ('Complete React Developer Course', 'Comprehensive course covering React from basics to advanced concepts including hooks, context, and testing.', 'course', 'https://example.com/react-course', 'intermediate', 'published', true),
  ('JavaScript ES6+ Cheat Sheet', 'Quick reference guide for modern JavaScript features including arrow functions, destructuring, async/await, and more.', 'reference', 'https://example.com/js-cheatsheet', 'beginner', 'published', true),
  ('Building RESTful APIs with Node.js', 'Step-by-step tutorial for creating robust REST APIs using Express.js, MongoDB, and authentication middleware.', 'tutorial', 'https://example.com/node-api-tutorial', 'intermediate', 'published', false),
  ('UI Design Principles for Developers', 'Essential design principles every developer should know to create better user interfaces and user experiences.', 'article', 'https://example.com/ui-design-principles', 'beginner', 'published', false)
) AS resource_data(title, description, type, url, difficulty, status, featured)
CROSS JOIN (SELECT id FROM groups WHERE name = 'Nelson Tech Meetup' LIMIT 1) g
CROSS JOIN (SELECT id FROM members WHERE name = 'Emily Rodriguez' LIMIT 1) m
ON CONFLICT DO NOTHING;

-- Sample Marketplace Listings
INSERT INTO marketplace_listings (title, description, price, category, condition, location, image, status, featured, seller_id) 
SELECT 
  title, description, price, category, condition, location, image, status, featured, m.id
FROM (VALUES
  ('MacBook Pro 16" M1 Max (2021)', 'Excellent condition MacBook Pro with M1 Max chip, 32GB RAM, 1TB SSD. Perfect for development work. Includes original charger and box.', 2800.00, 'electronics', 'excellent', 'Nelson, BC', 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600', 'published', true),
  ('Standing Desk Converter', 'Adjustable standing desk converter, great for improving posture during long coding sessions. Used for 6 months, works perfectly.', 250.00, 'furniture', 'good', 'Castlegar, BC', 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600', 'published', false),
  ('Herman Miller Aeron Chair', 'Classic ergonomic office chair in size B (medium). Some wear on armrests but mechanism works perfectly. Great for home office.', 450.00, 'furniture', 'good', 'Nelson, BC', 'https://images.unsplash.com/photo-1549497538-303791108f95?w=600', 'published', true),
  ('Tech Book Bundle', 'Collection of programming books including Clean Code, Design Patterns, and JavaScript: The Good Parts. Great for learning fundamentals.', 75.00, 'books', 'good', 'Kaslo, BC', 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600', 'published', false)
) AS listing_data(title, description, price, category, condition, location, image, status, featured)
CROSS JOIN (SELECT id FROM members WHERE name = 'David Thompson' LIMIT 1) m
ON CONFLICT DO NOTHING;

-- Sample Newsletter Subscriptions
INSERT INTO newsletter_subscriptions (email, status, preferences, confirmed_at, subscribed_at) VALUES
('admin@example.com', 'active', '{
  "frequency": "weekly",
  "content_types": ["events", "news", "opportunities"],
  "format": "digest",
  "location_filter": true,
  "language": "en"
}', NOW(), NOW()),
('sarah.mitchell@example.com', 'active', '{
  "frequency": "weekly", 
  "content_types": ["events", "news", "opportunities", "marketplace"],
  "format": "digest",
  "location_filter": false,
  "language": "en"
}', NOW(), NOW()),
('marcus.chen@example.com', 'active', '{
  "frequency": "biweekly",
  "content_types": ["news", "opportunities"],
  "format": "summary",
  "location_filter": true,
  "language": "en"
}', NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Sample Newsletter Campaign
INSERT INTO newsletter_campaigns (title, subject, status, recipient_count, sent_at, created_by) 
SELECT 
  'June 2024 Community Digest',
  'Nelson Tech Community - June Updates & Upcoming Events',
  'sent',
  3,
  '2024-06-01 10:00:00',
  id
FROM members WHERE name = 'Sarah Mitchell' LIMIT 1
ON CONFLICT DO NOTHING;