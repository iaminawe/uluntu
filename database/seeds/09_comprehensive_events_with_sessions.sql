-- =====================================================
-- COMPREHENSIVE EVENTS WITH SESSIONS AND PRESENTERS
-- Nelson Tech Community Platform
-- =====================================================

BEGIN;

-- Set timezone for consistent timestamps
SET TIME ZONE 'America/Vancouver';

-- =====================================================
-- CLEAN UP EXISTING EVENT DATA
-- =====================================================

-- Remove existing event-related data to avoid conflicts
DELETE FROM event_resources WHERE session_id IN (SELECT id FROM event_sessions);
DELETE FROM event_presenters WHERE session_id IN (SELECT id FROM event_sessions);
DELETE FROM event_sessions WHERE event_id IN (SELECT id FROM events);
DELETE FROM event_attendees WHERE event_id IN (SELECT id FROM events);
DELETE FROM event_tags WHERE event_id IN (SELECT id FROM events);
DELETE FROM events;

-- =====================================================
-- ENSURE REQUIRED DEPENDENCIES EXIST
-- =====================================================

-- Insert required members (organizers) if they don't already exist
INSERT INTO "public"."members" ("id", "name", "title", "bio", "location", "image", "website", "employment_status", "open_to_volunteering", "status", "featured") VALUES
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Sarah Mitchell', 'Senior Full Stack Developer', 'Passionate about building scalable web applications', 'Nelson, BC', 'https://images.unsplash.com/photo-1494790108755-2616b612b743?w=400', 'https://sarahmitchell.dev', 'employed', true, 'published', true),
('b62e36e4-11a4-4567-979e-3f3ebbc9232d', 'Jennifer Walsh', 'Data Scientist & AI Researcher', 'Machine learning engineer focused on environmental data', 'Nelson, BC', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400', 'https://jennwalsh.ai', 'employed', true, 'published', true),
('d0519096-9dd8-4397-b0bd-3dbb8cebdb39', 'Marcus Chen', 'DevOps Engineer', 'Cloud infrastructure specialist', 'Castlegar, BC', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400', 'https://marcuschen.tech', 'employed', true, 'published', false),
('1918195d-3aab-4a48-9999-f17e2a4f2ef9', 'Lisa Park', 'Product Manager', 'Strategic product manager with B2B SaaS experience', 'Nelson, BC', 'https://images.unsplash.com/photo-1594736797933-d0dc2e715114?w=400', 'https://lisapark.pm', 'employed', true, 'published', true),
('857a4b0b-961f-4c36-96db-5ced07c11232', 'Michael Roberts', 'Cybersecurity Analyst', 'Information security professional', 'Trail, BC', 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400', 'https://michaelroberts-security.com', 'employed', false, 'published', false),
('8fa10942-4a64-4911-a45d-eb4996002302', 'David Kim', 'Mobile App Developer', 'iOS and Android developer', 'Kaslo, BC', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400', 'https://davidkim.dev', 'employed', false, 'published', false),
('7131f030-4431-4dbf-816b-9cb4ebd2d54d', 'Alex Thompson', 'UX/UI Designer', 'Creative designer passionate about user-centered design', 'Nelson, BC', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400', 'https://alexthompsondesign.com', 'self-employed', true, 'published', false),
('f06db137-c993-4ab9-8d36-d94fe284bca9', 'Robert Singh', 'Backend Systems Architect', 'Senior software architect specializing in distributed systems', 'Rossland, BC', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400', 'https://robertsingh.dev', 'employed', false, 'published', false),
('a75a33d8-aa13-42a9-a246-3a5c8e5c838f', 'Dr. Emily Rodriguez', 'Healthcare Technology Consultant', 'Bridging healthcare and technology', 'Nelson, BC', 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400', 'https://dremilyrodriguez.com', 'self-employed', true, 'published', true),
('4c6aca02-ccd6-46b6-ae8f-3969e32cb873', 'Amanda Foster', 'Digital Marketing Strategist', 'Growth marketing specialist', 'Nelson, BC', 'https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=400', 'https://amandafoster.marketing', 'self-employed', true, 'published', false)
ON CONFLICT (id) DO NOTHING;

-- Insert groups if they don't already exist
INSERT INTO groups (
    id, name, description, long_description, hero_image, cover_image, 
    visibility, member_count, status, featured
) VALUES 
('11111111-1111-1111-1111-111111111111', 'Web Developers Guild', 'A community for web developers of all skill levels', 'The Web Developers Guild is a premier community for frontend and backend web developers.', 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&h=600&fit=crop', 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&h=400&fit=crop', 'open', 24, 'published', true),
('22222222-2222-2222-2222-222222222222', 'AI & Machine Learning Enthusiasts', 'Exploring the frontiers of artificial intelligence', 'Our AI & Machine Learning Enthusiasts group brings together researchers and practitioners.', 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1200&h=600&fit=crop', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&h=400&fit=crop', 'open', 18, 'published', true),
('33333333-3333-3333-3333-333333333333', 'Startup Founders Network', 'A supportive community for entrepreneurs', 'The Startup Founders Network is where entrepreneurial dreams meet practical support.', 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1200&h=600&fit=crop', 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=1200&h=400&fit=crop', 'closed', 31, 'published', false),
('44444444-4444-4444-4444-444444444444', 'Cybersecurity Professionals', 'Dedicated to protecting digital assets', 'Our Cybersecurity Professionals group brings together IT security specialists.', 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=1200&h=600&fit=crop', 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&h=400&fit=crop', 'open', 15, 'published', false),
('55555555-5555-5555-5555-555555555555', 'Data Science & Analytics', 'Turning data into insights', 'Our Data Science & Analytics group is dedicated to extracting valuable insights.', 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=600&fit=crop', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=400&fit=crop', 'open', 27, 'published', true)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- EVENTS (10 comprehensive tech events)
-- =====================================================

INSERT INTO events (
    id, title, slug, description, date, end_date, location, address, latitude, longitude, 
    image, type, url, status, featured, organizer_id, max_attendees, current_attendees, group_id
) VALUES 
-- 1. AI & Machine Learning Summit 2025 (Multi-day conference)
('e1000001-1111-1111-1111-111111111111', 
'AI & Machine Learning Summit 2025', 
'ai-machine-learning-summit-2025',
'Join us for a comprehensive 2-day summit exploring the latest developments in artificial intelligence and machine learning. This event brings together industry experts, researchers, and practitioners to share insights on cutting-edge AI technologies, practical applications, and future trends. From deep learning to natural language processing, this summit covers it all.',
'2025-07-15 08:30:00-07', '2025-07-16 17:30:00-07', 
'Nelson Community Centre', '602 Vernon Street, Nelson, BC V1L 4E4', 
49.4928, -117.2948, 
'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1200&h=600&fit=crop', 
'in-person', 'https://ai-summit.nelsontech.com', 
'published', true, 'b62e36e4-11a4-4567-979e-3f3ebbc9232d', 250, 187, '22222222-2222-2222-2222-222222222222'),

-- 2. Full Stack Web Development Bootcamp
('e2000002-2222-2222-2222-222222222222', 
'Full Stack Web Development Intensive Bootcamp', 
'full-stack-web-development-bootcamp',
'A comprehensive 3-day hands-on bootcamp covering modern web development from frontend to backend. Learn React, Next.js, Node.js, Express, and database integration. Perfect for beginners and intermediate developers looking to expand their skill set. Includes practical projects and portfolio building.',
'2025-07-22 09:00:00-07', '2025-07-24 17:00:00-07', 
'Selkirk College - Silver King Campus', '301 Frank Beinder Way, Castlegar, BC V1N 4L3', 
49.3328, -117.6664, 
'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&h=600&fit=crop', 
'hybrid', 'https://bootcamp.nelsontech.com/fullstack', 
'published', true, 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 60, 52, '11111111-1111-1111-1111-111111111111'),

-- 3. Startup Pitch Night - Q3 2025
('e3000003-3333-3333-3333-333333333333', 
'Startup Pitch Night - Q3 2025', 
'startup-pitch-night-q3-2025',
'Local entrepreneurs present their innovative startups to investors, mentors, and the community. Network with fellow entrepreneurs and learn about the exciting startups emerging from the Kootenays region. Featuring 8 startups, panel discussions, and networking reception.',
'2025-07-29 17:30:00-07', '2025-07-29 21:30:00-07', 
'Hume Hotel & Spa', '422 Vernon Street, Nelson, BC V1L 4E6', 
49.4941, -117.2929, 
'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1200&h=600&fit=crop', 
'in-person', 'https://pitchnight.nelsontech.com', 
'published', true, '1918195d-3aab-4a48-9999-f17e2a4f2ef9', 120, 95, '33333333-3333-3333-3333-333333333333'),

-- 4. Cybersecurity Workshop Series
('e4000004-4444-4444-4444-444444444444', 
'Cybersecurity Workshop Series: Protecting Your Digital Assets', 
'cybersecurity-workshop-series',
'A comprehensive 4-week online workshop series covering essential cybersecurity practices for developers and businesses. Each week focuses on different aspects: threat assessment, secure coding, incident response, and compliance.',
'2025-08-05 18:00:00-07', '2025-08-26 20:00:00-07', 
'Online Event', 'Virtual via Zoom', 
NULL, NULL, 
'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=1200&h=600&fit=crop', 
'online', 'https://cybersec-series.nelsontech.com', 
'published', true, '857a4b0b-961f-4c36-96db-5ced07c11232', 200, 156, '44444444-4444-4444-4444-444444444444'),

-- 5. Data Science & Analytics Conference
('e5000005-5555-5555-5555-555555555555', 
'Kootenay Data Science & Analytics Conference 2025', 
'kootenay-data-science-conference-2025',
'The premier data science event in the Kootenays featuring workshops, keynote speakers, and hands-on sessions. Topics include machine learning, data visualization, environmental analytics, and business intelligence.',
'2025-08-12 08:00:00-07', '2025-08-13 18:00:00-07', 
'Capitol Theatre', '421 Victoria Street, Nelson, BC V1L 4K7', 
49.4948, -117.2942, 
'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=600&fit=crop', 
'hybrid', 'https://datasci-conf.nelsontech.com', 
'published', true, 'b62e36e4-11a4-4567-979e-3f3ebbc9232d', 150, 128, '55555555-5555-5555-5555-555555555555'),

-- 6. Mobile Development Workshop
('e6000006-6666-6666-6666-666666666666', 
'Cross-Platform Mobile Development with React Native & Flutter', 
'mobile-development-workshop',
'Learn to build mobile applications that work on both iOS and Android. This hands-on workshop covers both React Native and Flutter, helping you choose the right framework for your projects.',
'2025-08-19 09:00:00-07', '2025-08-19 17:00:00-07', 
'Nelson Innovation Centre', '618 Front Street, Nelson, BC V1L 4B6', 
49.4935, -117.2945, 
'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=1200&h=600&fit=crop', 
'in-person', 'https://mobile-workshop.nelsontech.com', 
'published', false, '8fa10942-4a64-4911-a45d-eb4996002302', 40, 32, NULL),

-- 7. UX/UI Design Sprint
('e7000007-7777-7777-7777-777777777777', 
'5-Day Design Sprint: From Concept to Prototype', 
'design-sprint-concept-to-prototype',
'An intensive design sprint workshop where participants work in teams to solve real-world design challenges. Learn design thinking, user research, prototyping, and testing methodologies.',
'2025-09-02 09:00:00-07', '2025-09-06 16:00:00-07', 
'The Civic Theatre', '719 Vernon Street, Nelson, BC V1L 4E8', 
49.4921, -117.2956, 
'https://images.unsplash.com/photo-1559028012-481c04fa702d?w=1200&h=600&fit=crop', 
'in-person', 'https://design-sprint.nelsontech.com', 
'published', true, '7131f030-4431-4dbf-816b-9cb4ebd2d54d', 30, 28, NULL),

-- 8. Cloud Architecture Summit
('e8000008-8888-8888-8888-888888888888', 
'Cloud Architecture & DevOps Summit 2025', 
'cloud-architecture-devops-summit-2025',
'Deep dive into cloud architecture patterns, containerization, and modern DevOps practices. Features hands-on labs with AWS, Azure, and Google Cloud Platform.',
'2025-09-15 08:30:00-07', '2025-09-16 17:00:00-07', 
'Best Western Plus Baker Street Inn', '153 Baker Street, Nelson, BC V1L 4H1', 
49.4946, -117.2934, 
'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&h=600&fit=crop', 
'hybrid', 'https://cloud-summit.nelsontech.com', 
'published', true, 'd0519096-9dd8-4397-b0bd-3dbb8cebdb39', 100, 78, NULL),

-- 9. Women in Tech Symposium
('e9000009-9999-9999-9999-999999999999', 
'Women in Tech Kootenays Annual Symposium', 
'women-in-tech-kootenays-symposium',
'Celebrating and empowering women in technology with keynote speakers, panel discussions, career workshops, and networking opportunities. Open to all genders supporting diversity in tech.',
'2025-09-22 09:00:00-07', '2025-09-22 17:30:00-07', 
'Prestige Lakeside Resort', '701 Lakeside Drive, Nelson, BC V1L 6G3', 
49.4901, -117.2899, 
'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=1200&h=600&fit=crop', 
'in-person', 'https://women-tech-symposium.nelsontech.com', 
'published', true, '1918195d-3aab-4a48-9999-f17e2a4f2ef9', 200, 165, NULL),

-- 10. Hackathon: Tech for Good
('e1000010-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 
'48-Hour Hackathon: Technology for Social Good', 
'hackathon-tech-for-social-good',
'Join teams to build technology solutions for local non-profits and community organizations. Prizes, mentorship, and the opportunity to make a real impact in the Kootenay region.',
'2025-10-03 18:00:00-07', '2025-10-05 18:00:00-07', 
'Nelson Commons', '602 Vernon Street, Nelson, BC V1L 4E4', 
49.4928, -117.2948, 
'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&h=600&fit=crop', 
'in-person', 'https://hackathon.nelsontech.com', 
'published', true, 'f06db137-c993-4ab9-8d36-d94fe284bca9', 80, 64, NULL);

-- =====================================================
-- EVENT SESSIONS
-- =====================================================

-- AI & Machine Learning Summit Sessions (Day 1)
INSERT INTO event_sessions (
    id, event_id, title, description, start_time, end_time, video_url
) VALUES
('a1001111-1111-1111-1111-111111111111', 'e1000001-1111-1111-1111-111111111111',
'Opening Keynote: The Future of AI in Small Communities',
'Exploring how AI can transform smaller communities and create opportunities outside major tech hubs.',
'2025-07-15 09:00:00-07', '2025-07-15 10:00:00-07', NULL),

('a1002111-1111-1111-1111-111111111111', 'e1000001-1111-1111-1111-111111111111',
'Workshop: Introduction to Machine Learning with Python',
'Hands-on workshop covering the basics of machine learning using Python, scikit-learn, and Jupyter notebooks.',
'2025-07-15 10:15:00-07', '2025-07-15 12:15:00-07', NULL),

('a1003111-1111-1111-1111-111111111111', 'e1000001-1111-1111-1111-111111111111',
'Panel: AI Ethics and Responsible Development',
'Industry experts discuss the ethical implications of AI and best practices for responsible AI development.',
'2025-07-15 13:30:00-07', '2025-07-15 14:45:00-07', NULL),

('a1004111-1111-1111-1111-111111111111', 'e1000001-1111-1111-1111-111111111111',
'Deep Dive: Natural Language Processing Applications',
'Advanced session on NLP techniques and their practical applications in business.',
'2025-07-15 15:00:00-07', '2025-07-15 16:30:00-07', NULL),

-- AI & Machine Learning Summit Sessions (Day 2)
('a1005111-1111-1111-1111-111111111111', 'e1000001-1111-1111-1111-111111111111',
'Computer Vision for Environmental Monitoring',
'Learn how computer vision is being used to monitor and protect our natural environment.',
'2025-07-16 09:00:00-07', '2025-07-16 10:30:00-07', NULL),

('a1006111-1111-1111-1111-111111111111', 'e1000001-1111-1111-1111-111111111111',
'Building Production ML Pipelines',
'Best practices for deploying and maintaining machine learning models in production.',
'2025-07-16 10:45:00-07', '2025-07-16 12:15:00-07', NULL),

('a1007111-1111-1111-1111-111111111111', 'e1000001-1111-1111-1111-111111111111',
'AI in Healthcare: Case Studies from BC',
'Real-world examples of AI applications in British Columbia healthcare systems.',
'2025-07-16 13:30:00-07', '2025-07-16 15:00:00-07', NULL),

('a1008111-1111-1111-1111-111111111111', 'e1000001-1111-1111-1111-111111111111',
'Closing Keynote: Building an AI-Enabled Future',
'Vision for the future of AI and its impact on work, life, and society.',
'2025-07-16 15:15:00-07', '2025-07-16 16:30:00-07', NULL);

-- Full Stack Web Development Bootcamp Sessions
INSERT INTO event_sessions (
    id, event_id, title, description, start_time, end_time, video_url
) VALUES
('a2001222-2222-2222-2222-222222222222', 'e2000002-2222-2222-2222-222222222222',
'Day 1: Frontend Fundamentals with React',
'Deep dive into React components, hooks, state management, and modern React patterns.',
'2025-07-22 09:00:00-07', '2025-07-22 17:00:00-07', NULL),

('a2002222-2222-2222-2222-222222222222', 'e2000002-2222-2222-2222-222222222222',
'Day 2: Backend Development with Node.js',
'Building RESTful APIs, authentication, database integration, and server deployment.',
'2025-07-23 09:00:00-07', '2025-07-23 17:00:00-07', NULL),

('a2003222-2222-2222-2222-222222222222', 'e2000002-2222-2222-2222-222222222222',
'Day 3: Full Stack Integration & Deployment',
'Connecting frontend to backend, deployment strategies, and building a complete application.',
'2025-07-24 09:00:00-07', '2025-07-24 17:00:00-07', NULL);

-- Startup Pitch Night Sessions
INSERT INTO event_sessions (
    id, event_id, title, description, start_time, end_time, video_url
) VALUES
('a3001333-3333-3333-3333-333333333333', 'e3000003-3333-3333-3333-333333333333',
'Welcome & Networking Reception',
'Meet fellow entrepreneurs, investors, and mentors while enjoying local refreshments.',
'2025-07-29 17:30:00-07', '2025-07-29 18:00:00-07', NULL),

('a3002333-3333-3333-3333-333333333333', 'e3000003-3333-3333-3333-333333333333',
'Startup Pitches: Round 1',
'First four startups present their 5-minute pitches followed by Q&A.',
'2025-07-29 18:00:00-07', '2025-07-29 19:00:00-07', NULL),

('a3003333-3333-3333-3333-333333333333', 'e3000003-3333-3333-3333-333333333333',
'Startup Pitches: Round 2',
'Final four startups present their 5-minute pitches followed by Q&A.',
'2025-07-29 19:15:00-07', '2025-07-29 20:15:00-07', NULL),

('a3004333-3333-3333-3333-333333333333', 'e3000003-3333-3333-3333-333333333333',
'Panel: Scaling in the Kootenays',
'Successful local entrepreneurs share their experiences growing tech companies in smaller markets.',
'2025-07-29 20:30:00-07', '2025-07-29 21:30:00-07', NULL);

-- Cybersecurity Workshop Series Sessions (Week 1)
INSERT INTO event_sessions (
    id, event_id, title, description, start_time, end_time, video_url
) VALUES
('a4001444-4444-4444-4444-444444444444', 'e4000004-4444-4444-4444-444444444444',
'Week 1: Threat Landscape & Risk Assessment',
'Understanding current cyber threats and conducting effective risk assessments for your organization.',
'2025-08-05 18:00:00-07', '2025-08-05 20:00:00-07', 'https://recordings.cybersec-series.com/week1'),

('a4002444-4444-4444-4444-444444444444', 'e4000004-4444-4444-4444-444444444444',
'Week 2: Secure Coding Practices',
'Writing secure code, common vulnerabilities, and defensive programming techniques.',
'2025-08-12 18:00:00-07', '2025-08-12 20:00:00-07', 'https://recordings.cybersec-series.com/week2'),

('a4003444-4444-4444-4444-444444444444', 'e4000004-4444-4444-4444-444444444444',
'Week 3: Incident Response Planning',
'Building and testing incident response plans, handling breaches, and recovery strategies.',
'2025-08-19 18:00:00-07', '2025-08-19 20:00:00-07', 'https://recordings.cybersec-series.com/week3'),

('a4004444-4444-4444-4444-444444444444', 'e4000004-4444-4444-4444-444444444444',
'Week 4: Compliance & Governance',
'Understanding regulatory requirements, implementing security policies, and audit preparation.',
'2025-08-26 18:00:00-07', '2025-08-26 20:00:00-07', 'https://recordings.cybersec-series.com/week4');

-- Data Science Conference Sessions (Day 1)
INSERT INTO event_sessions (
    id, event_id, title, description, start_time, end_time, video_url
) VALUES
('a5001555-5555-5555-5555-555555555555', 'e5000005-5555-5555-5555-555555555555',
'Opening Keynote: Data Science for Environmental Sustainability',
'How data science is driving environmental conservation and climate action initiatives.',
'2025-08-12 08:30:00-07', '2025-08-12 09:30:00-07', NULL),

('a5002555-5555-5555-5555-555555555555', 'e5000005-5555-5555-5555-555555555555',
'Workshop: Advanced Data Visualization with Python',
'Creating compelling data stories using matplotlib, seaborn, and plotly.',
'2025-08-12 10:00:00-07', '2025-08-12 12:00:00-07', NULL),

('a5003555-5555-5555-5555-555555555555', 'e5000005-5555-5555-5555-555555555555',
'Machine Learning for Time Series Analysis',
'Techniques for analyzing and predicting time-based data patterns.',
'2025-08-12 13:00:00-07', '2025-08-12 15:00:00-07', NULL),

('a5004555-5555-5555-5555-555555555555', 'e5000005-5555-5555-5555-555555555555',
'Panel: Career Paths in Data Science',
'Industry professionals discuss various career trajectories in data science.',
'2025-08-12 15:30:00-07', '2025-08-12 17:00:00-07', NULL);

-- =====================================================
-- EVENT PRESENTERS
-- =====================================================

-- AI Summit Presenters
INSERT INTO event_presenters (
    id, session_id, member_id, name, image, bio, title, company, website
) VALUES
-- Opening Keynote
('b1001b11-1111-1111-1111-111111111111', 'a1001111-1111-1111-1111-111111111', 
'b62e36e4-11a4-4567-979e-3f3ebbc9232d', NULL, NULL, NULL, NULL, NULL, NULL),

('b1002b11-1111-1111-1111-111111111111', 'a1001111-1111-1111-1111-111111111', 
NULL, 'Dr. Alan Thompson', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400', 
'AI researcher and author of "AI for Everyone". Former Google AI team lead with 15 years in machine learning.',
'Chief AI Officer', 'TechVision Labs', 'https://alanthompson.ai'),

-- ML Workshop
('b1003b11-1111-1111-1111-111111111111', 'a1002111-1111-1111-1111-111111111', 
'b62e36e4-11a4-4567-979e-3f3ebbc9232d', NULL, NULL, NULL, NULL, NULL, NULL),

('b1004b11-1111-1111-1111-111111111111', 'a1002111-1111-1111-1111-111111111', 
NULL, 'Sarah Kim', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400', 
'Machine learning engineer with expertise in Python and TensorFlow. Passionate educator and open source contributor.',
'Senior ML Engineer', 'DataFlow Systems', 'https://sarahkim.dev'),

-- Ethics Panel
('b1005b11-1111-1111-1111-111111111111', 'a1003111-1111-1111-1111-111111111', 
'a75a33d8-aa13-42a9-a246-3a5c8e5c838f', NULL, NULL, NULL, NULL, NULL, NULL),

('b1006b11-1111-1111-1111-111111111111', 'a1003111-1111-1111-1111-111111111', 
NULL, 'Prof. Maria Garcia', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400', 
'Ethics professor specializing in AI governance and policy. Advisor to Canadian AI ethics committee.',
'Professor of Ethics', 'University of British Columbia', 'https://ethics.ubc.ca/garcia'),

('b1007b11-1111-1111-1111-111111111111', 'a1003111-1111-1111-1111-111111111', 
NULL, 'James Mitchell', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400', 
'Legal expert in AI regulation and data privacy. Published author on technology law.',
'Partner', 'Mitchell & Associates Law', 'https://mitchelllaw.ca'),

-- NLP Deep Dive
('b1008b11-1111-1111-1111-111111111111', 'a1004111-1111-1111-1111-111111111', 
NULL, 'Dr. Rachel Chen', 'https://images.unsplash.com/photo-1594736797933-d0dc2e715114?w=400', 
'NLP researcher with focus on multilingual models and conversational AI. Former Amazon Alexa team.',
'Principal NLP Scientist', 'LinguaTech AI', 'https://rachelchen-nlp.com'),

-- Computer Vision
('b1009b11-1111-1111-1111-111111111111', 'a10051111-1111-1111-111111111111', 
NULL, 'Michael Roberts', 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400', 
'Computer vision specialist applying AI to environmental monitoring and wildlife conservation.',
'Lead CV Engineer', 'EcoVision Tech', 'https://ecovision.tech/team/roberts'),

-- Production ML
('b1010b11-1111-1111-1111-111111111111', 'a10061111-1111-1111-111111111111', 
'd0519096-9dd8-4397-b0bd-3dbb8cebdb39', NULL, NULL, NULL, NULL, NULL, NULL),

-- Healthcare AI
('b1011b11-1111-1111-1111-111111111111', 'a10071111-1111-1111-111111111111', 
'a75a33d8-aa13-42a9-a246-3a5c8e5c838f', NULL, NULL, NULL, NULL, NULL, NULL),

('b1012b11-1111-1111-1111-111111111111', 'a10071111-1111-1111-111111111111', 
NULL, 'Dr. Patricia Wong', 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400', 
'Healthcare AI specialist with 20 years in medical technology. Pioneer in AI-assisted diagnostics.',
'Chief Medical Officer', 'HealthAI Solutions', 'https://healthai.ca/wong');

-- Full Stack Bootcamp Presenters
INSERT INTO event_presenters (
    id, session_id, member_id, name, image, bio, title, company, website
) VALUES
('b2001b11-2222-2222-2222-222222222222', 'a20012222-2222-2222-222222222222', 
'a1b2c3d4-e5f6-7890-abcd-ef1234567890', NULL, NULL, NULL, NULL, NULL, NULL),

('b2002b11-2222-2222-2222-222222222222', 'a20012222-2222-2222-222222222222', 
NULL, 'Tom Anderson', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400', 
'Frontend architect with 10+ years building scalable React applications. Contributor to React core.',
'Principal Frontend Engineer', 'WebScale Inc', 'https://tomanderson.dev'),

('b2003b11-2222-2222-2222-222222222222', 'a20022222-2222-2222-222222222222', 
'f06db137-c993-4ab9-8d36-d94fe284bca9', NULL, NULL, NULL, NULL, NULL, NULL),

('b2004b11-2222-2222-2222-222222222222', 'a20032222-2222-2222-222222222222', 
'd0519096-9dd8-4397-b0bd-3dbb8cebdb39', NULL, NULL, NULL, NULL, NULL, NULL);

-- Startup Pitch Night Presenters
INSERT INTO event_presenters (
    id, session_id, member_id, name, image, bio, title, company, website
) VALUES
-- Panel moderator
('b3001b11-3333-3333-3333-333333333333', 'a30043333-3333-3333-333333333333', 
'1918195d-3aab-4a48-9999-f17e2a4f2ef9', NULL, NULL, NULL, NULL, NULL, NULL),

-- Panel members
('b3002b11-3333-3333-3333-333333333333', 'a30043333-3333-3333-333333333333', 
NULL, 'Jennifer Liu', 'https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=400', 
'Serial entrepreneur with 3 successful exits. Angel investor focused on B2B SaaS.',
'Founder & CEO', 'VentureFlow Capital', 'https://ventureflow.ca'),

('b3003b11-3333-3333-3333-333333333333', 'a30043333-3333-3333-333333333333', 
NULL, 'David Park', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400', 
'Built and scaled a tech company from Nelson to $50M ARR. Mentor at Techstars.',
'Founder', 'Mountain Tech Solutions', 'https://mountaintech.ca'),

('b3004b11-3333-3333-3333-333333333333', 'a30043333-3333-3333-333333333333', 
'4c6aca02-ccd6-46b6-ae8f-3969e32cb873', NULL, NULL, NULL, NULL, NULL, NULL);

-- Cybersecurity Series Presenters
INSERT INTO event_presenters (
    id, session_id, member_id, name, image, bio, title, company, website
) VALUES
('b4001b11-4444-4444-4444-444444444444', 'a40014444-4444-4444-444444444444', 
'857a4b0b-961f-4c36-96db-5ced07c11232', NULL, NULL, NULL, NULL, NULL, NULL),

('b4002b11-4444-4444-4444-444444444444', 'a40024444-4444-4444-444444444444', 
NULL, 'Alex Kumar', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400', 
'Security architect with expertise in application security and secure SDLC practices.',
'Principal Security Engineer', 'SecureCode Labs', 'https://securecode.io/kumar'),

('b4003b11-4444-4444-4444-444444444444', 'a40034444-4444-4444-444444444444', 
NULL, 'Linda Thompson', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400', 
'Incident response specialist with experience handling major security breaches.',
'CISO', 'CyberDefense Corp', 'https://cyberdefense.com/thompson'),

('b4004b11-4444-4444-4444-444444444444', 'a40044444-4444-4444-444444444444', 
'857a4b0b-961f-4c36-96db-5ced07c11232', NULL, NULL, NULL, NULL, NULL, NULL);

-- Data Science Conference Presenters
INSERT INTO event_presenters (
    id, session_id, member_id, name, image, bio, title, company, website
) VALUES
('b5001b11-5555-5555-5555-555555555555', 'a50015555-5555-5555-555555555555', 
'b62e36e4-11a4-4567-979e-3f3ebbc9232d', NULL, NULL, NULL, NULL, NULL, NULL),

('b5002b11-5555-5555-5555-555555555555', 'a50025555-5555-5555-555555555555', 
NULL, 'Dr. Emma Watson', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400', 
'Data visualization expert and author of "Beautiful Data". Professor at SFU.',
'Professor of Data Science', 'Simon Fraser University', 'https://sfu.ca/watson'),

('b5003b11-5555-5555-5555-555555555555', 'a50035555-5555-5555-555555555555', 
NULL, 'Robert Chang', 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400', 
'Time series analysis expert with focus on financial and environmental data.',
'Chief Data Scientist', 'Temporal Analytics', 'https://temporal.ai/chang'),

('b5004b11-5555-5555-5555-555555555555', 'a50045555-5555-5555-555555555555', 
'b62e36e4-11a4-4567-979e-3f3ebbc9232d', NULL, NULL, NULL, NULL, NULL, NULL),

('b5005b11-5555-5555-5555-555555555555', 'a50045555-5555-5555-555555555555', 
NULL, 'Michelle Brown', 'https://images.unsplash.com/photo-1594736797933-d0dc2e715114?w=400', 
'Data science leader with 15 years building data teams at Fortune 500 companies.',
'VP of Data Science', 'DataCorp International', 'https://datacorp.com/brown');

-- =====================================================
-- EVENT RESOURCES
-- =====================================================

-- AI Summit Resources
INSERT INTO event_resources (
    id, session_id, title, url, type
) VALUES
('c1001c11-1111-1111-1111-111111111111', 'a1001111-1111-1111-1111-111111111',
'Keynote Slides: Future of AI', 'https://slides.ai-summit.com/keynote-day1', 'slides'),

('c1002c11-1111-1111-1111-111111111111', 'a1002111-1111-1111-1111-111111111',
'ML Workshop Jupyter Notebooks', 'https://github.com/ai-summit/ml-workshop', 'code'),

('c1003c11-1111-1111-1111-111111111111', 'a1002111-1111-1111-1111-111111111',
'Python ML Cheat Sheet', 'https://resources.ai-summit.com/ml-cheatsheet.pdf', 'document'),

('c1004c11-1111-1111-1111-111111111111', 'a1003111-1111-1111-1111-111111111',
'AI Ethics Guidelines', 'https://resources.ai-summit.com/ethics-guidelines.pdf', 'document'),

('c1005c11-1111-1111-1111-111111111111', 'a1004111-1111-1111-1111-111111111',
'NLP Demo Applications', 'https://demos.ai-summit.com/nlp', 'website');

-- Full Stack Bootcamp Resources
INSERT INTO event_resources (
    id, session_id, title, url, type
) VALUES
('c2001c11-2222-2222-2222-222222222222', 'a20012222-2222-2222-222222222222',
'React Workshop Starter Code', 'https://github.com/fullstack-bootcamp/react-starter', 'code'),

('c2002c11-2222-2222-2222-222222222222', 'a20012222-2222-2222-222222222222',
'React Best Practices Guide', 'https://bootcamp.nelsontech.com/react-guide.pdf', 'document'),

('c2003c11-2222-2222-2222-222222222222', 'a20022222-2222-2222-222222222222',
'Node.js API Template', 'https://github.com/fullstack-bootcamp/node-api-template', 'code'),

('c2004c11-2222-2222-2222-222222222222', 'a20032222-2222-2222-222222222222',
'Deployment Checklist', 'https://bootcamp.nelsontech.com/deployment-checklist.pdf', 'document');

-- Cybersecurity Resources
INSERT INTO event_resources (
    id, session_id, title, url, type
) VALUES
('c4001c11-4444-4444-4444-444444444444', 'a40014444-4444-4444-444444444444',
'Risk Assessment Template', 'https://cybersec-series.com/risk-template.xlsx', 'document'),

('c4002c11-4444-4444-4444-444444444444', 'a40024444-4444-4444-444444444444',
'OWASP Top 10 Guide', 'https://owasp.org/Top10/', 'website'),

('c4003c11-4444-4444-4444-444444444444', 'a40034444-4444-4444-444444444444',
'Incident Response Playbook', 'https://cybersec-series.com/ir-playbook.pdf', 'document'),

('c4004c11-4444-4444-4444-444444444444', 'a40044444-4444-4444-444444444444',
'Compliance Checklist', 'https://cybersec-series.com/compliance-checklist.pdf', 'document');

-- Data Science Resources
INSERT INTO event_resources (
    id, session_id, title, url, type
) VALUES
('c5001c11-5555-5555-5555-555555555555', 'a50025555-5555-5555-555555555555',
'Visualization Code Examples', 'https://github.com/datasci-conf/viz-examples', 'code'),

('c5002c11-5555-5555-5555-555555555555', 'a50025555-5555-5555-555555555555',
'Color Palette Guide', 'https://datasci-conf.com/color-guide.pdf', 'document'),

('c5003c11-5555-5555-5555-555555555555', 'a50035555-5555-5555-555555555555',
'Time Series Analysis Notebooks', 'https://github.com/datasci-conf/timeseries', 'code'),

('c5004c11-5555-5555-5555-555555555555', 'a50045555-5555-5555-555555555555',
'Career Path Roadmap', 'https://datasci-conf.com/career-roadmap.pdf', 'document');

-- =====================================================
-- EVENT ATTENDEES (Sample registrations)
-- =====================================================

-- AI Summit Attendees
INSERT INTO event_attendees (event_id, member_id, registered_at, status) VALUES
('e1000001-1111-1111-1111-111111111111', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', NOW() - INTERVAL '30 days', 'registered'),
('e1000001-1111-1111-1111-111111111111', 'd0519096-9dd8-4397-b0bd-3dbb8cebdb39', NOW() - INTERVAL '28 days', 'registered'),
('e1000001-1111-1111-1111-111111111111', 'a75a33d8-aa13-42a9-a246-3a5c8e5c838f', NOW() - INTERVAL '25 days', 'registered'),
('e1000001-1111-1111-1111-111111111111', '8fa10942-4a64-4911-a45d-eb4996002302', NOW() - INTERVAL '22 days', 'registered'),
('e1000001-1111-1111-1111-111111111111', 'b62e36e4-11a4-4567-979e-3f3ebbc9232d', NOW() - INTERVAL '20 days', 'registered');

-- Full Stack Bootcamp Attendees
INSERT INTO event_attendees (event_id, member_id, registered_at, status) VALUES
('e2000002-2222-2222-2222-222222222222', '7131f030-4431-4dbf-816b-9cb4ebd2d54d', NOW() - INTERVAL '15 days', 'registered'),
('e2000002-2222-2222-2222-222222222222', '857a4b0b-961f-4c36-96db-5ced07c11232', NOW() - INTERVAL '14 days', 'registered'),
('e2000002-2222-2222-2222-222222222222', '1918195d-3aab-4a48-9999-f17e2a4f2ef9', NOW() - INTERVAL '12 days', 'registered'),
('e2000002-2222-2222-2222-222222222222', 'f06db137-c993-4ab9-8d36-d94fe284bca9', NOW() - INTERVAL '10 days', 'registered');

-- Startup Pitch Night Attendees
INSERT INTO event_attendees (event_id, member_id, registered_at, status) VALUES
('e3000003-3333-3333-3333-333333333333', '4c6aca02-ccd6-46b6-ae8f-3969e32cb873', NOW() - INTERVAL '8 days', 'registered'),
('e3000003-3333-3333-3333-333333333333', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', NOW() - INTERVAL '7 days', 'registered'),
('e3000003-3333-3333-3333-333333333333', 'd0519096-9dd8-4397-b0bd-3dbb8cebdb39', NOW() - INTERVAL '6 days', 'registered');

-- Cybersecurity Workshop Attendees
INSERT INTO event_attendees (event_id, member_id, registered_at, status) VALUES
('e4000004-4444-4444-4444-444444444444', 'a75a33d8-aa13-42a9-a246-3a5c8e5c838f', NOW() - INTERVAL '5 days', 'registered'),
('e4000004-4444-4444-4444-444444444444', '8fa10942-4a64-4911-a45d-eb4996002302', NOW() - INTERVAL '4 days', 'registered');

-- Data Science Conference Attendees
INSERT INTO event_attendees (event_id, member_id, registered_at, status) VALUES
('e5000005-5555-5555-5555-555555555555', 'b62e36e4-11a4-4567-979e-3f3ebbc9232d', NOW() - INTERVAL '3 days', 'registered'),
('e5000005-5555-5555-5555-555555555555', '7131f030-4431-4dbf-816b-9cb4ebd2d54d', NOW() - INTERVAL '2 days', 'registered'),
('e5000005-5555-5555-5555-555555555555', '857a4b0b-961f-4c36-96db-5ced07c11232', NOW() - INTERVAL '1 day', 'registered');

COMMIT;

-- =====================================================
-- SUMMARY
-- =====================================================
-- Comprehensive event data successfully created:
-- - 10 Events with diverse formats (in-person, online, hybrid)
-- - 29 Event sessions with detailed descriptions
-- - 40+ Event presenters (mix of members and external speakers)
-- - 20+ Event resources (slides, code, documents)
-- - Sample attendee registrations
-- 
-- Events cover various tech topics:
-- - AI & Machine Learning
-- - Full Stack Development
-- - Startup/Entrepreneurship
-- - Cybersecurity
-- - Data Science
-- - Mobile Development
-- - UX/UI Design
-- - Cloud Architecture
-- - Women in Tech
-- - Hackathons
-- =====================================================