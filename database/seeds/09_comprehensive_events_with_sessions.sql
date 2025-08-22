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
('4be73ce1-156f-43fe-8b7f-551ed18ee348', 
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
('2acff0a4-54de-4425-a1df-7c352243c789', 
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
('9b95ce11-5234-4b4f-a72a-e074f5bc29f7', 
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
('9ebe384e-eee6-4291-82d8-31c8be4cdb2d', 
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
('b4759786-a5c5-4afd-bbf9-c693ac98cd91', 
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
('18ee10ea-d013-4692-9eb1-2437cf0527de', 
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
('0c94fb23-a562-406a-abb7-6d641f2b345f', 
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
('2885c0fa-88e8-4d39-b947-e56ff35890c5', 
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
('aae9c7d6-c2d5-4fe0-8cc0-f4742e64d457', 
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
('acb4b178-e357-4736-b9ac-71e417bc25ab', 
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
('f5bf6675-28df-4346-9672-ef93345cce9e', '4be73ce1-156f-43fe-8b7f-551ed18ee348',
'Opening Keynote: The Future of AI in Small Communities',
'Exploring how AI can transform smaller communities and create opportunities outside major tech hubs.',
'2025-07-15 09:00:00-07', '2025-07-15 10:00:00-07', NULL),

('04ab2b74-9393-4c03-9724-10e9caf9aff7', '4be73ce1-156f-43fe-8b7f-551ed18ee348',
'Workshop: Introduction to Machine Learning with Python',
'Hands-on workshop covering the basics of machine learning using Python, scikit-learn, and Jupyter notebooks.',
'2025-07-15 10:15:00-07', '2025-07-15 12:15:00-07', NULL),

('56679df8-ee39-41c2-a350-f3aa9acd1ef3', '4be73ce1-156f-43fe-8b7f-551ed18ee348',
'Panel: AI Ethics and Responsible Development',
'Industry experts discuss the ethical implications of AI and best practices for responsible AI development.',
'2025-07-15 13:30:00-07', '2025-07-15 14:45:00-07', NULL),

('07d39cd7-651b-4ced-9624-4a63da219668', '4be73ce1-156f-43fe-8b7f-551ed18ee348',
'Deep Dive: Natural Language Processing Applications',
'Advanced session on NLP techniques and their practical applications in business.',
'2025-07-15 15:00:00-07', '2025-07-15 16:30:00-07', NULL),

-- AI & Machine Learning Summit Sessions (Day 2)
('f3bd81de-e6c8-4a9c-ac53-5a340374e6f2', '4be73ce1-156f-43fe-8b7f-551ed18ee348',
'Computer Vision for Environmental Monitoring',
'Learn how computer vision is being used to monitor and protect our natural environment.',
'2025-07-16 09:00:00-07', '2025-07-16 10:30:00-07', NULL),

('9e0aac42-4a1d-41b9-a3fb-09cfac639bae', '4be73ce1-156f-43fe-8b7f-551ed18ee348',
'Building Production ML Pipelines',
'Best practices for deploying and maintaining machine learning models in production.',
'2025-07-16 10:45:00-07', '2025-07-16 12:15:00-07', NULL),

('4caa6c70-a797-450b-b29d-4c5d5ccee236', '4be73ce1-156f-43fe-8b7f-551ed18ee348',
'AI in Healthcare: Case Studies from BC',
'Real-world examples of AI applications in British Columbia healthcare systems.',
'2025-07-16 13:30:00-07', '2025-07-16 15:00:00-07', NULL),

('0013385b-28fd-4d84-a708-0d45e098abef', '4be73ce1-156f-43fe-8b7f-551ed18ee348',
'Closing Keynote: Building an AI-Enabled Future',
'Vision for the future of AI and its impact on work, life, and society.',
'2025-07-16 15:15:00-07', '2025-07-16 16:30:00-07', NULL);

-- Full Stack Web Development Bootcamp Sessions
INSERT INTO event_sessions (
    id, event_id, title, description, start_time, end_time, video_url
) VALUES
('4418ff1e-76c5-4a8a-94a9-fe07475e861a', '2acff0a4-54de-4425-a1df-7c352243c789',
'Day 1: Frontend Fundamentals with React',
'Deep dive into React components, hooks, state management, and modern React patterns.',
'2025-07-22 09:00:00-07', '2025-07-22 17:00:00-07', NULL),

('6de590ab-51a8-4bf1-8409-f3221017c487', '2acff0a4-54de-4425-a1df-7c352243c789',
'Day 2: Backend Development with Node.js',
'Building RESTful APIs, authentication, database integration, and server deployment.',
'2025-07-23 09:00:00-07', '2025-07-23 17:00:00-07', NULL),

('be6a68a8-299a-4f4f-a65a-c2ee2c6f8152', '2acff0a4-54de-4425-a1df-7c352243c789',
'Day 3: Full Stack Integration & Deployment',
'Connecting frontend to backend, deployment strategies, and building a complete application.',
'2025-07-24 09:00:00-07', '2025-07-24 17:00:00-07', NULL);

-- Startup Pitch Night Sessions
INSERT INTO event_sessions (
    id, event_id, title, description, start_time, end_time, video_url
) VALUES
('1fe188be-5ff0-4ce8-97ef-48f6328d164c', '9b95ce11-5234-4b4f-a72a-e074f5bc29f7',
'Welcome & Networking Reception',
'Meet fellow entrepreneurs, investors, and mentors while enjoying local refreshments.',
'2025-07-29 17:30:00-07', '2025-07-29 18:00:00-07', NULL),

('1c2c58fa-04c9-4646-b74c-51fed97e98a0', '9b95ce11-5234-4b4f-a72a-e074f5bc29f7',
'Startup Pitches: Round 1',
'First four startups present their 5-minute pitches followed by Q&A.',
'2025-07-29 18:00:00-07', '2025-07-29 19:00:00-07', NULL),

('77444a77-b068-48e5-a8f9-ed8d5a02fa2a', '9b95ce11-5234-4b4f-a72a-e074f5bc29f7',
'Startup Pitches: Round 2',
'Final four startups present their 5-minute pitches followed by Q&A.',
'2025-07-29 19:15:00-07', '2025-07-29 20:15:00-07', NULL),

('137ffae8-9162-4bfb-a08f-01edbfaea512', '9b95ce11-5234-4b4f-a72a-e074f5bc29f7',
'Panel: Scaling in the Kootenays',
'Successful local entrepreneurs share their experiences growing tech companies in smaller markets.',
'2025-07-29 20:30:00-07', '2025-07-29 21:30:00-07', NULL);

-- Cybersecurity Workshop Series Sessions (Week 1)
INSERT INTO event_sessions (
    id, event_id, title, description, start_time, end_time, video_url
) VALUES
('74b77450-90c8-45bf-ab73-c7c054df0cac', '9ebe384e-eee6-4291-82d8-31c8be4cdb2d',
'Week 1: Threat Landscape & Risk Assessment',
'Understanding current cyber threats and conducting effective risk assessments for your organization.',
'2025-08-05 18:00:00-07', '2025-08-05 20:00:00-07', 'https://recordings.cybersec-series.com/week1'),

('93d4cd4e-b597-4997-8c3d-fa493f9ccec6', '9ebe384e-eee6-4291-82d8-31c8be4cdb2d',
'Week 2: Secure Coding Practices',
'Writing secure code, common vulnerabilities, and defensive programming techniques.',
'2025-08-12 18:00:00-07', '2025-08-12 20:00:00-07', 'https://recordings.cybersec-series.com/week2'),

('6a9137b2-c044-4a24-859e-0039d36530ed', '9ebe384e-eee6-4291-82d8-31c8be4cdb2d',
'Week 3: Incident Response Planning',
'Building and testing incident response plans, handling breaches, and recovery strategies.',
'2025-08-19 18:00:00-07', '2025-08-19 20:00:00-07', 'https://recordings.cybersec-series.com/week3'),

('942e04c3-58bc-491d-b28d-ce3ee12b0f06', '9ebe384e-eee6-4291-82d8-31c8be4cdb2d',
'Week 4: Compliance & Governance',
'Understanding regulatory requirements, implementing security policies, and audit preparation.',
'2025-08-26 18:00:00-07', '2025-08-26 20:00:00-07', 'https://recordings.cybersec-series.com/week4');

-- Data Science Conference Sessions (Day 1)
INSERT INTO event_sessions (
    id, event_id, title, description, start_time, end_time, video_url
) VALUES
('f5762891-d251-4fea-af64-36d82cca1a9e', 'b4759786-a5c5-4afd-bbf9-c693ac98cd91',
'Opening Keynote: Data Science for Environmental Sustainability',
'How data science is driving environmental conservation and climate action initiatives.',
'2025-08-12 08:30:00-07', '2025-08-12 09:30:00-07', NULL),

('8e7c6858-2af2-4b4d-9f56-10ee7992f0c9', 'b4759786-a5c5-4afd-bbf9-c693ac98cd91',
'Workshop: Advanced Data Visualization with Python',
'Creating compelling data stories using matplotlib, seaborn, and plotly.',
'2025-08-12 10:00:00-07', '2025-08-12 12:00:00-07', NULL),

('b12999d7-b1a4-48c7-ad19-8da2f9e606b8', 'b4759786-a5c5-4afd-bbf9-c693ac98cd91',
'Machine Learning for Time Series Analysis',
'Techniques for analyzing and predicting time-based data patterns.',
'2025-08-12 13:00:00-07', '2025-08-12 15:00:00-07', NULL),

('c84fcaf7-1f7b-45b4-9d15-04c4ca2f98df', 'b4759786-a5c5-4afd-bbf9-c693ac98cd91',
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
('89491792-d6d9-4dbb-8eee-df88f3247bc9', 'f5bf6675-28df-4346-9672-ef93345cce9e', 
'b62e36e4-11a4-4567-979e-3f3ebbc9232d', NULL, NULL, NULL, NULL, NULL, NULL),

('b912e55e-51f2-4e9b-9418-3a996eb38097', 'f5bf6675-28df-4346-9672-ef93345cce9e', 
NULL, 'Dr. Alan Thompson', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400', 
'AI researcher and author of "AI for Everyone". Former Google AI team lead with 15 years in machine learning.',
'Chief AI Officer', 'TechVision Labs', 'https://alanthompson.ai'),

-- ML Workshop
('3a13c097-c5a0-4119-8c88-3aef48f64ebf', '04ab2b74-9393-4c03-9724-10e9caf9aff7', 
'b62e36e4-11a4-4567-979e-3f3ebbc9232d', NULL, NULL, NULL, NULL, NULL, NULL),

('d1d71c5e-695c-41b7-80bd-4afb1e882edb', '04ab2b74-9393-4c03-9724-10e9caf9aff7', 
NULL, 'Sarah Kim', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400', 
'Machine learning engineer with expertise in Python and TensorFlow. Passionate educator and open source contributor.',
'Senior ML Engineer', 'DataFlow Systems', 'https://sarahkim.dev'),

-- Ethics Panel
('ce849d83-4511-4dc5-a913-f785f9508e7e', '56679df8-ee39-41c2-a350-f3aa9acd1ef3', 
'a75a33d8-aa13-42a9-a246-3a5c8e5c838f', NULL, NULL, NULL, NULL, NULL, NULL),

('2e92b957-9b19-445c-8741-6c40f459ef72', '56679df8-ee39-41c2-a350-f3aa9acd1ef3', 
NULL, 'Prof. Maria Garcia', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400', 
'Ethics professor specializing in AI governance and policy. Advisor to Canadian AI ethics committee.',
'Professor of Ethics', 'University of British Columbia', 'https://ethics.ubc.ca/garcia'),

('e4cd0bfa-ad5b-4c92-b03e-952c20cb4c87', '56679df8-ee39-41c2-a350-f3aa9acd1ef3', 
NULL, 'James Mitchell', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400', 
'Legal expert in AI regulation and data privacy. Published author on technology law.',
'Partner', 'Mitchell & Associates Law', 'https://mitchelllaw.ca'),

-- NLP Deep Dive
('e0248c6d-d664-458a-a32c-67a523169857', '07d39cd7-651b-4ced-9624-4a63da219668', 
NULL, 'Dr. Rachel Chen', 'https://images.unsplash.com/photo-1594736797933-d0dc2e715114?w=400', 
'NLP researcher with focus on multilingual models and conversational AI. Former Amazon Alexa team.',
'Principal NLP Scientist', 'LinguaTech AI', 'https://rachelchen-nlp.com'),

-- Computer Vision
('eb9ee106-6b6b-45e8-a069-5d836f7aa0dc', 'f3bd81de-e6c8-4a9c-ac53-5a340374e6f2', 
NULL, 'Michael Roberts', 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400', 
'Computer vision specialist applying AI to environmental monitoring and wildlife conservation.',
'Lead CV Engineer', 'EcoVision Tech', 'https://ecovision.tech/team/roberts'),

-- Production ML
('74a2ae20-44cb-4cd5-a172-05c007ec863f', '9e0aac42-4a1d-41b9-a3fb-09cfac639bae', 
'd0519096-9dd8-4397-b0bd-3dbb8cebdb39', NULL, NULL, NULL, NULL, NULL, NULL),

-- Healthcare AI
('1b0d264f-ea0e-4c2f-a280-c67bbf491935', '4caa6c70-a797-450b-b29d-4c5d5ccee236', 
'a75a33d8-aa13-42a9-a246-3a5c8e5c838f', NULL, NULL, NULL, NULL, NULL, NULL),

('0ea3e5e9-7461-4547-9b19-1ea442fa0723', '4caa6c70-a797-450b-b29d-4c5d5ccee236', 
NULL, 'Dr. Patricia Wong', 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400', 
'Healthcare AI specialist with 20 years in medical technology. Pioneer in AI-assisted diagnostics.',
'Chief Medical Officer', 'HealthAI Solutions', 'https://healthai.ca/wong');

-- Full Stack Bootcamp Presenters
INSERT INTO event_presenters (
    id, session_id, member_id, name, image, bio, title, company, website
) VALUES
('d814b6a4-9a56-4ece-a9b9-b30264da0c02', '4418ff1e-76c5-4a8a-94a9-fe07475e861a', 
'a1b2c3d4-e5f6-7890-abcd-ef1234567890', NULL, NULL, NULL, NULL, NULL, NULL),

('e47fa38b-1c85-47bc-9fb0-e53cafe4105a', '4418ff1e-76c5-4a8a-94a9-fe07475e861a', 
NULL, 'Tom Anderson', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400', 
'Frontend architect with 10+ years building scalable React applications. Contributor to React core.',
'Principal Frontend Engineer', 'WebScale Inc', 'https://tomanderson.dev'),

('01d0039f-21de-49ea-8909-20912733cfac', '6de590ab-51a8-4bf1-8409-f3221017c487', 
'f06db137-c993-4ab9-8d36-d94fe284bca9', NULL, NULL, NULL, NULL, NULL, NULL),

('371588e5-7357-441c-8428-e0613460b0c8', 'be6a68a8-299a-4f4f-a65a-c2ee2c6f8152', 
'd0519096-9dd8-4397-b0bd-3dbb8cebdb39', NULL, NULL, NULL, NULL, NULL, NULL);

-- Startup Pitch Night Presenters
INSERT INTO event_presenters (
    id, session_id, member_id, name, image, bio, title, company, website
) VALUES
-- Panel moderator
('e1501e66-4b22-4873-8bd6-c295a1980329', '137ffae8-9162-4bfb-a08f-01edbfaea512', 
'1918195d-3aab-4a48-9999-f17e2a4f2ef9', NULL, NULL, NULL, NULL, NULL, NULL),

-- Panel members
('b8cfcf94-2504-48d4-a6be-3d322acfaa22', '137ffae8-9162-4bfb-a08f-01edbfaea512', 
NULL, 'Jennifer Liu', 'https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=400', 
'Serial entrepreneur with 3 successful exits. Angel investor focused on B2B SaaS.',
'Founder & CEO', 'VentureFlow Capital', 'https://ventureflow.ca'),

('fe893b81-1022-4fa6-aa69-410cf541a9cf', '137ffae8-9162-4bfb-a08f-01edbfaea512', 
NULL, 'David Park', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400', 
'Built and scaled a tech company from Nelson to $50M ARR. Mentor at Techstars.',
'Founder', 'Mountain Tech Solutions', 'https://mountaintech.ca'),

('d87bf525-6cb1-4e9a-aa34-98328dd2d63c', '137ffae8-9162-4bfb-a08f-01edbfaea512', 
'4c6aca02-ccd6-46b6-ae8f-3969e32cb873', NULL, NULL, NULL, NULL, NULL, NULL);

-- Cybersecurity Series Presenters
INSERT INTO event_presenters (
    id, session_id, member_id, name, image, bio, title, company, website
) VALUES
('cb9e4e5b-1d5c-4c52-8aaa-3e49603ea41c', '74b77450-90c8-45bf-ab73-c7c054df0cac', 
'857a4b0b-961f-4c36-96db-5ced07c11232', NULL, NULL, NULL, NULL, NULL, NULL),

('5bdaf1ed-b0bd-4728-9deb-ffb82c212957', '93d4cd4e-b597-4997-8c3d-fa493f9ccec6', 
NULL, 'Alex Kumar', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400', 
'Security architect with expertise in application security and secure SDLC practices.',
'Principal Security Engineer', 'SecureCode Labs', 'https://securecode.io/kumar'),

('63d709d8-1eb0-49a5-a250-a9ac6405c08b', '6a9137b2-c044-4a24-859e-0039d36530ed', 
NULL, 'Linda Thompson', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400', 
'Incident response specialist with experience handling major security breaches.',
'CISO', 'CyberDefense Corp', 'https://cyberdefense.com/thompson'),

('d6cbdc05-b509-4d46-8e77-1b6469ed3ddc', '942e04c3-58bc-491d-b28d-ce3ee12b0f06', 
'857a4b0b-961f-4c36-96db-5ced07c11232', NULL, NULL, NULL, NULL, NULL, NULL);

-- Data Science Conference Presenters
INSERT INTO event_presenters (
    id, session_id, member_id, name, image, bio, title, company, website
) VALUES
('f511bab1-0e02-4961-8c36-13af8134eec7', 'f5762891-d251-4fea-af64-36d82cca1a9e', 
'b62e36e4-11a4-4567-979e-3f3ebbc9232d', NULL, NULL, NULL, NULL, NULL, NULL),

('2278ada4-f7f8-4957-886b-137f28892689', '8e7c6858-2af2-4b4d-9f56-10ee7992f0c9', 
NULL, 'Dr. Emma Watson', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400', 
'Data visualization expert and author of "Beautiful Data". Professor at SFU.',
'Professor of Data Science', 'Simon Fraser University', 'https://sfu.ca/watson'),

('36eee5be-fe53-4b03-9f81-04d0897a2292', 'b12999d7-b1a4-48c7-ad19-8da2f9e606b8', 
NULL, 'Robert Chang', 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400', 
'Time series analysis expert with focus on financial and environmental data.',
'Chief Data Scientist', 'Temporal Analytics', 'https://temporal.ai/chang'),

('736deb6e-c148-4680-987a-bb24b9c24597', 'c84fcaf7-1f7b-45b4-9d15-04c4ca2f98df', 
'b62e36e4-11a4-4567-979e-3f3ebbc9232d', NULL, NULL, NULL, NULL, NULL, NULL),

('a4a7bda6-5770-4d29-a06e-d9d0b0c29f95', 'c84fcaf7-1f7b-45b4-9d15-04c4ca2f98df', 
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
('460710d1-6adb-45ac-abcd-0be2fbafe663', 'f5bf6675-28df-4346-9672-ef93345cce9e',
'Keynote Slides: Future of AI', 'https://slides.ai-summit.com/keynote-day1', 'slides'),

('6261fa1b-2d99-4350-bda0-c4362e3219cf', '04ab2b74-9393-4c03-9724-10e9caf9aff7',
'ML Workshop Jupyter Notebooks', 'https://github.com/ai-summit/ml-workshop', 'code'),

('e67041d5-b11a-4990-9475-bd6815259518', '04ab2b74-9393-4c03-9724-10e9caf9aff7',
'Python ML Cheat Sheet', 'https://resources.ai-summit.com/ml-cheatsheet.pdf', 'document'),

('ebaa6473-04a1-4063-b324-4452596a8393', '56679df8-ee39-41c2-a350-f3aa9acd1ef3',
'AI Ethics Guidelines', 'https://resources.ai-summit.com/ethics-guidelines.pdf', 'document'),

('3bec924d-7b29-4f69-8887-b31acb852423', '07d39cd7-651b-4ced-9624-4a63da219668',
'NLP Demo Applications', 'https://demos.ai-summit.com/nlp', 'website');

-- Full Stack Bootcamp Resources
INSERT INTO event_resources (
    id, session_id, title, url, type
) VALUES
('072fe2bf-a33d-4445-a1bd-6a0bf62cb000', '4418ff1e-76c5-4a8a-94a9-fe07475e861a',
'React Workshop Starter Code', 'https://github.com/fullstack-bootcamp/react-starter', 'code'),

('c1a5b744-82cb-47e5-a1ee-38cfa22329ea', '4418ff1e-76c5-4a8a-94a9-fe07475e861a',
'React Best Practices Guide', 'https://bootcamp.nelsontech.com/react-guide.pdf', 'document'),

('f2b127be-1838-4b48-93e4-67bba81c4376', '6de590ab-51a8-4bf1-8409-f3221017c487',
'Node.js API Template', 'https://github.com/fullstack-bootcamp/node-api-template', 'code'),

('fd0ba817-5bb7-496d-99dc-a392e50622e6', 'be6a68a8-299a-4f4f-a65a-c2ee2c6f8152',
'Deployment Checklist', 'https://bootcamp.nelsontech.com/deployment-checklist.pdf', 'document');

-- Cybersecurity Resources
INSERT INTO event_resources (
    id, session_id, title, url, type
) VALUES
('7bf7a729-de05-48fe-a2a6-5fc6d68ca9e3', '74b77450-90c8-45bf-ab73-c7c054df0cac',
'Risk Assessment Template', 'https://cybersec-series.com/risk-template.xlsx', 'document'),

('898e8dd8-8e50-40dc-973d-a654f2a0fafd', '93d4cd4e-b597-4997-8c3d-fa493f9ccec6',
'OWASP Top 10 Guide', 'https://owasp.org/Top10/', 'website'),

('a3c15d34-4b3f-46f8-9f27-2717b1da0c92', '6a9137b2-c044-4a24-859e-0039d36530ed',
'Incident Response Playbook', 'https://cybersec-series.com/ir-playbook.pdf', 'document'),

('3424ca4e-d226-427b-90ce-ba94e13c2e47', '942e04c3-58bc-491d-b28d-ce3ee12b0f06',
'Compliance Checklist', 'https://cybersec-series.com/compliance-checklist.pdf', 'document');

-- Data Science Resources
INSERT INTO event_resources (
    id, session_id, title, url, type
) VALUES
('cf375246-8f31-4077-8c05-4b874881db8a', '8e7c6858-2af2-4b4d-9f56-10ee7992f0c9',
'Visualization Code Examples', 'https://github.com/datasci-conf/viz-examples', 'code'),

('83b953db-039e-4e51-9827-89c422e4d6a8', '8e7c6858-2af2-4b4d-9f56-10ee7992f0c9',
'Color Palette Guide', 'https://datasci-conf.com/color-guide.pdf', 'document'),

('1500d077-5312-4c91-9cbf-9adcff6d1338', 'b12999d7-b1a4-48c7-ad19-8da2f9e606b8',
'Time Series Analysis Notebooks', 'https://github.com/datasci-conf/timeseries', 'code'),

('3be1a8b9-0b30-47a3-908b-95c17ae4fc2d', 'c84fcaf7-1f7b-45b4-9d15-04c4ca2f98df',
'Career Path Roadmap', 'https://datasci-conf.com/career-roadmap.pdf', 'document');

-- =====================================================
-- EVENT ATTENDEES (Sample registrations)
-- =====================================================

-- AI Summit Attendees
INSERT INTO event_attendees (event_id, member_id, registered_at, status) VALUES
('4be73ce1-156f-43fe-8b7f-551ed18ee348', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', NOW() - INTERVAL '30 days', 'registered'),
('4be73ce1-156f-43fe-8b7f-551ed18ee348', 'd0519096-9dd8-4397-b0bd-3dbb8cebdb39', NOW() - INTERVAL '28 days', 'registered'),
('4be73ce1-156f-43fe-8b7f-551ed18ee348', 'a75a33d8-aa13-42a9-a246-3a5c8e5c838f', NOW() - INTERVAL '25 days', 'registered'),
('4be73ce1-156f-43fe-8b7f-551ed18ee348', '8fa10942-4a64-4911-a45d-eb4996002302', NOW() - INTERVAL '22 days', 'registered'),
('4be73ce1-156f-43fe-8b7f-551ed18ee348', 'b62e36e4-11a4-4567-979e-3f3ebbc9232d', NOW() - INTERVAL '20 days', 'registered');

-- Full Stack Bootcamp Attendees
INSERT INTO event_attendees (event_id, member_id, registered_at, status) VALUES
('2acff0a4-54de-4425-a1df-7c352243c789', '7131f030-4431-4dbf-816b-9cb4ebd2d54d', NOW() - INTERVAL '15 days', 'registered'),
('2acff0a4-54de-4425-a1df-7c352243c789', '857a4b0b-961f-4c36-96db-5ced07c11232', NOW() - INTERVAL '14 days', 'registered'),
('2acff0a4-54de-4425-a1df-7c352243c789', '1918195d-3aab-4a48-9999-f17e2a4f2ef9', NOW() - INTERVAL '12 days', 'registered'),
('2acff0a4-54de-4425-a1df-7c352243c789', 'f06db137-c993-4ab9-8d36-d94fe284bca9', NOW() - INTERVAL '10 days', 'registered');

-- Startup Pitch Night Attendees
INSERT INTO event_attendees (event_id, member_id, registered_at, status) VALUES
('9b95ce11-5234-4b4f-a72a-e074f5bc29f7', '4c6aca02-ccd6-46b6-ae8f-3969e32cb873', NOW() - INTERVAL '8 days', 'registered'),
('9b95ce11-5234-4b4f-a72a-e074f5bc29f7', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', NOW() - INTERVAL '7 days', 'registered'),
('9b95ce11-5234-4b4f-a72a-e074f5bc29f7', 'd0519096-9dd8-4397-b0bd-3dbb8cebdb39', NOW() - INTERVAL '6 days', 'registered');

-- Cybersecurity Workshop Attendees
INSERT INTO event_attendees (event_id, member_id, registered_at, status) VALUES
('9ebe384e-eee6-4291-82d8-31c8be4cdb2d', 'a75a33d8-aa13-42a9-a246-3a5c8e5c838f', NOW() - INTERVAL '5 days', 'registered'),
('9ebe384e-eee6-4291-82d8-31c8be4cdb2d', '8fa10942-4a64-4911-a45d-eb4996002302', NOW() - INTERVAL '4 days', 'registered');

-- Data Science Conference Attendees
INSERT INTO event_attendees (event_id, member_id, registered_at, status) VALUES
('b4759786-a5c5-4afd-bbf9-c693ac98cd91', 'b62e36e4-11a4-4567-979e-3f3ebbc9232d', NOW() - INTERVAL '3 days', 'registered'),
('b4759786-a5c5-4afd-bbf9-c693ac98cd91', '7131f030-4431-4dbf-816b-9cb4ebd2d54d', NOW() - INTERVAL '2 days', 'registered'),
('b4759786-a5c5-4afd-bbf9-c693ac98cd91', '857a4b0b-961f-4c36-96db-5ced07c11232', NOW() - INTERVAL '1 day', 'registered');

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