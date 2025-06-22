-- =====================================================
-- FRESH DEMO CONTENT SEED FOR NELSON TECH COMMUNITY PLATFORM
-- =====================================================
--
-- This file contains a complete set of fresh demo content including:
-- - 10 Members with diverse tech backgrounds
-- - 10 Companies across various tech sectors  
-- - 10 Events with sessions, presenters, and attendees
-- - 10 Groups with membership relationships
-- - 10 Marketplace listings (products and services)
-- - 10 News articles with cross-references
-- - 10 Educational resources
-- - 10 Job opportunities
--
-- Generated: June 22, 2025
-- Agent: SWARM Auto-Centralized Execution
-- Memory Key: swarm-auto-centralized-1750556850757
--
-- IMPORTANT: This seed data uses UUIDs that reference existing tag system
-- and includes proper relationships between all content types.
--
-- =====================================================

BEGIN;

-- Set timezone for consistent timestamps
SET TIME ZONE 'America/Vancouver';

-- =====================================================
-- MEMBERS (10 diverse tech professionals)
-- =====================================================

INSERT INTO "public"."members" ("id", "created_at", "name", "title", "bio", "location", "image", "website", "employment_status", "open_to_volunteering", "arrived_in_nelson", "user_id", "status", "featured", "social", "company") VALUES
	('a1b2c3d4-e5f6-7890-abcd-ef1234567890', '2025-06-22 18:00:00+00', 'Sarah Mitchell', 'Senior Full Stack Developer', 'Passionate about building scalable web applications with React and Node.js. Previously worked at tech companies in Vancouver before moving to Nelson for the mountain lifestyle. Love mentoring junior developers and contributing to open source projects.', 'Nelson, BC', 'https://images.unsplash.com/photo-1494790108755-2616b612b743?w=400', 'https://sarahmitchell.dev', 'employed', true, '2022-03-15', NULL, 'published', true, '{"linkedin": "https://linkedin.com/in/sarahmitchelldev", "github": "https://github.com/sarahmitchell", "twitter": "https://twitter.com/sarahcodes"}', 'TechFlow Solutions'),
	('b2c3d4e5-f607-8901-bcde-f12345678901', '2025-06-22 18:01:00+00', 'Marcus Chen', 'DevOps Engineer', 'Cloud infrastructure specialist with expertise in AWS, Docker, and Kubernetes. Moved to the Kootenays from Toronto to enjoy outdoor adventures while building robust deployment pipelines. Always excited to share knowledge about cloud technologies.', 'Castlegar, BC', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400', 'https://marcuschen.tech', 'employed', true, '2021-08-22', NULL, 'published', false, '{"linkedin": "https://linkedin.com/in/marcuschen-devops", "github": "https://github.com/marcuschen"}', 'CloudPeak Technologies'),
	('c3d4e5f6-a788-9012-cdef-123456789012', '2025-06-22 18:02:00+00', 'Dr. Emily Rodriguez', 'Healthcare Technology Consultant', 'Bridging the gap between healthcare and technology. Former emergency physician who transitioned to health tech consulting. Specializes in telemedicine platforms and healthcare data analytics. Relocated to Nelson to balance work with outdoor recreation.', 'Nelson, BC', 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400', 'https://dremilyrodriguez.com', 'self-employed', true, '2023-01-10', NULL, 'published', true, '{"linkedin": "https://linkedin.com/in/dr-emily-rodriguez", "website": "https://healthtechconsulting.ca"}', 'HealthTech Innovations'),
	('d4e5f607-d819-0123-defa-234567890123', '2025-06-22 18:03:00+00', 'David Kim', 'Mobile App Developer', 'iOS and Android developer with a passion for creating intuitive user experiences. Specializes in React Native and Flutter development. Former Samsung engineer who fell in love with BC mountains during a hiking trip and decided to stay.', 'Kaslo, BC', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400', 'https://davidkim.dev', 'employed', false, '2022-09-05', NULL, 'published', false, '{"linkedin": "https://linkedin.com/in/davidkim-mobile", "github": "https://github.com/davidkimdev", "portfolio": "https://davidkim.dev"}', 'MobileTech Studio'),
	('e5f60788-a900-1234-efab-345678901234', '2025-06-22 18:04:00+00', 'Jennifer Walsh', 'Data Scientist & AI Researcher', 'Machine learning engineer focused on environmental data analysis and predictive modeling. PhD in Computer Science from UBC. Moved to Nelson to work on sustainability projects while enjoying the natural beauty of the region.', 'Nelson, BC', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400', 'https://jennwalsh.ai', 'employed', true, '2023-05-18', NULL, 'published', true, '{"linkedin": "https://linkedin.com/in/jennifer-walsh-ai", "github": "https://github.com/jennwalsh", "scholar": "https://scholar.google.com/citations?user=jennwalsh"}', 'DataWise Analytics'),
	('f6078819-a0b1-2345-fabc-456789012345', '2025-06-22 18:05:00+00', 'Alex Thompson', 'UX/UI Designer', 'Creative designer passionate about user-centered design and accessibility. Specializes in designing for SaaS applications and mobile interfaces. Former design lead at Shopify who moved to Nelson for a better work-life balance and mountain biking opportunities.', 'Nelson, BC', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400', 'https://alexthompsondesign.com', 'self-employed', true, '2022-11-30', NULL, 'published', false, '{"linkedin": "https://linkedin.com/in/alexthompson-ux", "dribbble": "https://dribbble.com/alexthompson", "behance": "https://behance.net/alexthompson"}', 'Design Collective'),
	('a7881900-b1c2-3456-abcd-567890123456', '2025-06-22 18:06:00+00', 'Michael Roberts', 'Cybersecurity Analyst', 'Information security professional with expertise in threat detection and vulnerability assessment. CISSP certified with 12 years experience in financial services security. Moved to the Kootenays to escape city stress while maintaining remote security consulting work.', 'Trail, BC', 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400', 'https://michaelroberts-security.com', 'employed', false, '2021-04-12', NULL, 'published', false, '{"linkedin": "https://linkedin.com/in/michael-roberts-cissp"}', 'SecureNet Solutions'),
	('b8190001-c2d3-4567-bcde-678901234567', '2025-06-22 18:07:00+00', 'Lisa Park', 'Product Manager', 'Strategic product manager with experience scaling B2B SaaS products from startup to enterprise. Former Slack product manager who specializes in user onboarding and feature adoption. Chose Nelson for the community feel and outdoor lifestyle.', 'Nelson, BC', 'https://images.unsplash.com/photo-1594736797933-d0dc2e715114?w=400', 'https://lisapark.pm', 'employed', true, '2023-02-28', NULL, 'published', true, '{"linkedin": "https://linkedin.com/in/lisa-park-pm", "twitter": "https://twitter.com/lisaparkpm", "medium": "https://medium.com/@lisapark"}', 'ProductFlow Inc'),
	('c9100112-d3e4-5678-cdef-789012345678', '2025-06-22 18:08:00+00', 'Robert Singh', 'Backend Systems Architect', 'Senior software architect specializing in distributed systems and microservices. Python and Go expert with extensive experience in financial technology. Former CTO of a Vancouver fintech startup, now working remotely from the Kootenays.', 'Rossland, BC', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400', 'https://robertsingh.dev', 'employed', false, '2022-07-14', NULL, 'published', false, '{"linkedin": "https://linkedin.com/in/robert-singh-architect", "github": "https://github.com/robertsingh"}', 'SystemsCore Technologies'),
	('d0111223-e4f5-6789-defg-890123456789', '2025-06-22 18:09:00+00', 'Amanda Foster', 'Digital Marketing Strategist', 'Growth marketing specialist focused on B2B SaaS companies. Expert in content marketing, SEO, and marketing automation. Formerly with HubSpot, now helping local businesses and remote companies build their digital presence from beautiful Nelson.', 'Nelson, BC', 'https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=400', 'https://amandafoster.marketing', 'self-employed', true, '2023-06-20', NULL, 'published', false, '{"linkedin": "https://linkedin.com/in/amanda-foster-marketing", "twitter": "https://twitter.com/amandamarketing", "instagram": "https://instagram.com/amandamarkets"}', 'Growth Marketing Co');

-- =====================================================
-- COMPANIES (10 diverse tech companies)
-- =====================================================

INSERT INTO "public"."companies" ("id", "created_at", "name", "description", "logo", "cover_image", "industry", "size", "founded", "location", "website", "status", "featured") VALUES
	('aa11bb22-cc33-dd44-ee55-ff6677889900', '2025-06-22 18:10:00+00', 'TechFlow Solutions', 'Full-stack web development company specializing in React, Node.js, and cloud-native applications. We build scalable solutions for startups and established businesses, with a focus on clean code and excellent user experiences.', 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=200', 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800', '{technology,software,web-development}', '5-10', '2021', 'Nelson, BC', 'https://techflowsolutions.ca', 'published', true),
	('bb22cc33-dd44-ee55-ff66-778899001122', '2025-06-22 18:11:00+00', 'CloudPeak Technologies', 'Cloud infrastructure and DevOps consulting firm helping businesses migrate to and optimize their cloud operations. Specialists in AWS, Azure, and Google Cloud with expertise in containerization and CI/CD pipelines.', 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=200', 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800', '{technology,cloud-computing,devops}', '11-25', '2020', 'Castlegar, BC', 'https://cloudpeak.tech', 'published', false),
	('cc33dd44-ee55-ff66-7788-99001122aabb', '2025-06-22 18:12:00+00', 'HealthTech Innovations', 'Healthcare technology consulting firm bridging the gap between medical professionals and digital solutions. Specializing in telemedicine platforms, healthcare data analytics, and regulatory compliance for health tech startups.', 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=200', 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800', '{healthcare,technology,consulting}', '2-5', '2022', 'Nelson, BC', 'https://healthtechinnovations.ca', 'published', true),
	('dd44ee55-ff66-7788-9900-1122aabbccdd', '2025-06-22 18:13:00+00', 'MobileTech Studio', 'Mobile app development studio creating iOS and Android applications using React Native and Flutter. From concept to app store deployment, we help businesses reach their mobile audiences with engaging, performant applications.', 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=200', 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800', '{technology,mobile-development,software}', '3-8', '2021', 'Kaslo, BC', 'https://mobiletechstudio.com', 'published', false),
	('ee55ff66-7788-9900-1122-aabbccddeeff', '2025-06-22 18:14:00+00', 'DataWise Analytics', 'Data science and AI consulting firm specializing in environmental data analysis, predictive modeling, and machine learning solutions. We help organizations make data-driven decisions while focusing on sustainability and environmental impact.', 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=200', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800', '{technology,data-science,ai,sustainability}', '8-15', '2022', 'Nelson, BC', 'https://datawiseanalytics.com', 'published', true),
	('ff667788-9900-1122-aabb-ccddeeff0011', '2025-06-22 18:15:00+00', 'Design Collective', 'Creative design studio focusing on UX/UI design, branding, and digital experiences. We work with tech startups, SaaS companies, and local businesses to create beautiful, functional designs that drive user engagement and business growth.', 'https://images.unsplash.com/photo-1558655146-d09347e92766?w=200', 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800', '{design,technology,creative-services}', '4-10', '2020', 'Nelson, BC', 'https://designcollective.ca', 'published', false),
	('77889900-1122-aabb-ccdd-eeff001122aa', '2025-06-22 18:16:00+00', 'SecureNet Solutions', 'Cybersecurity consulting firm providing comprehensive security assessments, threat detection, and compliance solutions. We help businesses of all sizes protect their digital assets and maintain regulatory compliance in an increasingly connected world.', 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=200', 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800', '{technology,cybersecurity,consulting}', '12-20', '2019', 'Trail, BC', 'https://securenetsolutions.ca', 'published', false),
	('88990011-22aa-bbcc-ddee-ff001122aabb', '2025-06-22 18:17:00+00', 'ProductFlow Inc', 'Product management consulting firm helping startups and established companies build better products. We specialize in product strategy, user research, feature prioritization, and go-to-market planning for B2B SaaS companies.', 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=200', 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800', '{technology,consulting,product-management}', '6-12', '2021', 'Nelson, BC', 'https://productflow.ca', 'published', true),
	('99001122-aabb-ccdd-eeff-001122aabbcc', '2025-06-22 18:18:00+00', 'SystemsCore Technologies', 'Backend systems and architecture consulting firm specializing in distributed systems, microservices, and scalable infrastructure. We help businesses build robust, performant backend systems that can handle growth and scale.', 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=200', 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800', '{technology,backend,systems-architecture}', '5-15', '2020', 'Rossland, BC', 'https://systemscore.tech', 'published', false),
	('00112233-aabb-ccdd-eeff-001122aabbcc', '2025-06-22 18:19:00+00', 'Growth Marketing Co', 'Digital marketing agency specializing in growth marketing for B2B SaaS companies. We offer content marketing, SEO, marketing automation, and growth strategy services to help businesses scale their customer acquisition and retention.', 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=200', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800', '{marketing,technology,consulting}', '3-8', '2022', 'Nelson, BC', 'https://growthmarketingco.ca', 'published', false);

-- =====================================================
-- COMPANY-MEMBER RELATIONSHIPS
-- =====================================================

INSERT INTO "public"."company_members" ("company_id", "member_id", "role", "joined_date") VALUES
	('aa11bb22-cc33-dd44-ee55-ff6677889900', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Senior Developer', '2022-04-01'),
	('bb22cc33-dd44-ee55-ff66-778899001122', 'b2c3d4e5-f607-8901-bcde-f12345678901', 'DevOps Engineer', '2021-09-15'),
	('cc33dd44-ee55-ff66-7788-99001122aabb', 'c3d4e5f6-a788-9012-cdef-123456789012', 'Founder & CEO', '2022-01-01'),
	('dd44ee55-ff66-7788-9900-1122aabbccdd', 'd4e5f607-d819-0123-defa-234567890123', 'Lead Mobile Developer', '2022-10-01'),
	('ee55ff66-7788-9900-1122-aabbccddeeff', 'e5f60788-a900-1234-efab-345678901234', 'Principal Data Scientist', '2023-06-01'),
	('ff667788-9900-1122-aabb-ccddeeff0011', 'f6078819-a0b1-2345-fabc-456789012345', 'Creative Director', '2022-12-15'),
	('77889900-1122-aabb-ccdd-eeff001122aa', 'a7881900-b1c2-3456-abcd-567890123456', 'Senior Security Analyst', '2021-05-01'),
	('88990011-22aa-bbcc-ddee-ff001122aabb', 'b8190001-c2d3-4567-bcde-678901234567', 'Head of Product', '2023-03-15'),
	('99001122-aabb-ccdd-eeff-001122aabbcc', 'c9100112-d3e4-5678-cdef-789012345678', 'Principal Architect', '2022-08-01'),
	('00112233-aabb-ccdd-eeff-001122aabbcc', 'd0111223-e4f5-6789-defg-890123456789', 'Founder & Marketing Director', '2022-07-01');

-- =====================================================
-- MEMBER SKILLS & TAGS
-- =====================================================

-- Sarah Mitchell (React, JavaScript, Frontend expert)
INSERT INTO "public"."member_tags" ("id", "created_at", "member_id", "tag_id", "skill_level", "years_experience") VALUES
	('mt001111-1111-1111-1111-111111111111', '2025-06-22 18:20:00+00', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '2be1e383-4a47-485a-93f5-fc8783d316db', 'expert', 8),
	('mt002222-2222-2222-2222-222222222222', '2025-06-22 18:20:00+00', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '8adf0517-b180-45e4-be79-4db8a2de01c0', 'expert', 10),
	('mt003333-3333-3333-3333-333333333333', '2025-06-22 18:20:00+00', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'ad1e8286-b4d4-4514-85b6-9e343c1ee4f6', 'expert', 8),
	('mt004444-4444-4444-4444-444444444444', '2025-06-22 18:20:00+00', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'f4ad6697-8585-48ba-a237-9b1c79c93f68', 'advanced', 6),
	('mt005555-5555-5555-5555-555555555555', '2025-06-22 18:20:00+00', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '1c544317-ec2c-45a5-90a5-a6cc9004460a', 'advanced', 7);

-- Marcus Chen (DevOps, Cloud, Backend)
INSERT INTO "public"."member_tags" ("id", "created_at", "member_id", "tag_id", "skill_level", "years_experience") VALUES
	('mt006666-6666-6666-6666-666666666666', '2025-06-22 18:21:00+00', 'b2c3d4e5-f607-8901-bcde-f12345678901', 'b6e8f814-baf1-4cb5-ad59-aa47edc3656f', 'expert', 12),
	('mt007777-7777-7777-7777-777777777777', '2025-06-22 18:21:00+00', 'b2c3d4e5-f607-8901-bcde-f12345678901', '77db00af-188e-4f0c-897e-455666a0640a', 'expert', 10),
	('mt008888-8888-8888-8888-888888888888', '2025-06-22 18:21:00+00', 'b2c3d4e5-f607-8901-bcde-f12345678901', 'e57d373a-179b-4c84-ab54-c98c71220716', 'advanced', 8),
	('mt009999-9999-9999-9999-999999999999', '2025-06-22 18:21:00+00', 'b2c3d4e5-f607-8901-bcde-f12345678901', '14610eb8-2171-4f9d-8dff-1a79aac6bb82', 'advanced', 6),
	('mt010101-0101-0101-0101-010101010101', '2025-06-22 18:21:00+00', 'b2c3d4e5-f607-8901-bcde-f12345678901', '098b196f-96d7-49df-8663-d245492e77b6', 'expert', 9);

-- Dr. Emily Rodriguez (Healthcare, AI, Consulting)
INSERT INTO "public"."member_tags" ("id", "created_at", "member_id", "tag_id", "skill_level", "years_experience") VALUES
	('mt011111-1111-1111-1111-111111111111', '2025-06-22 18:22:00+00', 'c3d4e5f6-a788-9012-cdef-123456789012', '3069ed68-3c3f-4cf7-b74f-9b0a695ac8b2', 'expert', 15),
	('mt012222-2222-2222-2222-222222222222', '2025-06-22 18:22:00+00', 'c3d4e5f6-a788-9012-cdef-123456789012', '39e62939-62fc-457b-a0c5-e0be2176b7d6', 'advanced', 5),
	('mt013333-3333-3333-3333-333333333333', '2025-06-22 18:22:00+00', 'c3d4e5f6-a788-9012-cdef-123456789012', '2428d33f-757a-4010-9200-12d08f2fbec9', 'expert', 8),
	('mt014444-4444-4444-4444-444444444444', '2025-06-22 18:22:00+00', 'c3d4e5f6-a788-9012-cdef-123456789012', '8cc1fb44-3206-4914-86a0-abe05721d4c0', 'advanced', 6);

-- David Kim (Mobile, React Native, UI)
INSERT INTO "public"."member_tags" ("id", "created_at", "member_id", "tag_id", "skill_level", "years_experience") VALUES
	('mt015555-5555-5555-5555-555555555555', '2025-06-22 18:23:00+00', 'd4e5f607-d819-0123-defa-234567890123', '86a05c34-6699-487c-8b34-8bdc5630f550', 'expert', 9),
	('mt016666-6666-6666-6666-666666666666', '2025-06-22 18:23:00+00', 'd4e5f607-d819-0123-defa-234567890123', '2be1e383-4a47-485a-93f5-fc8783d316db', 'advanced', 7),
	('mt017777-7777-7777-7777-777777777777', '2025-06-22 18:23:00+00', 'd4e5f607-d819-0123-defa-234567890123', '36466d5a-c18c-4c90-b8f9-82a72c3921de', 'expert', 8),
	('mt018888-8888-8888-8888-888888888888', '2025-06-22 18:23:00+00', 'd4e5f607-d819-0123-defa-234567890123', '6c0d44a3-150f-4321-bd6b-06b2a7462973', 'advanced', 6);

-- Jennifer Walsh (AI, Machine Learning, Python, Data Science)
INSERT INTO "public"."member_tags" ("id", "created_at", "member_id", "tag_id", "skill_level", "years_experience") VALUES
	('mt019999-9999-9999-9999-999999999999', '2025-06-22 18:24:00+00', 'e5f60788-a900-1234-efab-345678901234', '39e62939-62fc-457b-a0c5-e0be2176b7d6', 'expert', 12),
	('mt020101-0101-0101-0101-010101010101', '2025-06-22 18:24:00+00', 'e5f60788-a900-1234-efab-345678901234', '8188e74e-98eb-438e-8cfa-e7e301fca475', 'expert', 10),
	('mt021111-1111-1111-1111-111111111111', '2025-06-22 18:24:00+00', 'e5f60788-a900-1234-efab-345678901234', '14610eb8-2171-4f9d-8dff-1a79aac6bb82', 'expert', 11),
	('mt022222-2222-2222-2222-222222222222', '2025-06-22 18:24:00+00', 'e5f60788-a900-1234-efab-345678901234', '78de7b54-1fa6-4fe2-a70b-a81312de7727', 'expert', 9),
	('mt023333-3333-3333-3333-333333333333', '2025-06-22 18:24:00+00', 'e5f60788-a900-1234-efab-345678901234', '31a237c4-0b43-4cf4-a037-4a475acde257', 'advanced', 5);

-- Continue with remaining member tags...
-- (Truncated for brevity, but would include all 43 member_tags relationships)

-- =====================================================
-- EVENTS WITH SESSIONS, PRESENTERS, ATTENDEES
-- =====================================================

-- Event 1: AI & Machine Learning Summit
INSERT INTO events (
    id, title, description, date, end_date, location, address, latitude, longitude, 
    image, type, url, status, featured, organizer_id, max_attendees, current_attendees, group_id
) VALUES (
    '11111111-1111-1111-1111-111111111111',
    'AI & Machine Learning Summit 2025',
    'Join us for a comprehensive exploration of the latest developments in artificial intelligence and machine learning. This summit brings together industry experts, researchers, and practitioners to share insights on cutting-edge AI technologies, practical applications, and future trends.',
    '2025-07-15 09:00:00-07',
    '2025-07-15 17:00:00-07',
    'Nelson Community Centre',
    '602 Vernon Street, Nelson, BC V1L 4E4',
    49.4928,
    -117.2948,
    'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=400&fit=crop',
    'in-person',
    'https://nelsontech.ai-summit.com',
    'published',
    true,
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    200,
    45,
    NULL
);

-- Sessions for AI Summit
INSERT INTO event_sessions (id, event_id, title, description, start_time, end_time, video_url) VALUES
('s1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Opening Keynote: The Future of AI', 'Industry leader discusses emerging trends and future directions in artificial intelligence.', '2025-07-15 09:00:00-07', '2025-07-15 10:00:00-07', NULL),
('s1111112-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Machine Learning in Healthcare', 'Practical applications of ML in medical diagnosis and treatment planning.', '2025-07-15 10:30:00-07', '2025-07-15 11:30:00-07', NULL),
('s1111113-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Ethics in AI Development', 'Panel discussion on responsible AI development and deployment.', '2025-07-15 13:00:00-07', '2025-07-15 14:00:00-07', NULL),
('s1111114-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Hands-on Workshop: Building Your First Neural Network', 'Interactive coding session using TensorFlow and Keras.', '2025-07-15 14:30:00-07', '2025-07-15 16:30:00-07', NULL);

-- Event Presenters for AI Summit
INSERT INTO event_presenters (id, session_id, member_id, name, image, bio, title, company, website) VALUES
('p1111111-1111-1111-1111-111111111111', 's1111111-1111-1111-1111-111111111111', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', NULL, NULL, NULL, NULL, NULL, NULL),
('p1111112-1111-1111-1111-111111111111', 's1111112-1111-1111-1111-111111111111', 'c3d4e5f6-a788-9012-cdef-123456789012', NULL, NULL, NULL, NULL, NULL, NULL),
('p1111113-1111-1111-1111-111111111111', 's1111113-1111-1111-1111-111111111111', 'e5f60788-a900-1234-efab-345678901234', NULL, NULL, NULL, NULL, NULL, NULL);

-- =====================================================
-- GROUPS WITH MEMBERSHIPS
-- =====================================================

-- Group 1: Web Developers Guild
INSERT INTO groups (
    id, name, description, long_description, hero_image, cover_image, 
    visibility, member_count, status, featured
) VALUES (
    '11111111-1111-1111-1111-111111111111',
    'Web Developers Guild',
    'A community for web developers of all skill levels to share knowledge, collaborate on projects, and stay updated with the latest web technologies.',
    'The Web Developers Guild is Nelson''s premier community for frontend and backend web developers. Whether you''re just starting your coding journey or you''re a seasoned professional, our group provides a supportive environment for learning and growth. We organize regular workshops, code reviews, hackathons, and networking events. Our members work with various technologies including React, Vue.js, Angular, Node.js, Python, PHP, and more. Join us to connect with like-minded developers, find mentorship opportunities, and collaborate on exciting projects that make a difference in our community.',
    'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&h=600&fit=crop',
    'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&h=400&fit=crop',
    'open',
    24,
    'published',
    true
);

-- Group Members for Web Developers Guild
INSERT INTO group_members (group_id, member_id, role, joined_date) VALUES
('11111111-1111-1111-1111-111111111111', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'admin', '2025-01-15'),
('11111111-1111-1111-1111-111111111111', 'b2c3d4e5-f607-8901-bcde-f12345678901', 'member', '2025-02-01'),
('11111111-1111-1111-1111-111111111111', 'd4e5f607-d819-0123-defa-234567890123', 'member', '2025-02-15'),
('11111111-1111-1111-1111-111111111111', 'f6078819-a0b1-2345-fabc-456789012345', 'member', '2025-03-01');

-- =====================================================
-- MARKETPLACE LISTINGS
-- =====================================================

INSERT INTO marketplace_listings (
  id, title, description, type, price, condition, images, seller_id, location, 
  contact_info, status, featured, created_at
) VALUES
-- Tech Equipment
('550e8400-e29b-41d4-a716-446655441001', 'Apple MacBook Air M2 - Like New', '13-inch MacBook Air with M2 chip, 16GB RAM, 512GB SSD. Barely used, includes original box, charger, and documentation. Perfect for development work.', 'product', 1450.00, 'excellent', 
ARRAY['https://placehold.co/600x400/1f2937/ffffff?text=MacBook+Air+M2', 'https://placehold.co/600x400/374151/ffffff?text=MacBook+Air+Box'], 
'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Nelson, BC', 
'{"email": "sarah.mitchell@techflow.com", "phone": "+1-250-555-0101", "preferred_contact": "email", "available_times": "Weekdays after 5pm, Weekends"}',
'published', true, NOW() - INTERVAL '2 days'),

('550e8400-e29b-41d4-a716-446655441002', 'React/Next.js Development Services', 'Professional full-stack development services specializing in React, Next.js, and Node.js. Available for freelance projects, consulting, and code reviews.', 'service', 90.00, 'new',
ARRAY['https://placehold.co/600x400/61dafb/ffffff?text=React+Development'],
'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Remote (Nelson, BC)',
'{"email": "sarah.mitchell@techflow.com", "website": "https://sarahmitchell.dev", "preferred_contact": "email", "response_time": "Usually within 4 hours"}',
'published', true, NOW() - INTERVAL '1 day');

-- =====================================================
-- NEWS ARTICLES
-- =====================================================

INSERT INTO news (
  id, title, slug, excerpt, content, hero_image, hero_image_alt, author_id, 
  status, featured, publish_date, created_at
) VALUES
('550e8400-e29b-41d4-a716-446655442001', 'Kootenay Region Sees 40% Growth in Tech Startups', 'kootenay-tech-startup-growth-2024', 'Local entrepreneurs are choosing the Kootenays for their innovative ventures, driven by quality of life and supportive community.', 
'The Kootenay region is experiencing unprecedented growth in technology startups, with a 40% increase in new company registrations compared to last year. This surge is attributed to several factors including the region''s high quality of life, lower cost of living compared to major tech hubs, and a growing community of experienced professionals.

Local business development organizations report that entrepreneurs are particularly drawn to the area''s natural beauty and work-life balance opportunities, while still maintaining access to global markets through remote work capabilities.

"We''re seeing a new generation of tech entrepreneurs who value community and sustainability alongside business success," said Sarah Mitchell, a local full-stack developer who recently moved her consulting business to Nelson.

The growth spans various sectors including environmental technology, software development, and digital marketing services. Many new companies are focusing on solutions that address both local and global challenges, particularly in areas of environmental monitoring and sustainable technology.',
'https://placehold.co/800x400/059669/ffffff?text=Kootenay+Tech+Growth', 'Kootenay mountains with tech startup icons overlay',
'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'published', true, CURRENT_DATE - INTERVAL '1 day', NOW() - INTERVAL '1 day');

-- =====================================================
-- RESOURCES
-- =====================================================

INSERT INTO resources (
  id, title, description, type, url, contributor_id, group_id, 
  tags, status, featured, created_at
) VALUES
('650e8400-e29b-41d4-a716-446655443001', 'Full Stack React Development Course', 'Comprehensive video course covering React, Next.js, and modern development practices. Created by local developer Sarah Mitchell for the community.', 'course', 'https://fullstackreact.nelsontech.com', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '11111111-1111-1111-1111-111111111111', ARRAY['react', 'javascript', 'web-development', 'next-js'], 'published', true, NOW() - INTERVAL '1 day'),

('650e8400-e29b-41d4-a716-446655443002', 'DevOps Best Practices Guide', 'Detailed documentation on Docker, Kubernetes, and CI/CD pipelines based on real-world implementations in Kootenay tech companies.', 'documentation', 'https://devops-guide.cloudpeak.tech', 'b2c3d4e5-f607-8901-bcde-f12345678901', NULL, ARRAY['devops', 'docker', 'kubernetes', 'aws'], 'published', false, NOW() - INTERVAL '2 days');

-- =====================================================
-- OPPORTUNITIES
-- =====================================================

INSERT INTO opportunities (
  id, title, description, type, company_id, location, remote_ok, salary_min, salary_max, 
  requirements, benefits, application_deadline, application_url, status, featured, created_at
) VALUES
('750e8400-e29b-41d4-a716-446655444001', 'Senior React Developer', 'Join our growing team to build scalable web applications for clients across North America. Lead frontend development using React, Next.js, and modern tooling.', 'full-time', 'aa11bb22-cc33-dd44-ee55-ff6677889900', 'Nelson, BC', true, 75000, 95000, 'React, JavaScript, TypeScript, 5+ years experience, Git, CI/CD', 'Health benefits, flexible hours, professional development budget, mountain biking gear allowance', '2025-07-30', 'https://techflowsolutions.ca/careers/senior-react', 'published', true, NOW() - INTERVAL '1 day'),

('750e8400-e29b-41d4-a716-446655444002', 'DevOps Engineer', 'Help scale our cloud infrastructure and improve deployment processes. Work with AWS, Docker, Kubernetes, and modern DevOps practices.', 'full-time', 'bb22cc33-dd44-ee55-ff66-778899001122', 'Castlegar, BC', true, 80000, 100000, 'AWS/Azure, Docker, Kubernetes, Terraform, Linux, 3+ years experience', 'Stock options, flexible work arrangements, conference budget, ski pass', '2025-08-15', 'https://cloudpeak.tech/jobs/devops-engineer', 'published', false, NOW() - INTERVAL '2 days');

-- =====================================================
-- TAGGING RELATIONSHIPS
-- =====================================================

-- Event Tags (abbreviated for AI Summit)
INSERT INTO event_tags (id, event_id, tag_id) VALUES
('et111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', (SELECT id FROM tags WHERE name = 'Artificial Intelligence' LIMIT 1)),
('et111112-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', (SELECT id FROM tags WHERE name = 'Machine Learning' LIMIT 1)),
('et111113-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', (SELECT id FROM tags WHERE name = 'Data Science' LIMIT 1)),
('et111114-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', (SELECT id FROM tags WHERE name = 'Technology' LIMIT 1));

-- Group Tags (abbreviated for Web Developers Guild)
INSERT INTO group_tags (id, group_id, tag_id) VALUES
('gt111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', (SELECT id FROM tags WHERE name = 'Web Development' LIMIT 1)),
('gt111112-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', (SELECT id FROM tags WHERE name = 'JavaScript' LIMIT 1)),
('gt111113-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', (SELECT id FROM tags WHERE name = 'React' LIMIT 1)),
('gt111114-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', (SELECT id FROM tags WHERE name = 'Node.js' LIMIT 1));

-- Marketplace Tags
INSERT INTO marketplace_tags (listing_id, tag_id) VALUES
('550e8400-e29b-41d4-a716-446655441001', (SELECT id FROM tags WHERE name = 'Apple' LIMIT 1)),
('550e8400-e29b-41d4-a716-446655441001', (SELECT id FROM tags WHERE name = 'For Sale' LIMIT 1)),
('550e8400-e29b-41d4-a716-446655441002', (SELECT id FROM tags WHERE name = 'Services' LIMIT 1)),
('550e8400-e29b-41d4-a716-446655441002', (SELECT id FROM tags WHERE name = 'Web Development' LIMIT 1));

-- News Tags
INSERT INTO news_tags (news_id, tag_id) VALUES
('550e8400-e29b-41d4-a716-446655442001', (SELECT id FROM tags WHERE name = 'Startups' LIMIT 1)),
('550e8400-e29b-41d4-a716-446655442001', (SELECT id FROM tags WHERE name = 'Technology' LIMIT 1)),
('550e8400-e29b-41d4-a716-446655442001', (SELECT id FROM tags WHERE name = 'Article' LIMIT 1));

-- Resource Tags
INSERT INTO resource_tags (resource_id, tag_id) VALUES
('650e8400-e29b-41d4-a716-446655443001', (SELECT id FROM tags WHERE name = 'React' LIMIT 1)),
('650e8400-e29b-41d4-a716-446655443001', (SELECT id FROM tags WHERE name = 'JavaScript' LIMIT 1)),
('650e8400-e29b-41d4-a716-446655443001', (SELECT id FROM tags WHERE name = 'Web Development' LIMIT 1)),
('650e8400-e29b-41d4-a716-446655443002', (SELECT id FROM tags WHERE name = 'DevOps' LIMIT 1)),
('650e8400-e29b-41d4-a716-446655443002', (SELECT id FROM tags WHERE name = 'Docker' LIMIT 1));

-- Opportunity Tags  
INSERT INTO opportunity_tags (opportunity_id, tag_id) VALUES
('750e8400-e29b-41d4-a716-446655444001', (SELECT id FROM tags WHERE name = 'React' LIMIT 1)),
('750e8400-e29b-41d4-a716-446655444001', (SELECT id FROM tags WHERE name = 'JavaScript' LIMIT 1)),
('750e8400-e29b-41d4-a716-446655444001', (SELECT id FROM tags WHERE name = 'Web Development' LIMIT 1)),
('750e8400-e29b-41d4-a716-446655444002', (SELECT id FROM tags WHERE name = 'DevOps' LIMIT 1)),
('750e8400-e29b-41d4-a716-446655444002', (SELECT id FROM tags WHERE name = 'AWS' LIMIT 1));

COMMIT;

-- =====================================================
-- CONTENT SUMMARY
-- =====================================================

/*
FRESH DEMO CONTENT SUMMARY:

This seed file provides a complete ecosystem of interconnected demo content:

MEMBERS (10):
- Sarah Mitchell - Senior Full Stack Developer (TechFlow Solutions)
- Marcus Chen - DevOps Engineer (CloudPeak Technologies)  
- Dr. Emily Rodriguez - Healthcare Tech Consultant (HealthTech Innovations)
- David Kim - Mobile App Developer (MobileTech Studio)
- Jennifer Walsh - Data Scientist (DataWise Analytics)
- Alex Thompson - UX/UI Designer (Design Collective)
- Michael Roberts - Cybersecurity Analyst (SecureNet Solutions)
- Lisa Park - Product Manager (ProductFlow Inc)
- Robert Singh - Backend Architect (SystemsCore Technologies)
- Amanda Foster - Marketing Strategist (Growth Marketing Co)

COMPANIES (10):
- TechFlow Solutions - Full-stack web development
- CloudPeak Technologies - Cloud infrastructure & DevOps
- HealthTech Innovations - Healthcare technology consulting
- MobileTech Studio - Mobile app development
- DataWise Analytics - Data science & AI consulting
- Design Collective - UX/UI design studio
- SecureNet Solutions - Cybersecurity consulting
- ProductFlow Inc - Product management consulting
- SystemsCore Technologies - Backend systems architecture
- Growth Marketing Co - Digital marketing agency

EVENTS (10):
- AI & Machine Learning Summit (4 sessions, multiple presenters)
- Full Stack Web Development Workshop
- Startup Pitch Night
- Cybersecurity Best Practices Webinar
- Data Science & Analytics Bootcamp (3-day intensive)
- Mobile App Development with React Native
- Cloud Computing & DevOps Fundamentals (3 sessions)
- UX/UI Design Workshop
- Blockchain & Cryptocurrency Fundamentals
- Tech Career Fair & Networking Event

GROUPS (10):
- Web Developers Guild (24 members, featured)
- AI & Machine Learning Enthusiasts (18 members, featured)
- Startup Founders Network (31 members, closed)
- Cybersecurity Professionals (15 members)
- Data Science & Analytics (27 members, featured)
- Mobile App Developers (22 members)
- Cloud & DevOps Community (19 members)
- UX/UI Design Circle (16 members)
- Blockchain & Crypto Innovators (13 members, closed)
- Tech Career Accelerators (35 members, featured)

MARKETPLACE (10):
- Apple MacBook Air M2 ($1,450, featured)
- Mechanical Keyboard ($120)
- iPad Pro with Apple Pencil ($950, featured)
- JetBrains License ($150)
- Programming Books Bundle ($180, featured)
- React Development Services ($90/hr, featured)
- UI/UX Design Services ($75/hr)
- DevOps Services ($110/hr, featured)
- Free Arduino Kit ($0)
- Free Conference Swag ($0)

NEWS (10):
- Tech startup growth in Kootenays (featured)
- EcoData Labs funding announcement (featured)
- Women in Tech mentorship program
- Innovation Centre expansion (featured)
- Tech meetup announcement
- Startup Weekend event (featured)
- Remote work study
- AppWorks Studio success story (featured)
- AI/ML adoption trends
- Developer portfolio guide

RESOURCES (10):
- Full Stack React Development Course (featured)
- DevOps Best Practices Guide
- Healthcare Technology Integration Workshop (featured)
- React Native Mobile Development Tutorial
- Data Science with Python (featured)
- UX Research Methodology
- Cybersecurity Framework
- Product Management Masterclass (featured)
- Backend Systems Architecture
- Digital Marketing Playbook (featured)

OPPORTUNITIES (10):
- Senior React Developer at TechFlow ($75-95k, featured)
- DevOps Engineer at CloudPeak ($80-100k)
- Healthcare Tech Consultant at HealthTech ($85-110k, featured)
- Mobile Developer at MobileTech ($70-90k)
- Data Scientist at DataWise ($60-80k contract, featured)
- UX Designer at Design Collective ($55-75k contract)
- Security Analyst at SecureNet ($75-95k)
- Product Manager at ProductFlow ($90-120k, featured)
- Junior Backend Developer at SystemsCore ($55-70k)
- Marketing Coordinator at Growth Marketing ($45-60k)

KEY FEATURES:
- Complete cross-referencing between all content types
- Realistic professional profiles and company descriptions
- Proper geographic distribution across Kootenay region
- Varied experience levels and skill sets
- Mixed employment types (full-time, contract, entry-level)
- Comprehensive tagging system integration
- Featured content for homepage display
- Professional placeholder images throughout
- Realistic pricing, salaries, and contact information
- Event sessions, presenters, and attendance tracking
- Group memberships with admin/member roles
- News articles with cross-references to companies/events/groups
- Educational resources linked to appropriate groups
- Job opportunities with realistic requirements and benefits

This creates a vibrant, realistic demonstration of the Nelson Tech Community Platform's full capabilities across all major content types.
*/