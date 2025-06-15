-- Consolidated Seed Data for Nelson Tech Community Platform
-- This file combines all necessary seed data in the correct order
-- Generated on: 2024-01-14

-- ============================================
-- 1. CLEAN UP EXISTING DATA
-- ============================================
-- Clear existing data in reverse dependency order
TRUNCATE TABLE member_interests CASCADE;
TRUNCATE TABLE member_skills CASCADE;
TRUNCATE TABLE group_members CASCADE;
TRUNCATE TABLE event_attendees CASCADE;
TRUNCATE TABLE event_sessions CASCADE;
TRUNCATE TABLE company_members CASCADE;
TRUNCATE TABLE marketplace_tags CASCADE;
TRUNCATE TABLE resource_tags CASCADE;
TRUNCATE TABLE tags CASCADE;
TRUNCATE TABLE marketplace_listings CASCADE;
TRUNCATE TABLE resources CASCADE;
TRUNCATE TABLE opportunities CASCADE;
TRUNCATE TABLE news CASCADE;
TRUNCATE TABLE events CASCADE;
TRUNCATE TABLE groups CASCADE;
TRUNCATE TABLE companies CASCADE;
TRUNCATE TABLE members CASCADE;

-- ============================================
-- 2. SEED MEMBERS
-- ============================================
INSERT INTO members (id, user_id, full_name, email, bio, location, employment_status, company, skills, interests, website, github, linkedin, twitter, created_at) VALUES
('f8d3b5a0-5e1f-4b9f-9d6e-2a1b3c4d5e6f', '54fd6d34-5d30-4ad0-9c53-fc24aa0412b8', 'Sarah Chen', 'sarah.chen@example.com', 'Full-stack developer passionate about building sustainable tech solutions. Organizer of Women in Tech Kootenays.', 'Nelson, BC', 'employed', 'TechCo Solutions', ARRAY['React', 'Node.js', 'PostgreSQL', 'TypeScript'], ARRAY['sustainability', 'education', 'community building'], 'https://sarahchen.dev', 'sarahchen', 'sarah-chen', 'sarahchendev', NOW()),
('a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d', '2d4f6d34-5d30-4ad0-9c53-fc24aa0412b9', 'Mike Johnson', 'mike.johnson@example.com', 'DevOps engineer with 10+ years experience. Love automating everything!', 'Trail, BC', 'employed', 'CloudScale Inc', ARRAY['Kubernetes', 'Docker', 'AWS', 'Terraform'], ARRAY['automation', 'cloud computing', 'hiking'], 'https://mikej.dev', 'mikejohnson', 'mike-johnson-devops', 'mikejdevops', NOW()),
('b2c3d4e5-6f7a-8b9c-0d1e-2f3a4b5c6d7e', '3e5g7e45-6e41-5be1-ad64-gd35bb1523ca', 'Emma Wilson', 'emma.wilson@example.com', 'UX/UI Designer focusing on accessible and inclusive design', 'Castlegar, BC', 'freelance', NULL, ARRAY['Figma', 'Adobe XD', 'User Research', 'Accessibility'], ARRAY['design systems', 'accessibility', 'mentoring'], 'https://emmawilson.design', 'emmawilson', 'emma-wilson-ux', 'emmawilsonux', NOW()),
('c3d4e5f6-7a8b-9c0d-1e2f-3a4b5c6d7e8f', '4f6h8f56-7f52-6cf2-be75-he46cc2634db', 'James Lee', 'james.lee@example.com', 'Mobile developer specializing in React Native and Flutter', 'Rossland, BC', 'employed', 'AppWorks Studio', ARRAY['React Native', 'Flutter', 'iOS', 'Android'], ARRAY['mobile development', 'gaming', 'startups'], NULL, 'jameslee', 'james-lee-mobile', NULL, NOW()),
('d4e5f6a7-8b9c-0d1e-2f3a-4b5c6d7e8f9a', '5g7i9g67-8g63-7dg3-cf86-if57dd3745ec', 'Lisa Anderson', 'lisa.anderson@example.com', 'Data scientist passionate about machine learning and environmental data', 'Nelson, BC', 'employed', 'EcoData Labs', ARRAY['Python', 'TensorFlow', 'Data Analysis', 'Machine Learning'], ARRAY['environmental tech', 'data visualization', 'skiing'], 'https://lisaanderson.ai', 'lisaanderson', 'lisa-anderson-data', 'lisadatascience', NOW());

-- ============================================
-- 3. SEED COMPANIES
-- ============================================
INSERT INTO companies (id, name, description, logo, location, website, industry, size, founded, status) VALUES
('257de888-bc42-405a-b499-d34634486c7f', 'TechCo Solutions', 'Leading software development company in the Kootenays', 'https://placehold.co/200x200/2563eb/ffffff?text=TechCo', 'Nelson, BC', 'https://techcosolutions.ca', ARRAY['Software Development', 'Consulting'], '11-50', '2015', 'published'),
('d01b92e5-a6f7-4b8c-9d0e-2f3a4b5c6d7e', 'CloudScale Inc', 'Cloud infrastructure and DevOps consultancy', 'https://placehold.co/200x200/10b981/ffffff?text=CloudScale', 'Trail, BC', 'https://cloudscale.ca', ARRAY['Cloud Services', 'DevOps'], '51-100', '2018', 'published'),
('bc9c1d2e-3f4a-5b6c-7d8e-9f0a1b2c3d4e', 'AppWorks Studio', 'Mobile app development and design studio', 'https://placehold.co/200x200/f59e0b/ffffff?text=AppWorks', 'Rossland, BC', 'https://appworks.studio', ARRAY['Mobile Development', 'Design'], '1-10', '2020', 'published'),
('cd0d2e3f-4a5b-6c7d-8e9f-0a1b2c3d4e5f', 'EcoData Labs', 'Environmental data analytics and visualization', 'https://placehold.co/200x200/059669/ffffff?text=EcoData', 'Nelson, BC', 'https://ecodata.labs', ARRAY['Data Analytics', 'Environmental Tech'], '11-50', '2019', 'published');

-- ============================================
-- 4. SEED EVENTS
-- ============================================
INSERT INTO events (id, title, description, date, end_date, location, type, image, organizer_id, max_attendees, current_attendees, status) VALUES
('e123f456-789a-bcde-f012-3456789abcde', 'Kootenay Tech Meetup - February 2024', 'Monthly gathering of tech professionals in the Kootenays. This month: "Building Scalable Web Applications"', '2024-02-15 18:00:00', '2024-02-15 21:00:00', 'Nelson Innovation Centre', 'in-person', 'https://placehold.co/800x400/3b82f6/ffffff?text=Tech+Meetup', 'f8d3b5a0-5e1f-4b9f-9d6e-2a1b3c4d5e6f', 50, 0, 'published'),
('f234a567-89ab-cdef-0123-456789abcdef', 'Women in Tech Workshop', 'Hands-on workshop on cloud computing and AWS basics', '2024-02-20 17:30:00', '2024-02-20 20:30:00', 'Online', 'online', 'https://placehold.co/800x400/ec4899/ffffff?text=Women+in+Tech', 'f8d3b5a0-5e1f-4b9f-9d6e-2a1b3c4d5e6f', 100, 0, 'published'),
('a345b678-9abc-def0-1234-56789abcdef0', 'Startup Weekend Kootenays', '54-hour event where developers, designers, and entrepreneurs collaborate', '2024-03-01 17:00:00', '2024-03-03 21:00:00', 'Selkirk College, Castlegar', 'hybrid', 'https://placehold.co/800x400/10b981/ffffff?text=Startup+Weekend', 'b2c3d4e5-6f7a-8b9c-0d1e-2f3a4b5c6d7e', 75, 0, 'published');

-- ============================================
-- 5. SEED GROUPS
-- ============================================
INSERT INTO groups (id, name, description, long_description, hero_image, visibility, created_by, created_at, status) VALUES
('a1b2c3d4-e5f6-789a-bcde-f0123456789a', 'Women in Tech Kootenays', 'Supporting and empowering women in technology across the Kootenay region', 'We are a community of women in technology who support each other through mentorship, networking, and skill-building opportunities. Our mission is to increase diversity in tech and create an inclusive environment for all.', 'https://placehold.co/800x400/ec4899/ffffff?text=Women+in+Tech', 'open', 'f8d3b5a0-5e1f-4b9f-9d6e-2a1b3c4d5e6f', NOW(), 'published'),
('b2c3d4e5-f6a7-89ab-cdef-012345678901', 'Kootenay JavaScript Developers', 'For JavaScript enthusiasts of all levels', 'Whether you''re into React, Vue, Node.js, or vanilla JS, this is your community. We share resources, discuss best practices, and help each other grow.', 'https://placehold.co/800x400/f59e0b/ffffff?text=JS+Developers', 'open', 'a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d', NOW(), 'published'),
('c3d4e5f6-a789-abcd-ef01-234567890123', 'Remote Workers Collective', 'Connect with other remote workers in the Kootenays', 'Working remotely in the Kootenays? Join us for co-working sessions, social events, and professional development opportunities designed for remote workers.', 'https://placehold.co/800x400/6366f1/ffffff?text=Remote+Workers', 'open', 'c3d4e5f6-7a8b-9c0d-1e2f-3a4b5c6d7e8f', NOW(), 'published');

-- ============================================
-- 6. SEED NEWS
-- ============================================
INSERT INTO news (id, title, slug, excerpt, content, image, author_id, status, featured, publish_date) VALUES
('n123e456-789a-bcde-f012-3456789abcde', 'New Tech Hub Opens in Nelson', 'new-tech-hub-opens-nelson', 'The Nelson Innovation Centre announces expansion with new co-working space dedicated to tech startups.', 'The Nelson Innovation Centre has announced a major expansion...', 'https://placehold.co/800x400/3b82f6/ffffff?text=Tech+Hub', 'f8d3b5a0-5e1f-4b9f-9d6e-2a1b3c4d5e6f', 'published', true, NOW()),
('n234f567-89ab-cdef-0123-456789abcdef', 'Local Startup Raises $2M in Funding', 'local-startup-raises-2m-funding', 'EcoData Labs secures Series A funding to expand environmental monitoring platform.', 'EcoData Labs, a Nelson-based environmental tech company...', 'https://placehold.co/800x400/059669/ffffff?text=Funding+News', 'd4e5f6a7-8b9c-0d1e-2f3a-4b5c6d7e8f9a', 'published', true, NOW());

-- ============================================
-- 7. SEED OPPORTUNITIES
-- ============================================
INSERT INTO opportunities (id, title, description, type, organization, location, remote, compensation, deadline, contact_email, website, requirements, responsibilities, benefits, status, posted_by) VALUES
('o123e456-789a-bcde-f012-3456789abcde', 'Senior Full Stack Developer', 'Join our team to build innovative web applications', 'job', 'TechCo Solutions', 'Nelson, BC', true, '$80,000 - $120,000', '2024-03-01', 'careers@techcosolutions.ca', 'https://techcosolutions.ca/careers', ARRAY['5+ years web development', 'React/Node.js experience', 'PostgreSQL knowledge'], ARRAY['Design and implement features', 'Code reviews', 'Mentor junior developers'], ARRAY['Health benefits', 'Flexible hours', 'Remote work options'], 'published', 'f8d3b5a0-5e1f-4b9f-9d6e-2a1b3c4d5e6f'),
('o234f567-89ab-cdef-0123-456789abcdef', 'UX/UI Design Intern', 'Summer internship opportunity for aspiring designers', 'job', 'AppWorks Studio', 'Rossland, BC', false, '$20/hour', '2024-02-15', 'jobs@appworks.studio', 'https://appworks.studio/careers', ARRAY['Design portfolio', 'Figma knowledge', 'Currently enrolled in design program'], ARRAY['Assist with design projects', 'User research', 'Create prototypes'], ARRAY['Mentorship', 'Portfolio development', 'Flexible schedule'], 'published', 'b2c3d4e5-6f7a-8b9c-0d1e-2f3a4b5c6d7e');

-- ============================================
-- 8. SEED TAGS
-- ============================================
INSERT INTO tags (id, name, slug, category, usage_count, created_at) VALUES
-- Technology tags
('550e8400-e29b-41d4-a716-446655440001', 'JavaScript', 'javascript', 'technology', 0, NOW()),
('550e8400-e29b-41d4-a716-446655440002', 'Python', 'python', 'technology', 0, NOW()),
('550e8400-e29b-41d4-a716-446655440003', 'React', 'react', 'technology', 0, NOW()),
('550e8400-e29b-41d4-a716-446655440004', 'Node.js', 'nodejs', 'technology', 0, NOW()),
('550e8400-e29b-41d4-a716-446655440005', 'TypeScript', 'typescript', 'technology', 0, NOW()),
-- Topic tags
('550e8400-e29b-41d4-a716-446655440006', 'Web Development', 'web-development', 'topic', 0, NOW()),
('550e8400-e29b-41d4-a716-446655440007', 'Mobile Development', 'mobile-development', 'topic', 0, NOW()),
('550e8400-e29b-41d4-a716-446655440008', 'Machine Learning', 'machine-learning', 'topic', 0, NOW()),
('550e8400-e29b-41d4-a716-446655440009', 'Cloud Computing', 'cloud-computing', 'topic', 0, NOW()),
('550e8400-e29b-41d4-a716-446655440010', 'DevOps', 'devops', 'topic', 0, NOW()),
-- Type tags
('550e8400-e29b-41d4-a716-446655440011', 'Tutorial', 'tutorial', 'type', 0, NOW()),
('550e8400-e29b-41d4-a716-446655440012', 'Course', 'course', 'type', 0, NOW()),
('550e8400-e29b-41d4-a716-446655440013', 'Documentation', 'documentation', 'type', 0, NOW()),
('550e8400-e29b-41d4-a716-446655440014', 'Video', 'video', 'type', 0, NOW()),
('550e8400-e29b-41d4-a716-446655440015', 'Article', 'article', 'type', 0, NOW()),
-- Marketplace tags
('550e8400-e29b-41d4-a716-446655440016', 'For Sale', 'for-sale', 'marketplace', 0, NOW()),
('550e8400-e29b-41d4-a716-446655440017', 'Services', 'services', 'marketplace', 0, NOW()),
('550e8400-e29b-41d4-a716-446655440018', 'Wanted', 'wanted', 'marketplace', 0, NOW()),
('550e8400-e29b-41d4-a716-446655440019', 'Free', 'free', 'marketplace', 0, NOW()),
('550e8400-e29b-41d4-a716-446655440020', 'Electronics', 'electronics', 'marketplace', 0, NOW());

-- ============================================
-- 9. SEED RESOURCES
-- ============================================
INSERT INTO resources (id, title, description, type, url, image, contributor_id, group_id, featured, status, created_at) VALUES
-- JavaScript Resources
('550e8400-e29b-41d4-a716-446655440101', 'Modern JavaScript Tutorial', 'Comprehensive guide to modern JavaScript features and best practices', 'article', 'https://javascript.info/', 'https://placehold.co/400x300/f59e0b/ffffff?text=JS+Tutorial', 'a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d', 'b2c3d4e5-f6a7-89ab-cdef-012345678901', true, 'published', NOW()),
('550e8400-e29b-41d4-a716-446655440102', 'React Documentation', 'Official React documentation and tutorials', 'documentation', 'https://react.dev/', 'https://placehold.co/400x300/61dafb/ffffff?text=React+Docs', 'f8d3b5a0-5e1f-4b9f-9d6e-2a1b3c4d5e6f', 'b2c3d4e5-f6a7-89ab-cdef-012345678901', true, 'published', NOW()),
-- Python Resources
('550e8400-e29b-41d4-a716-446655440103', 'Python for Data Science', 'Free course on Python for data science and machine learning', 'course', 'https://www.coursera.org/learn/python-for-data-science', 'https://placehold.co/400x300/3776ab/ffffff?text=Python+Course', 'd4e5f6a7-8b9c-0d1e-2f3a-4b5c6d7e8f9a', NULL, true, 'published', NOW()),
('550e8400-e29b-41d4-a716-446655440104', 'Django Web Framework', 'Getting started with Django for web development', 'article', 'https://www.djangoproject.com/start/', 'https://placehold.co/400x300/092e20/ffffff?text=Django', 'd4e5f6a7-8b9c-0d1e-2f3a-4b5c6d7e8f9a', NULL, false, 'published', NOW()),
-- DevOps Resources
('550e8400-e29b-41d4-a716-446655440105', 'Kubernetes Basics', 'Introduction to Kubernetes container orchestration', 'video', 'https://www.youtube.com/watch?v=X48VuoqQYXY', 'https://placehold.co/400x300/326ce5/ffffff?text=K8s+Basics', 'a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d', NULL, true, 'published', NOW()),
('550e8400-e29b-41d4-a716-446655440106', 'Docker Compose Tutorial', 'Learn Docker Compose for multi-container applications', 'article', 'https://docs.docker.com/compose/gettingstarted/', 'https://placehold.co/400x300/2496ed/ffffff?text=Docker+Compose', 'a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d', NULL, false, 'published', NOW()),
-- Design Resources
('550e8400-e29b-41d4-a716-446655440107', 'Figma UI Kit', 'Free UI kit for Figma with modern components', 'tool', 'https://www.figma.com/community/file/123456789', 'https://placehold.co/400x300/f24e1e/ffffff?text=Figma+Kit', 'b2c3d4e5-6f7a-8b9c-0d1e-2f3a4b5c6d7e', NULL, true, 'published', NOW()),
('550e8400-e29b-41d4-a716-446655440108', 'Accessibility Guidelines', 'WCAG 2.1 guidelines for accessible web design', 'guide', 'https://www.w3.org/WAI/WCAG21/quickref/', 'https://placehold.co/400x300/4a5568/ffffff?text=A11y+Guide', 'b2c3d4e5-6f7a-8b9c-0d1e-2f3a4b5c6d7e', NULL, true, 'published', NOW()),
-- Mobile Development
('550e8400-e29b-41d4-a716-446655440109', 'React Native Tutorial', 'Build your first mobile app with React Native', 'tutorial', 'https://reactnative.dev/docs/tutorial', 'https://placehold.co/400x300/61dafb/ffffff?text=RN+Tutorial', 'c3d4e5f6-7a8b-9c0d-1e2f-3a4b5c6d7e8f', NULL, true, 'published', NOW()),
('550e8400-e29b-41d4-a716-446655440110', 'Flutter Cookbook', 'Useful Flutter samples and recipes', 'documentation', 'https://docs.flutter.dev/cookbook', 'https://placehold.co/400x300/02569b/ffffff?text=Flutter', 'c3d4e5f6-7a8b-9c0d-1e2f-3a4b5c6d7e8f', NULL, false, 'published', NOW());

-- ============================================
-- 10. SEED MARKETPLACE
-- ============================================
INSERT INTO marketplace_listings (id, title, description, price, type, category, condition, images, location, seller_id, status, featured, created_at) VALUES
-- Electronics
('550e8400-e29b-41d4-a716-446655440201', 'MacBook Pro 16" (2021)', 'Excellent condition, M1 Pro chip, 16GB RAM, 512GB SSD. Includes original box and charger.', 2200.00, 'product', 'Electronics', 'excellent', ARRAY['https://placehold.co/600x400/6b7280/ffffff?text=MacBook+1', 'https://placehold.co/600x400/6b7280/ffffff?text=MacBook+2'], 'Nelson, BC', 'f8d3b5a0-5e1f-4b9f-9d6e-2a1b3c4d5e6f', 'published', true, NOW()),
('550e8400-e29b-41d4-a716-446655440202', '27" 4K Monitor - Dell UltraSharp', 'Professional grade monitor, perfect for design work. USB-C connectivity.', 450.00, 'product', 'Electronics', 'good', ARRAY['https://placehold.co/600x400/1f2937/ffffff?text=Monitor'], 'Trail, BC', 'b2c3d4e5-6f7a-8b9c-0d1e-2f3a4b5c6d7e', 'published', false, NOW()),
-- Office Equipment
('550e8400-e29b-41d4-a716-446655440203', 'Herman Miller Aeron Chair', 'Size B, fully adjustable, excellent ergonomic support. Minor wear on armrests.', 850.00, 'product', 'Office Equipment', 'good', ARRAY['https://placehold.co/600x400/374151/ffffff?text=Aeron+Chair'], 'Castlegar, BC', 'c3d4e5f6-7a8b-9c0d-1e2f-3a4b5c6d7e8f', 'published', true, NOW()),
('550e8400-e29b-41d4-a716-446655440204', 'Standing Desk - Electric', 'Adjustable height electric standing desk, 60" x 30", bamboo top', 400.00, 'product', 'Office Equipment', 'excellent', ARRAY['https://placehold.co/600x400/92400e/ffffff?text=Standing+Desk'], 'Nelson, BC', 'd4e5f6a7-8b9c-0d1e-2f3a-4b5c6d7e8f9a', 'published', false, NOW()),
-- Services
('550e8400-e29b-41d4-a716-446655440205', 'Web Development Services', 'Full-stack web development for small to medium businesses. React, Node.js, PostgreSQL.', 100.00, 'service', 'Services', 'new', ARRAY['https://placehold.co/600x400/3b82f6/ffffff?text=Web+Dev'], 'Remote', 'f8d3b5a0-5e1f-4b9f-9d6e-2a1b3c4d5e6f', 'published', true, NOW()),
('550e8400-e29b-41d4-a716-446655440206', 'UI/UX Design Consultation', 'Professional design services for web and mobile applications. Figma expertise.', 80.00, 'service', 'Services', 'new', ARRAY['https://placehold.co/600x400/ec4899/ffffff?text=Design'], 'Remote', 'b2c3d4e5-6f7a-8b9c-0d1e-2f3a4b5c6d7e', 'published', false, NOW()),
-- Books & Learning
('550e8400-e29b-41d4-a716-446655440207', 'Programming Books Collection', 'Collection of 15 programming books - JavaScript, Python, Clean Code, Design Patterns', 150.00, 'product', 'Books', 'good', ARRAY['https://placehold.co/600x400/7c3aed/ffffff?text=Books'], 'Rossland, BC', 'a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d', 'published', false, NOW()),
('550e8400-e29b-41d4-a716-446655440208', 'Online Course Bundle', 'Access to premium web development courses - React, Vue, Node.js (transferable licenses)', 200.00, 'product', 'Education', 'new', ARRAY['https://placehold.co/600x400/059669/ffffff?text=Courses'], 'Online', 'd4e5f6a7-8b9c-0d1e-2f3a-4b5c6d7e8f9a', 'published', true, NOW()),
-- Free Items
('550e8400-e29b-41d4-a716-446655440209', 'Old Computer Parts - Free', 'Various computer parts for recycling or projects. RAM, HDDs, cables.', 0.00, 'product', 'Electronics', 'fair', ARRAY['https://placehold.co/600x400/ef4444/ffffff?text=Free+Parts'], 'Nelson, BC', 'c3d4e5f6-7a8b-9c0d-1e2f-3a4b5c6d7e8f', 'published', false, NOW()),
('550e8400-e29b-41d4-a716-446655440210', 'Tech Magazines - Free to Good Home', 'Collection of tech magazines from 2020-2023. Great for research or inspiration.', 0.00, 'product', 'Books', 'good', ARRAY['https://placehold.co/600x400/f59e0b/ffffff?text=Magazines'], 'Trail, BC', 'a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d', 'published', false, NOW());

-- ============================================
-- 11. SEED RESOURCE TAGS
-- ============================================
INSERT INTO resource_tags (resource_id, tag_id) VALUES
-- JavaScript resources
('550e8400-e29b-41d4-a716-446655440101', '550e8400-e29b-41d4-a716-446655440001'),
('550e8400-e29b-41d4-a716-446655440101', '550e8400-e29b-41d4-a716-446655440006'),
('550e8400-e29b-41d4-a716-446655440101', '550e8400-e29b-41d4-a716-446655440015'),
('550e8400-e29b-41d4-a716-446655440102', '550e8400-e29b-41d4-a716-446655440003'),
('550e8400-e29b-41d4-a716-446655440102', '550e8400-e29b-41d4-a716-446655440001'),
('550e8400-e29b-41d4-a716-446655440102', '550e8400-e29b-41d4-a716-446655440013'),
-- Python resources
('550e8400-e29b-41d4-a716-446655440103', '550e8400-e29b-41d4-a716-446655440002'),
('550e8400-e29b-41d4-a716-446655440103', '550e8400-e29b-41d4-a716-446655440008'),
('550e8400-e29b-41d4-a716-446655440103', '550e8400-e29b-41d4-a716-446655440012'),
('550e8400-e29b-41d4-a716-446655440104', '550e8400-e29b-41d4-a716-446655440002'),
('550e8400-e29b-41d4-a716-446655440104', '550e8400-e29b-41d4-a716-446655440006'),
('550e8400-e29b-41d4-a716-446655440104', '550e8400-e29b-41d4-a716-446655440015'),
-- DevOps resources
('550e8400-e29b-41d4-a716-446655440105', '550e8400-e29b-41d4-a716-446655440010'),
('550e8400-e29b-41d4-a716-446655440105', '550e8400-e29b-41d4-a716-446655440009'),
('550e8400-e29b-41d4-a716-446655440105', '550e8400-e29b-41d4-a716-446655440014'),
('550e8400-e29b-41d4-a716-446655440106', '550e8400-e29b-41d4-a716-446655440010'),
('550e8400-e29b-41d4-a716-446655440106', '550e8400-e29b-41d4-a716-446655440015');

-- ============================================
-- 12. SEED MARKETPLACE TAGS
-- ============================================
INSERT INTO marketplace_tags (listing_id, tag_id) VALUES
-- Electronics listings
('550e8400-e29b-41d4-a716-446655440201', '550e8400-e29b-41d4-a716-446655440016'),
('550e8400-e29b-41d4-a716-446655440201', '550e8400-e29b-41d4-a716-446655440020'),
('550e8400-e29b-41d4-a716-446655440202', '550e8400-e29b-41d4-a716-446655440016'),
('550e8400-e29b-41d4-a716-446655440202', '550e8400-e29b-41d4-a716-446655440020'),
-- Services
('550e8400-e29b-41d4-a716-446655440205', '550e8400-e29b-41d4-a716-446655440017'),
('550e8400-e29b-41d4-a716-446655440206', '550e8400-e29b-41d4-a716-446655440017'),
-- Free items
('550e8400-e29b-41d4-a716-446655440209', '550e8400-e29b-41d4-a716-446655440019'),
('550e8400-e29b-41d4-a716-446655440209', '550e8400-e29b-41d4-a716-446655440020'),
('550e8400-e29b-41d4-a716-446655440210', '550e8400-e29b-41d4-a716-446655440019');

-- ============================================
-- 13. UPDATE TAG USAGE COUNTS
-- ============================================
UPDATE tags SET usage_count = (
  SELECT COUNT(*) FROM (
    SELECT tag_id FROM resource_tags WHERE tag_id = tags.id
    UNION ALL
    SELECT tag_id FROM marketplace_tags WHERE tag_id = tags.id
  ) AS tag_usage
);

-- ============================================
-- 14. SEED GROUP MEMBERS
-- ============================================
INSERT INTO group_members (group_id, user_id, role, joined_date) VALUES
('a1b2c3d4-e5f6-789a-bcde-f0123456789a', 'f8d3b5a0-5e1f-4b9f-9d6e-2a1b3c4d5e6f', 'admin', NOW()),
('a1b2c3d4-e5f6-789a-bcde-f0123456789a', 'b2c3d4e5-6f7a-8b9c-0d1e-2f3a4b5c6d7e', 'member', NOW()),
('a1b2c3d4-e5f6-789a-bcde-f0123456789a', 'd4e5f6a7-8b9c-0d1e-2f3a-4b5c6d7e8f9a', 'member', NOW()),
('b2c3d4e5-f6a7-89ab-cdef-012345678901', 'a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d', 'admin', NOW()),
('b2c3d4e5-f6a7-89ab-cdef-012345678901', 'f8d3b5a0-5e1f-4b9f-9d6e-2a1b3c4d5e6f', 'member', NOW()),
('b2c3d4e5-f6a7-89ab-cdef-012345678901', 'c3d4e5f6-7a8b-9c0d-1e2f-3a4b5c6d7e8f', 'member', NOW()),
('c3d4e5f6-a789-abcd-ef01-234567890123', 'c3d4e5f6-7a8b-9c0d-1e2f-3a4b5c6d7e8f', 'admin', NOW()),
('c3d4e5f6-a789-abcd-ef01-234567890123', 'a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d', 'member', NOW());

-- ============================================
-- 15. SEED MEMBER SKILLS
-- ============================================
INSERT INTO member_skills (member_id, skill) VALUES
('f8d3b5a0-5e1f-4b9f-9d6e-2a1b3c4d5e6f', 'React'),
('f8d3b5a0-5e1f-4b9f-9d6e-2a1b3c4d5e6f', 'Node.js'),
('f8d3b5a0-5e1f-4b9f-9d6e-2a1b3c4d5e6f', 'PostgreSQL'),
('f8d3b5a0-5e1f-4b9f-9d6e-2a1b3c4d5e6f', 'TypeScript'),
('a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d', 'Kubernetes'),
('a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d', 'Docker'),
('a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d', 'AWS'),
('a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d', 'Terraform'),
('b2c3d4e5-6f7a-8b9c-0d1e-2f3a4b5c6d7e', 'Figma'),
('b2c3d4e5-6f7a-8b9c-0d1e-2f3a4b5c6d7e', 'Adobe XD'),
('b2c3d4e5-6f7a-8b9c-0d1e-2f3a4b5c6d7e', 'User Research'),
('b2c3d4e5-6f7a-8b9c-0d1e-2f3a4b5c6d7e', 'Accessibility');

-- ============================================
-- 16. SEED MEMBER INTERESTS
-- ============================================
INSERT INTO member_interests (member_id, interest) VALUES
('f8d3b5a0-5e1f-4b9f-9d6e-2a1b3c4d5e6f', 'sustainability'),
('f8d3b5a0-5e1f-4b9f-9d6e-2a1b3c4d5e6f', 'education'),
('f8d3b5a0-5e1f-4b9f-9d6e-2a1b3c4d5e6f', 'community building'),
('a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d', 'automation'),
('a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d', 'cloud computing'),
('a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d', 'hiking'),
('b2c3d4e5-6f7a-8b9c-0d1e-2f3a4b5c6d7e', 'design systems'),
('b2c3d4e5-6f7a-8b9c-0d1e-2f3a4b5c6d7e', 'accessibility'),
('b2c3d4e5-6f7a-8b9c-0d1e-2f3a4b5c6d7e', 'mentoring');

-- End of consolidated seed data