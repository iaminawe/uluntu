-- =====================================================
-- FRESH DEMO CONTENT SEED FOR NELSON TECH COMMUNITY PLATFORM
-- BASIC VERSION - Core content without complex relationships
-- =====================================================

BEGIN;

-- Set timezone for consistent timestamps
SET TIME ZONE 'America/Vancouver';

-- =====================================================
-- MEMBERS (10 diverse tech professionals)
-- =====================================================

INSERT INTO "public"."members" ("id", "created_at", "name", "title", "bio", "location", "image", "website", "employment_status", "open_to_volunteering", "arrived_in_nelson", "user_id", "status", "featured", "social", "company") VALUES
	('a1b2c3d4-e5f6-7890-abcd-ef1234567890', '2025-06-22 18:00:00+00', 'Sarah Mitchell', 'Senior Full Stack Developer', 'Passionate about building scalable web applications with React and Node.js. Previously worked at tech companies in Vancouver before moving to Nelson for the mountain lifestyle. Love mentoring junior developers and contributing to open source projects.', 'Nelson, BC', 'https://images.unsplash.com/photo-1494790108755-2616b612b743?w=400', 'https://sarahmitchell.dev', 'employed', true, '2022-03-15', NULL, 'published', true, '{"linkedin": "https://linkedin.com/in/sarahmitchelldev", "github": "https://github.com/sarahmitchell", "twitter": "https://twitter.com/sarahcodes"}', 'TechFlow Solutions'),
	('d0519096-9dd8-4397-b0bd-3dbb8cebdb39', '2025-06-22 18:01:00+00', 'Marcus Chen', 'DevOps Engineer', 'Cloud infrastructure specialist with expertise in AWS, Docker, and Kubernetes. Moved to the Kootenays from Toronto to enjoy outdoor adventures while building robust deployment pipelines. Always excited to share knowledge about cloud technologies.', 'Castlegar, BC', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400', 'https://marcuschen.tech', 'employed', true, '2021-08-22', NULL, 'published', false, '{"linkedin": "https://linkedin.com/in/marcuschen-devops", "github": "https://github.com/marcuschen"}', 'CloudPeak Technologies'),
	('a75a33d8-aa13-42a9-a246-3a5c8e5c838f', '2025-06-22 18:02:00+00', 'Dr. Emily Rodriguez', 'Healthcare Technology Consultant', 'Bridging the gap between healthcare and technology. Former emergency physician who transitioned to health tech consulting. Specializes in telemedicine platforms and healthcare data analytics. Relocated to Nelson to balance work with outdoor recreation.', 'Nelson, BC', 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400', 'https://dremilyrodriguez.com', 'self-employed', true, '2023-01-10', NULL, 'published', true, '{"linkedin": "https://linkedin.com/in/dr-emily-rodriguez", "website": "https://healthtechconsulting.ca"}', 'HealthTech Innovations'),
	('8fa10942-4a64-4911-a45d-eb4996002302', '2025-06-22 18:03:00+00', 'David Kim', 'Mobile App Developer', 'iOS and Android developer with a passion for creating intuitive user experiences. Specializes in React Native and Flutter development. Former Samsung engineer who fell in love with BC mountains during a hiking trip and decided to stay.', 'Kaslo, BC', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400', 'https://davidkim.dev', 'employed', false, '2022-09-05', NULL, 'published', false, '{"linkedin": "https://linkedin.com/in/davidkim-mobile", "github": "https://github.com/davidkimdev", "portfolio": "https://davidkim.dev"}', 'MobileTech Studio'),
	('b62e36e4-11a4-4567-979e-3f3ebbc9232d', '2025-06-22 18:04:00+00', 'Jennifer Walsh', 'Data Scientist & AI Researcher', 'Machine learning engineer focused on environmental data analysis and predictive modeling. PhD in Computer Science from UBC. Moved to Nelson to work on sustainability projects while enjoying the natural beauty of the region.', 'Nelson, BC', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400', 'https://jennwalsh.ai', 'employed', true, '2023-05-18', NULL, 'published', true, '{"linkedin": "https://linkedin.com/in/jennifer-walsh-ai", "github": "https://github.com/jennwalsh", "scholar": "https://scholar.google.com/citations?user=jennwalsh"}', 'DataWise Analytics'),
	('7131f030-4431-4dbf-816b-9cb4ebd2d54d', '2025-06-22 18:05:00+00', 'Alex Thompson', 'UX/UI Designer', 'Creative designer passionate about user-centered design and accessibility. Specializes in designing for SaaS applications and mobile interfaces. Former design lead at Shopify who moved to Nelson for a better work-life balance and mountain biking opportunities.', 'Nelson, BC', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400', 'https://alexthompsondesign.com', 'self-employed', true, '2022-11-30', NULL, 'published', false, '{"linkedin": "https://linkedin.com/in/alexthompson-ux", "dribbble": "https://dribbble.com/alexthompson", "behance": "https://behance.net/alexthompson"}', 'Design Collective'),
	('857a4b0b-961f-4c36-96db-5ced07c11232', '2025-06-22 18:06:00+00', 'Michael Roberts', 'Cybersecurity Analyst', 'Information security professional with expertise in threat detection and vulnerability assessment. CISSP certified with 12 years experience in financial services security. Moved to the Kootenays to escape city stress while maintaining remote security consulting work.', 'Trail, BC', 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400', 'https://michaelroberts-security.com', 'employed', false, '2021-04-12', NULL, 'published', false, '{"linkedin": "https://linkedin.com/in/michael-roberts-cissp"}', 'SecureNet Solutions'),
	('1918195d-3aab-4a48-9999-f17e2a4f2ef9', '2025-06-22 18:07:00+00', 'Lisa Park', 'Product Manager', 'Strategic product manager with experience scaling B2B SaaS products from startup to enterprise. Former Slack product manager who specializes in user onboarding and feature adoption. Chose Nelson for the community feel and outdoor lifestyle.', 'Nelson, BC', 'https://images.unsplash.com/photo-1594736797933-d0dc2e715114?w=400', 'https://lisapark.pm', 'employed', true, '2023-02-28', NULL, 'published', true, '{"linkedin": "https://linkedin.com/in/lisa-park-pm", "twitter": "https://twitter.com/lisaparkpm", "medium": "https://medium.com/@lisapark"}', 'ProductFlow Inc'),
	('f06db137-c993-4ab9-8d36-d94fe284bca9', '2025-06-22 18:08:00+00', 'Robert Singh', 'Backend Systems Architect', 'Senior software architect specializing in distributed systems and microservices. Python and Go expert with extensive experience in financial technology. Former CTO of a Vancouver fintech startup, now working remotely from the Kootenays.', 'Rossland, BC', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400', 'https://robertsingh.dev', 'employed', false, '2022-07-14', NULL, 'published', false, '{"linkedin": "https://linkedin.com/in/robert-singh-architect", "github": "https://github.com/robertsingh"}', 'SystemsCore Technologies'),
	('4c6aca02-ccd6-46b6-ae8f-3969e32cb873', '2025-06-22 18:09:00+00', 'Amanda Foster', 'Digital Marketing Strategist', 'Growth marketing specialist focused on B2B SaaS companies. Expert in content marketing, SEO, and marketing automation. Formerly with HubSpot, now helping local businesses and remote companies build their digital presence from beautiful Nelson.', 'Nelson, BC', 'https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=400', 'https://amandafoster.marketing', 'self-employed', true, '2023-06-20', NULL, 'published', false, '{"linkedin": "https://linkedin.com/in/amanda-foster-marketing", "twitter": "https://twitter.com/amandamarketing", "instagram": "https://instagram.com/amandamarkets"}', 'Growth Marketing Co');

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
	('bb22cc33-dd44-ee55-ff66-778899001122', 'd0519096-9dd8-4397-b0bd-3dbb8cebdb39', 'DevOps Engineer', '2021-09-15'),
	('cc33dd44-ee55-ff66-7788-99001122aabb', 'a75a33d8-aa13-42a9-a246-3a5c8e5c838f', 'Founder & CEO', '2022-01-01'),
	('dd44ee55-ff66-7788-9900-1122aabbccdd', '8fa10942-4a64-4911-a45d-eb4996002302', 'Lead Mobile Developer', '2022-10-01'),
	('ee55ff66-7788-9900-1122-aabbccddeeff', 'b62e36e4-11a4-4567-979e-3f3ebbc9232d', 'Principal Data Scientist', '2023-06-01'),
	('ff667788-9900-1122-aabb-ccddeeff0011', '7131f030-4431-4dbf-816b-9cb4ebd2d54d', 'Creative Director', '2022-12-15'),
	('77889900-1122-aabb-ccdd-eeff001122aa', '857a4b0b-961f-4c36-96db-5ced07c11232', 'Senior Security Analyst', '2021-05-01'),
	('88990011-22aa-bbcc-ddee-ff001122aabb', '1918195d-3aab-4a48-9999-f17e2a4f2ef9', 'Head of Product', '2023-03-15'),
	('99001122-aabb-ccdd-eeff-001122aabbcc', 'f06db137-c993-4ab9-8d36-d94fe284bca9', 'Principal Architect', '2022-08-01'),
	('00112233-aabb-ccdd-eeff-001122aabbcc', '4c6aca02-ccd6-46b6-ae8f-3969e32cb873', 'Founder & Marketing Director', '2022-07-01');

-- =====================================================
-- EVENTS (3 diverse examples)
-- =====================================================

INSERT INTO events (
    id, title, description, date, end_date, location, address, latitude, longitude, 
    image, type, url, status, featured, organizer_id, max_attendees, current_attendees
) VALUES 
(
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
    45
),
(
    '22222222-2222-2222-2222-222222222222',
    'Full Stack Web Development Workshop',
    'A hands-on workshop covering modern web development from frontend to backend. Learn React, Node.js, Express, and database integration. Perfect for beginners and intermediate developers looking to expand their skill set.',
    '2025-07-22 10:00:00-07',
    '2025-07-22 16:00:00-07',
    'Selkirk College - Silver King Campus',
    '301 Frank Beinder Way, Castlegar, BC V1N 4L3',
    49.3328,
    -117.6664,
    'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=400&fit=crop',
    'in-person',
    'https://workshop.nelsontech.com/fullstack',
    'published',
    false,
    'd0519096-9dd8-4397-b0bd-3dbb8cebdb39',
    50,
    28
),
(
    '33333333-3333-3333-3333-333333333333',
    'Startup Pitch Night - Q3 2025',
    'Local entrepreneurs present their innovative startups to investors, mentors, and the community. Network with fellow entrepreneurs and learn about the exciting startups emerging from the Kootenays region.',
    '2025-07-29 18:30:00-07',
    '2025-07-29 21:00:00-07',
    'Hume Hotel & Spa',
    '422 Vernon Street, Nelson, BC V1L 4E6',
    49.4941,
    -117.2929,
    'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&h=400&fit=crop',
    'in-person',
    'https://pitchnight.nelsontech.com',
    'published',
    true,
    '1918195d-3aab-4a48-9999-f17e2a4f2ef9',
    80,
    0
);

-- =====================================================
-- GROUPS (3 examples)
-- =====================================================

INSERT INTO groups (
    id, name, description, long_description, hero_image, cover_image, 
    visibility, member_count, status, featured
) VALUES 
(
    '11111111-1111-1111-1111-111111111111',
    'Web Developers Guild',
    'A community for web developers of all skill levels to share knowledge, collaborate on projects, and stay updated with the latest web technologies.',
    'The Web Developers Guild is Nelson''s premier community for frontend and backend web developers. Whether you''re just starting your coding journey or you''re a seasoned professional, our group provides a supportive environment for learning and growth.',
    'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&h=600&fit=crop',
    'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&h=400&fit=crop',
    'open',
    24,
    'published',
    true
),
(
    '22222222-2222-2222-2222-222222222222',
    'AI & Machine Learning Enthusiasts',
    'Exploring the frontiers of artificial intelligence and machine learning through discussions, projects, and research collaborations.',
    'Our AI & Machine Learning Enthusiasts group brings together researchers, practitioners, and curious minds interested in the rapidly evolving field of artificial intelligence.',
    'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1200&h=600&fit=crop',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&h=400&fit=crop',
    'open',
    18,
    'published',
    true
),
(
    '33333333-3333-3333-3333-333333333333',
    'Startup Founders Network',
    'A supportive community for entrepreneurs building innovative startups, sharing experiences, and creating valuable connections.',
    'The Startup Founders Network is where entrepreneurial dreams meet practical support. Our community consists of early-stage founders, experienced entrepreneurs, and startup enthusiasts.',
    'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1200&h=600&fit=crop',
    'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=1200&h=400&fit=crop',
    'closed',
    31,
    'published',
    false
);

-- Group Members
INSERT INTO group_members (group_id, member_id, role, joined_date) VALUES
('11111111-1111-1111-1111-111111111111', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'admin', '2025-01-15'),
('11111111-1111-1111-1111-111111111111', 'd0519096-9dd8-4397-b0bd-3dbb8cebdb39', 'member', '2025-02-01'),
('22222222-2222-2222-2222-222222222222', 'b62e36e4-11a4-4567-979e-3f3ebbc9232d', 'admin', '2025-01-20'),
('22222222-2222-2222-2222-222222222222', 'a75a33d8-aa13-42a9-a246-3a5c8e5c838f', 'member', '2025-02-05'),
('33333333-3333-3333-3333-333333333333', '1918195d-3aab-4a48-9999-f17e2a4f2ef9', 'admin', '2025-01-10'),
('33333333-3333-3333-3333-333333333333', '4c6aca02-ccd6-46b6-ae8f-3969e32cb873', 'member', '2025-01-25');

-- =====================================================
-- MARKETPLACE LISTINGS (3 examples)
-- =====================================================

INSERT INTO marketplace_listings (
  id, title, description, type, price, condition, images, seller_id, location, 
  contact_info, status, featured, created_at
) VALUES
('550e8400-e29b-41d4-a716-446655441001', 
 'Apple MacBook Air M2 - Like New', 
 '13-inch MacBook Air with M2 chip, 16GB RAM, 512GB SSD. Barely used, includes original box, charger, and documentation.', 
 'product', 1450.00, 'excellent', 
 ARRAY['https://placehold.co/600x400/1f2937/ffffff?text=MacBook+Air+M2'], 
 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Nelson, BC', 
 '{"email": "sarah.mitchell@techflow.com", "phone": "+1-250-555-0101", "preferred_contact": "email"}',
 'published', true, NOW() - INTERVAL '2 days'),

('550e8400-e29b-41d4-a716-446655441002', 
 'React/Next.js Development Services', 
 'Professional full-stack development services specializing in React, Next.js, and Node.js.', 
 'service', 90.00, 'new',
 ARRAY['https://placehold.co/600x400/61dafb/ffffff?text=React+Development'],
 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Remote (Nelson, BC)',
 '{"email": "sarah.mitchell@techflow.com", "website": "https://sarahmitchell.dev", "preferred_contact": "email"}',
 'published', true, NOW() - INTERVAL '1 day'),

('550e8400-e29b-41d4-a716-446655441003', 
 'UI/UX Design & Figma Consulting', 
 'Professional design services for web and mobile apps. Specializing in user research, wireframing, prototyping, and design systems.', 
 'service', 75.00, 'new',
 ARRAY['https://placehold.co/600x400/f24e1e/ffffff?text=UI+UX+Design'],
 '7131f030-4431-4dbf-816b-9cb4ebd2d54d', 'Remote (Nelson, BC)',
 '{"email": "alex@designcollective.ca", "portfolio": "https://alexthompson.design", "preferred_contact": "email"}',
 'published', false, NOW() - INTERVAL '3 days');

-- =====================================================
-- NEWS ARTICLES (3 examples)
-- =====================================================

INSERT INTO news (
  id, title, slug, excerpt, content, hero_image, hero_image_alt, author_id, 
  status, featured, publish_date, created_at
) VALUES
('550e8400-e29b-41d4-a716-446655442001', 
 'Kootenay Region Sees 40% Growth in Tech Startups', 
 'kootenay-tech-startup-growth-2024', 
 'Local entrepreneurs are choosing the Kootenays for their innovative ventures, driven by quality of life and supportive community.',
 'The Kootenay region is experiencing unprecedented growth in technology startups, with a 40% increase in new company registrations compared to last year. This surge is attributed to several factors including the region''s high quality of life, lower cost of living compared to major tech hubs, and a growing community of experienced professionals.',
 'https://placehold.co/800x400/059669/ffffff?text=Kootenay+Tech+Growth', 
 'Kootenay mountains with tech startup icons overlay',
 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 
 'published', true, CURRENT_DATE - INTERVAL '1 day', NOW() - INTERVAL '1 day'),

('550e8400-e29b-41d4-a716-446655442002', 
 'DataWise Analytics Receives Environmental Innovation Award', 
 'datawise-environmental-innovation-award', 
 'Nelson-based data science company recognized for contributions to environmental monitoring and sustainability.',
 'DataWise Analytics has been awarded the BC Environmental Innovation Award for their groundbreaking work in environmental data analysis. The company''s AI-powered platform helps organizations monitor and reduce their environmental impact through real-time data insights.',
 'https://placehold.co/800x400/10b981/ffffff?text=Environmental+Award', 
 'DataWise team receiving award',
 'b62e36e4-11a4-4567-979e-3f3ebbc9232d', 
 'published', true, CURRENT_DATE - INTERVAL '3 days', NOW() - INTERVAL '3 days'),

('550e8400-e29b-41d4-a716-446655442003', 
 'Women in Tech Kootenays Launches Mentorship Program', 
 'women-tech-mentorship-launch', 
 'New initiative pairs experienced tech professionals with newcomers to foster career development.',
 'Women in Tech Kootenays has announced the launch of their comprehensive mentorship program, designed to support women entering or advancing in technology careers throughout the region. The program pairs experienced professionals with mentees at various career stages.',
 'https://placehold.co/800x400/ec4899/ffffff?text=Women+in+Tech', 
 'Group of women tech professionals collaborating',
 '1918195d-3aab-4a48-9999-f17e2a4f2ef9', 
 'published', false, CURRENT_DATE - INTERVAL '2 days', NOW() - INTERVAL '2 days');

-- =====================================================
-- RESOURCES (3 examples)
-- =====================================================

INSERT INTO resources (
  id, title, description, type, url, contributor_id, group_id, 
  tags, status, featured, created_at
) VALUES
('650e8400-e29b-41d4-a716-446655443001', 
 'Full Stack React Development Course', 
 'Comprehensive video course covering React, Next.js, and modern development practices.',
 'course', 
 'https://fullstackreact.nelsontech.com', 
 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 
 '11111111-1111-1111-1111-111111111111', 
 ARRAY['react', 'javascript', 'web-development'], 
 'published', true, NOW() - INTERVAL '1 day'),

('650e8400-e29b-41d4-a716-446655443002', 
 'DevOps Best Practices Guide', 
 'Detailed documentation on Docker, Kubernetes, and CI/CD pipelines.',
 'documentation', 
 'https://devops-guide.cloudpeak.tech', 
 'd0519096-9dd8-4397-b0bd-3dbb8cebdb39', 
 NULL, 
 ARRAY['devops', 'docker', 'kubernetes'], 
 'published', false, NOW() - INTERVAL '2 days'),

('650e8400-e29b-41d4-a716-446655443003', 
 'Data Science with Python - Environmental Applications', 
 'Interactive course focusing on using Python for environmental data analysis.',
 'course', 
 'https://datascience-env.datawise.com', 
 'b62e36e4-11a4-4567-979e-3f3ebbc9232d', 
 '22222222-2222-2222-2222-222222222222', 
 ARRAY['python', 'data-science', 'environment'], 
 'published', true, NOW() - INTERVAL '3 days');

-- =====================================================
-- OPPORTUNITIES (3 examples)
-- =====================================================

INSERT INTO opportunities (
  id, title, description, type, company_id, location, remote_ok, salary_min, salary_max, 
  requirements, benefits, application_deadline, application_url, status, featured, created_at
) VALUES
('750e8400-e29b-41d4-a716-446655444001', 
 'Senior React Developer', 
 'Join our growing team to build scalable web applications for clients across North America.',
 'full-time', 
 'aa11bb22-cc33-dd44-ee55-ff6677889900', 
 'Nelson, BC', 
 true, 
 75000, 
 95000,
 'React, JavaScript, TypeScript, 5+ years experience',
 'Health benefits, flexible hours, professional development budget',
 '2025-07-30', 
 'https://techflowsolutions.ca/careers/senior-react',
 'published', 
 true, 
 NOW() - INTERVAL '1 day'),

('750e8400-e29b-41d4-a716-446655444002', 
 'DevOps Engineer', 
 'Help scale our cloud infrastructure and improve deployment processes.',
 'full-time', 
 'bb22cc33-dd44-ee55-ff66-778899001122', 
 'Castlegar, BC', 
 true, 
 80000, 
 100000,
 'AWS/Azure, Docker, Kubernetes, Terraform, 3+ years experience',
 'Stock options, flexible work arrangements, conference budget',
 '2025-08-15', 
 'https://cloudpeak.tech/jobs/devops-engineer',
 'published', 
 false, 
 NOW() - INTERVAL '2 days'),

('750e8400-e29b-41d4-a716-446655444003', 
 'Product Manager - B2B SaaS', 
 'Drive product strategy and development for growing SaaS platform.',
 'full-time', 
 '88990011-22aa-bbcc-ddee-ff001122aabb', 
 'Nelson, BC', 
 true, 
 90000, 
 120000,
 'B2B SaaS experience, Agile/Scrum, 4+ years PM experience',
 'Equity participation, product influence, leadership development',
 '2025-08-12', 
 'https://productflow.ca/careers/product-manager',
 'published', 
 true, 
 NOW() - INTERVAL '3 days');

COMMIT;

-- =====================================================
-- SUMMARY
-- =====================================================
-- This creates essential demo content:
-- - 10 Members with realistic profiles
-- - 10 Companies across various sectors
-- - 3 Events demonstrating different types
-- - 3 Groups with membership relationships
-- - 3 Marketplace listings (products and services)
-- - 3 News articles with varied topics
-- - 3 Educational resources
-- - 3 Job opportunities
-- 
-- All using valid UUIDs and proper data formats
-- without complex tag relationships that require
-- additional UUID generation.
-- =====================================================