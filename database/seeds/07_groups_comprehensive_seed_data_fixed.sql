-- =====================================================
-- COMPREHENSIVE GROUPS SEED DATA FOR NELSON TECH COMMUNITY PLATFORM
-- Creates diverse groups with members, events, resources, and galleries
-- =====================================================

BEGIN;

-- Set timezone for consistent timestamps
SET TIME ZONE 'America/Vancouver';

-- =====================================================
-- GROUPS (10 diverse groups)
-- =====================================================

INSERT INTO "public"."groups" ("id", "name", "description", "long_description", "hero_image", "cover_image", "visibility", "member_count", "status", "featured", "created_at") VALUES
	-- Technical Groups
	('a1111111-1111-1111-1111-111111111111', 'Nelson React Developers', 'A community of React developers in Nelson and the Kootenays sharing knowledge, best practices, and building awesome web applications together.', 'We are a passionate group of React developers based in the beautiful Kootenay region. Our group focuses on modern web development with React, Redux, TypeScript, and related technologies. We meet monthly to share knowledge, discuss new features, and help each other solve challenging problems. Whether you''re a seasoned developer or just starting with React, you''ll find a welcoming community here. Join us for code reviews, hackathons, and tech talks!', 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=1200&h=600&fit=crop&q=80', 'https://images.unsplash.com/photo-1555099962-4199c345e5dd?w=1600&h=400&fit=crop&q=80', 'open', 0, 'published', true, '2025-01-15 10:30:00+00'),
	
	('a2222222-2222-2222-2222-222222222222', 'Kootenay AI & Machine Learning', 'Exploring artificial intelligence and machine learning applications in our mountain community. From environmental monitoring to business intelligence.', 'The Kootenay AI & ML group brings together data scientists, engineers, and enthusiasts interested in artificial intelligence and machine learning. We explore practical applications of AI/ML in various domains including environmental science, healthcare, business analytics, and more. Our meetings feature hands-on workshops, paper discussions, and project showcases. We believe in democratizing AI knowledge and making it accessible to everyone in our region.', 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&h=600&fit=crop&q=80', 'https://images.unsplash.com/photo-1555255707-c07966088b7b?w=1600&h=400&fit=crop&q=80', 'open', 0, 'published', true, '2025-02-20 14:45:00+00'),
	
	('a3333333-3333-3333-3333-333333333333', 'Women in Tech Kootenays', 'Empowering women in technology through mentorship, networking, and skill development. Creating an inclusive tech community for all.', 'Women in Tech Kootenays is dedicated to supporting and advancing women in technology careers throughout our region. We provide a safe, inclusive space for learning, networking, and professional growth. Our programs include mentorship matching, technical workshops, career development sessions, and social events. We welcome women at all stages of their tech journey, from students to seasoned professionals. Together, we''re building a more diverse and inclusive tech ecosystem in the Kootenays.', 'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=1200&h=600&fit=crop&q=80', 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1600&h=400&fit=crop&q=80', 'open', 0, 'published', true, '2025-01-10 09:15:00+00'),
	
	-- Business & Entrepreneurship Groups
	('a4444444-4444-4444-4444-444444444444', 'Startup Founders Network', 'Connect with fellow entrepreneurs, share experiences, and grow your startup in the Kootenay tech ecosystem.', 'The Startup Founders Network is the premier community for entrepreneurs and startup founders in the Kootenay region. We understand the unique challenges of building a tech company in a smaller market and provide the support system you need to succeed. Our monthly meetups feature founder stories, investor pitch practice, and practical workshops on topics like fundraising, product-market fit, and scaling. Join us to connect with co-founders, advisors, and potential investors who understand the startup journey.', 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=1200&h=600&fit=crop&q=80', 'https://images.unsplash.com/photo-1556761175-4b46a572b786?w=1600&h=400&fit=crop&q=80', 'open', 0, 'published', false, '2025-03-05 16:20:00+00'),
	
	('a5555555-5555-5555-5555-555555555555', 'Digital Marketing Professionals', 'Master the art of digital marketing in the tech world. SEO, content marketing, social media, and growth hacking strategies.', 'The Digital Marketing Professionals group brings together marketers, content creators, and growth hackers working in or with tech companies. We explore the latest trends in digital marketing, share successful campaigns, and workshop challenging marketing problems together. Topics include SEO/SEM, content strategy, social media marketing, email automation, analytics, and conversion optimization. Perfect for marketing professionals looking to level up their skills and network with peers.', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=600&fit=crop&q=80', 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=1600&h=400&fit=crop&q=80', 'closed', 0, 'published', false, '2025-02-28 11:30:00+00'),
	
	-- Specialized Tech Groups
	('a6666666-6666-6666-6666-666666666666', 'Blockchain & Web3 Innovators', 'Exploring decentralized technologies, cryptocurrencies, and Web3 applications. Building the future of the internet together.', 'The Blockchain & Web3 Innovators group is at the forefront of decentralized technology exploration in the Kootenays. We dive deep into blockchain development, smart contracts, DeFi protocols, NFTs, and the broader Web3 ecosystem. Our sessions include technical workshops on Solidity, Web3.js, and blockchain architecture, as well as discussions on the societal implications of decentralization. Whether you''re a blockchain developer or crypto-curious, join us to explore this transformative technology.', 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=1200&h=600&fit=crop&q=80', 'https://images.unsplash.com/photo-1639762681057-eefb5a67f1b5?w=1600&h=400&fit=crop&q=80', 'open', 0, 'published', false, '2025-04-01 13:45:00+00'),
	
	('a7777777-7777-7777-7777-777777777777', 'Game Developers Guild', 'Unity, Unreal, indie games, and everything in between. Building amazing gaming experiences from the mountains.', 'The Game Developers Guild is home to game developers, designers, and enthusiasts in the Kootenay region. We cover all aspects of game development from programming and art to game design and audio. Our members work with various engines including Unity, Unreal, Godot, and custom frameworks. Monthly game jams, playtesting sessions, and knowledge-sharing workshops help our members create better games. Join us to turn your game ideas into reality!', 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=1200&h=600&fit=crop&q=80', 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=1600&h=400&fit=crop&q=80', 'open', 0, 'published', false, '2025-03-15 15:00:00+00'),
	
	-- Community & Social Impact Groups
	('a8888888-8888-8888-8888-888888888888', 'Tech for Good Kootenays', 'Using technology to solve social and environmental challenges in our community. Making a positive impact through code.', 'Tech for Good Kootenays brings together technologists passionate about using their skills for social and environmental impact. We partner with local nonprofits, environmental organizations, and community groups to build technology solutions that matter. Projects range from conservation apps to nonprofit websites, from data analysis for social causes to accessibility improvements. If you want your tech skills to make a real difference in our community, this is your group.', 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=1200&h=600&fit=crop&q=80', 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=1600&h=400&fit=crop&q=80', 'open', 0, 'published', true, '2025-02-10 10:00:00+00'),
	
	('a9999999-9999-9999-9999-999999999999', 'Junior Developers Network', 'Supporting new developers on their journey. Mentorship, code reviews, interview prep, and career guidance.', 'The Junior Developers Network is a supportive community for developers at the beginning of their careers. We understand that starting in tech can be overwhelming, and we''re here to help! Our group offers mentorship programs, portfolio reviews, mock interviews, and workshops on fundamental programming concepts. Senior developers volunteer their time to help juniors level up their skills. No question is too basic - we all started somewhere!', 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&h=600&fit=crop&q=80', 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=1600&h=400&fit=crop&q=80', 'open', 0, 'published', false, '2025-01-25 14:00:00+00'),
	
	-- Hybrid Tech/Lifestyle Group
	('b0000000-0000-0000-0000-000000000000', 'Remote Work Warriors', 'Master the art of remote work in the Kootenays. Productivity tips, co-working sessions, and work-life balance in paradise.', 'Remote Work Warriors is for tech professionals who have chosen the Kootenay lifestyle while maintaining successful remote careers. We share tips on productivity, home office setups, dealing with timezone challenges, and maintaining work-life balance when your office has a mountain view. Regular co-working sessions at local cafes, productivity workshops, and social events help combat isolation and build community. Because working remotely doesn''t mean working alone!', 'https://images.unsplash.com/photo-1521898284481-a5ec348cb555?w=1200&h=600&fit=crop&q=80', 'https://images.unsplash.com/photo-1600508774634-4e11d34730e2?w=1600&h=400&fit=crop&q=80', 'open', 0, 'published', true, '2025-04-12 08:30:00+00');

-- =====================================================
-- GROUP MEMBERS (3-5 members per group with realistic roles)
-- =====================================================

-- Nelson React Developers members
INSERT INTO "public"."group_members" ("group_id", "member_id", "role", "joined_date") 
SELECT 'a1111111-1111-1111-1111-111111111111', m.id, 'admin', '2025-01-15'
FROM members m WHERE m.name = 'Sarah Mitchell';

INSERT INTO "public"."group_members" ("group_id", "member_id", "role", "joined_date") 
SELECT 'a1111111-1111-1111-1111-111111111111', m.id, 'member', '2025-01-20'
FROM members m WHERE m.name = 'David Thompson';

INSERT INTO "public"."group_members" ("group_id", "member_id", "role", "joined_date") 
SELECT 'a1111111-1111-1111-1111-111111111111', m.id, 'member', '2025-01-25'
FROM members m WHERE m.name = 'Emily Rodriguez';

INSERT INTO "public"."group_members" ("group_id", "member_id", "role", "joined_date") 
SELECT 'a1111111-1111-1111-1111-111111111111', m.id, 'member', '2025-02-01'
FROM members m WHERE m.name = 'Marcus Chen';

-- Kootenay AI & Machine Learning members
INSERT INTO "public"."group_members" ("group_id", "member_id", "role", "joined_date") 
SELECT 'a2222222-2222-2222-2222-222222222222', m.id, 'admin', '2025-02-20'
FROM members m WHERE m.name = 'Lisa Park';

INSERT INTO "public"."group_members" ("group_id", "member_id", "role", "joined_date") 
SELECT 'a2222222-2222-2222-2222-222222222222', m.id, 'member', '2025-02-25'
FROM members m WHERE m.name = 'Marcus Chen';

INSERT INTO "public"."group_members" ("group_id", "member_id", "role", "joined_date") 
SELECT 'a2222222-2222-2222-2222-222222222222', m.id, 'member', '2025-03-01'
FROM members m WHERE m.name = 'David Thompson';

-- Women in Tech Kootenays members
INSERT INTO "public"."group_members" ("group_id", "member_id", "role", "joined_date") 
SELECT 'a3333333-3333-3333-3333-333333333333', m.id, 'admin', '2025-01-10'
FROM members m WHERE m.name = 'Emily Rodriguez';

INSERT INTO "public"."group_members" ("group_id", "member_id", "role", "joined_date") 
SELECT 'a3333333-3333-3333-3333-333333333333', m.id, 'admin', '2025-01-10'
FROM members m WHERE m.name = 'Sarah Mitchell';

INSERT INTO "public"."group_members" ("group_id", "member_id", "role", "joined_date") 
SELECT 'a3333333-3333-3333-3333-333333333333', m.id, 'member', '2025-01-15'
FROM members m WHERE m.name = 'Lisa Park';

-- Startup Founders Network members
INSERT INTO "public"."group_members" ("group_id", "member_id", "role", "joined_date") 
SELECT 'a4444444-4444-4444-4444-444444444444', m.id, 'admin', '2025-03-05'
FROM members m WHERE m.name = 'Marcus Chen';

INSERT INTO "public"."group_members" ("group_id", "member_id", "role", "joined_date") 
SELECT 'a4444444-4444-4444-4444-444444444444', m.id, 'member', '2025-03-10'
FROM members m WHERE m.name = 'David Thompson';

INSERT INTO "public"."group_members" ("group_id", "member_id", "role", "joined_date") 
SELECT 'a4444444-4444-4444-4444-444444444444', m.id, 'member', '2025-03-15'
FROM members m WHERE m.name = 'Sarah Mitchell';

-- Digital Marketing Professionals members
INSERT INTO "public"."group_members" ("group_id", "member_id", "role", "joined_date") 
SELECT 'a5555555-5555-5555-5555-555555555555', m.id, 'admin', '2025-02-28'
FROM members m WHERE m.name = 'Emily Rodriguez';

INSERT INTO "public"."group_members" ("group_id", "member_id", "role", "joined_date") 
SELECT 'a5555555-5555-5555-5555-555555555555', m.id, 'member', '2025-03-05'
FROM members m WHERE m.name = 'Lisa Park';

-- Blockchain & Web3 Innovators members
INSERT INTO "public"."group_members" ("group_id", "member_id", "role", "joined_date") 
SELECT 'a6666666-6666-6666-6666-666666666666', m.id, 'admin', '2025-04-01'
FROM members m WHERE m.name = 'David Thompson';

INSERT INTO "public"."group_members" ("group_id", "member_id", "role", "joined_date") 
SELECT 'a6666666-6666-6666-6666-666666666666', m.id, 'member', '2025-04-05'
FROM members m WHERE m.name = 'Marcus Chen';

INSERT INTO "public"."group_members" ("group_id", "member_id", "role", "joined_date") 
SELECT 'a6666666-6666-6666-6666-666666666666', m.id, 'member', '2025-04-10'
FROM members m WHERE m.name = 'Sarah Mitchell';

-- Game Developers Guild members
INSERT INTO "public"."group_members" ("group_id", "member_id", "role", "joined_date") 
SELECT 'a7777777-7777-7777-7777-777777777777', m.id, 'admin', '2025-03-15'
FROM members m WHERE m.name = 'David Thompson';

INSERT INTO "public"."group_members" ("group_id", "member_id", "role", "joined_date") 
SELECT 'a7777777-7777-7777-7777-777777777777', m.id, 'member', '2025-03-20'
FROM members m WHERE m.name = 'Emily Rodriguez';

INSERT INTO "public"."group_members" ("group_id", "member_id", "role", "joined_date") 
SELECT 'a7777777-7777-7777-7777-777777777777', m.id, 'member', '2025-03-25'
FROM members m WHERE m.name = 'Lisa Park';

-- Tech for Good Kootenays members
INSERT INTO "public"."group_members" ("group_id", "member_id", "role", "joined_date") 
SELECT 'a8888888-8888-8888-8888-888888888888', m.id, 'admin', '2025-02-10'
FROM members m WHERE m.name = 'Lisa Park';

INSERT INTO "public"."group_members" ("group_id", "member_id", "role", "joined_date") 
SELECT 'a8888888-8888-8888-8888-888888888888', m.id, 'admin', '2025-02-10'
FROM members m WHERE m.name = 'Sarah Mitchell';

INSERT INTO "public"."group_members" ("group_id", "member_id", "role", "joined_date") 
SELECT 'a8888888-8888-8888-8888-888888888888', m.id, 'member', '2025-02-15'
FROM members m WHERE m.name = 'Emily Rodriguez';

INSERT INTO "public"."group_members" ("group_id", "member_id", "role", "joined_date") 
SELECT 'a8888888-8888-8888-8888-888888888888', m.id, 'member', '2025-02-20'
FROM members m WHERE m.name = 'Marcus Chen';

-- Junior Developers Network members
INSERT INTO "public"."group_members" ("group_id", "member_id", "role", "joined_date") 
SELECT 'a9999999-9999-9999-9999-999999999999', m.id, 'admin', '2025-01-25'
FROM members m WHERE m.name = 'Sarah Mitchell';

INSERT INTO "public"."group_members" ("group_id", "member_id", "role", "joined_date") 
SELECT 'a9999999-9999-9999-9999-999999999999', m.id, 'member', '2025-01-30'
FROM members m WHERE m.name = 'Emily Rodriguez';

INSERT INTO "public"."group_members" ("group_id", "member_id", "role", "joined_date") 
SELECT 'a9999999-9999-9999-9999-999999999999', m.id, 'member', '2025-02-05'
FROM members m WHERE m.name = 'David Thompson';

-- Remote Work Warriors members
INSERT INTO "public"."group_members" ("group_id", "member_id", "role", "joined_date") 
SELECT 'b0000000-0000-0000-0000-000000000000', m.id, 'admin', '2025-04-12'
FROM members m WHERE m.name = 'Marcus Chen';

INSERT INTO "public"."group_members" ("group_id", "member_id", "role", "joined_date") 
SELECT 'b0000000-0000-0000-0000-000000000000', m.id, 'member', '2025-04-15'
FROM members m WHERE m.name = 'Sarah Mitchell';

INSERT INTO "public"."group_members" ("group_id", "member_id", "role", "joined_date") 
SELECT 'b0000000-0000-0000-0000-000000000000', m.id, 'member', '2025-04-18'
FROM members m WHERE m.name = 'David Thompson';

INSERT INTO "public"."group_members" ("group_id", "member_id", "role", "joined_date") 
SELECT 'b0000000-0000-0000-0000-000000000000', m.id, 'member', '2025-04-20'
FROM members m WHERE m.name = 'Lisa Park';

INSERT INTO "public"."group_members" ("group_id", "member_id", "role", "joined_date") 
SELECT 'b0000000-0000-0000-0000-000000000000', m.id, 'member', '2025-04-22'
FROM members m WHERE m.name = 'Emily Rodriguez';

-- =====================================================
-- GROUP EVENTS (Associate existing events with groups)
-- =====================================================

-- Update existing events to associate with groups
UPDATE events SET group_id = 'a1111111-1111-1111-1111-111111111111' 
WHERE title = 'React Hooks Deep Dive Workshop';

UPDATE events SET group_id = 'a4444444-4444-4444-4444-444444444444' 
WHERE title = 'Startup Pitch Night';

UPDATE events SET group_id = 'a2222222-2222-2222-2222-222222222222' 
WHERE title = 'AI and Machine Learning Panel';

-- Add new group-specific events
INSERT INTO "public"."events" ("id", "title", "description", "date", "end_date", "location", "address", "image", "type", "url", "status", "featured", "organizer_id", "group_id", "max_attendees", "created_at") 
SELECT 
	'e1111111-1111-1111-1111-111111111111',
	'Women in Tech: Leadership Workshop',
	'Join us for an empowering workshop on leadership skills for women in technology. Topics include effective communication, negotiation strategies, building confidence, and navigating career advancement in tech.',
	'2025-07-18 18:00:00+00',
	'2025-07-18 20:30:00+00',
	'Kootenay Co-op Community Room',
	'1002 Baker St, Nelson, BC V1L 4H8',
	'https://images.unsplash.com/photo-1591035897819-f4bdf739f446?w=800&h=600&fit=crop&q=80',
	'in-person',
	NULL,
	'published',
	true,
	m.id,
	'a3333333-3333-3333-3333-333333333333',
	40,
	NOW()
FROM members m WHERE m.name = 'Emily Rodriguez' LIMIT 1;

INSERT INTO "public"."events" ("id", "title", "description", "date", "end_date", "location", "address", "image", "type", "url", "status", "featured", "organizer_id", "group_id", "max_attendees", "created_at") 
SELECT 
	'e2222222-2222-2222-2222-222222222222',
	'Blockchain Basics: Smart Contract Workshop',
	'Learn the fundamentals of smart contract development on Ethereum. We''ll cover Solidity basics, development tools, testing strategies, and deploy a simple contract to testnet.',
	'2025-07-25 17:30:00+00',
	'2025-07-25 20:00:00+00',
	'Nelson Innovation Centre',
	'Suite 201, 618 Front St, Nelson, BC',
	'https://images.unsplash.com/photo-1639322537228-f710d846310a?w=800&h=600&fit=crop&q=80',
	'hybrid',
	'https://zoom.us/blockchain-workshop',
	'published',
	false,
	m.id,
	'a6666666-6666-6666-6666-666666666666',
	30,
	NOW()
FROM members m WHERE m.name = 'David Thompson' LIMIT 1;

INSERT INTO "public"."events" ("id", "title", "description", "date", "end_date", "location", "address", "image", "type", "url", "status", "featured", "organizer_id", "group_id", "max_attendees", "created_at") 
SELECT 
	'e3333333-3333-3333-3333-333333333333',
	'Game Jam Weekend: Mountain Theme',
	'48-hour game jam with a mountain theme! Form teams or work solo to create a game from scratch. All skill levels welcome - programmers, artists, designers, and musicians.',
	'2025-08-02 17:00:00+00',
	'2025-08-04 17:00:00+00',
	'Selkirk College Digital Arts Lab',
	'301 Frank Beinder Way, Castlegar, BC',
	'https://images.unsplash.com/photo-1556438064-2d7646166914?w=800&h=600&fit=crop&q=80',
	'in-person',
	NULL,
	'published',
	false,
	m.id,
	'a7777777-7777-7777-7777-777777777777',
	50,
	NOW()
FROM members m WHERE m.name = 'David Thompson' LIMIT 1;

INSERT INTO "public"."events" ("id", "title", "description", "date", "end_date", "location", "address", "image", "type", "url", "status", "featured", "organizer_id", "group_id", "max_attendees", "created_at") 
SELECT 
	'e4444444-4444-4444-4444-444444444444',
	'Tech for Good: Nonprofit Website Hackathon',
	'Help local nonprofits build or improve their web presence. We''ll match developer teams with nonprofit organizations for a day of meaningful coding.',
	'2025-08-10 09:00:00+00',
	'2025-08-10 17:00:00+00',
	'Nelson Library Community Room',
	'602 Stanley St, Nelson, BC',
	'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=800&h=600&fit=crop&q=80',
	'in-person',
	NULL,
	'published',
	true,
	m.id,
	'a8888888-8888-8888-8888-888888888888',
	60,
	NOW()
FROM members m WHERE m.name = 'Lisa Park' LIMIT 1;

INSERT INTO "public"."events" ("id", "title", "description", "date", "end_date", "location", "address", "image", "type", "url", "status", "featured", "organizer_id", "group_id", "max_attendees", "created_at") 
SELECT 
	'e5555555-5555-5555-5555-555555555555',
	'Remote Work Productivity Workshop',
	'Master productivity while working remotely. Topics include time management, avoiding distractions, setting boundaries, and maintaining work-life balance in paradise.',
	'2025-07-30 12:00:00+00',
	'2025-07-30 13:30:00+00',
	'Online',
	'Virtual Event',
	'https://images.unsplash.com/photo-1600508774634-4e11d34730e2?w=800&h=600&fit=crop&q=80',
	'online',
	'https://zoom.us/remote-productivity',
	'published',
	false,
	m.id,
	'b0000000-0000-0000-0000-000000000000',
	100,
	NOW()
FROM members m WHERE m.name = 'Marcus Chen' LIMIT 1;

-- =====================================================
-- GROUP RESOURCES (Associate existing resources and add new ones)
-- =====================================================

-- Update some existing resources to associate with groups
UPDATE resources SET group_id = 'a1111111-1111-1111-1111-111111111111' 
WHERE title = 'Complete React Developer Course';

UPDATE resources SET group_id = 'a9999999-9999-9999-9999-999999999999' 
WHERE title = 'JavaScript ES6+ Cheat Sheet';

-- Add new group-specific resources
INSERT INTO "public"."resources" ("id", "title", "description", "type", "url", "image", "status", "featured", "contributor_id", "group_id", "tags", "created_at") 
SELECT 
	'd1111111-1111-1111-1111-111111111111',
	'AI/ML Learning Path for Beginners',
	'Comprehensive guide to starting your journey in artificial intelligence and machine learning. Includes free courses, tutorials, and project ideas.',
	'guide',
	'https://github.com/kootenay-ai/ml-learning-path',
	'https://images.unsplash.com/photo-1555255707-c07966088b7b?w=600&h=400&fit=crop&q=80',
	'published',
	true,
	m.id,
	'a2222222-2222-2222-2222-222222222222',
	ARRAY['ai', 'machine-learning', 'beginner', 'guide'],
	NOW()
FROM members m WHERE m.name = 'Lisa Park' LIMIT 1;

INSERT INTO "public"."resources" ("id", "title", "description", "type", "url", "image", "status", "featured", "contributor_id", "group_id", "tags", "created_at") 
SELECT 
	'd2222222-2222-2222-2222-222222222222',
	'Women in Tech: Negotiation Strategies',
	'Research-backed strategies for salary negotiation, project leadership, and career advancement specifically for women in technology.',
	'article',
	'https://medium.com/women-tech-kootenays/negotiation-guide',
	'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&h=400&fit=crop&q=80',
	'published',
	false,
	m.id,
	'a3333333-3333-3333-3333-333333333333',
	ARRAY['women-in-tech', 'career', 'negotiation', 'leadership'],
	NOW()
FROM members m WHERE m.name = 'Emily Rodriguez' LIMIT 1;

INSERT INTO "public"."resources" ("id", "title", "description", "type", "url", "image", "status", "featured", "contributor_id", "group_id", "tags", "created_at") 
SELECT 
	'd3333333-3333-3333-3333-333333333333',
	'Startup Funding Guide for Canadian Tech Companies',
	'Navigate the Canadian startup funding landscape. Covers government grants, angel investors, VCs, and alternative funding sources.',
	'guide',
	'https://kootenay-startups.ca/funding-guide',
	'https://images.unsplash.com/photo-1559526324-593bc073d938?w=600&h=400&fit=crop&q=80',
	'published',
	true,
	m.id,
	'a4444444-4444-4444-4444-444444444444',
	ARRAY['startup', 'funding', 'canada', 'entrepreneur'],
	NOW()
FROM members m WHERE m.name = 'Marcus Chen' LIMIT 1;

INSERT INTO "public"."resources" ("id", "title", "description", "type", "url", "image", "status", "featured", "contributor_id", "group_id", "tags", "created_at") 
SELECT 
	'd4444444-4444-4444-4444-444444444444',
	'Unity Game Development Starter Pack',
	'Everything you need to start developing games with Unity. Includes project templates, asset packs, and tutorial links.',
	'toolkit',
	'https://github.com/game-dev-guild/unity-starter',
	'https://images.unsplash.com/photo-1535223289827-42f1e9919769?w=600&h=400&fit=crop&q=80',
	'published',
	false,
	m.id,
	'a7777777-7777-7777-7777-777777777777',
	ARRAY['unity', 'game-dev', 'starter', 'toolkit'],
	NOW()
FROM members m WHERE m.name = 'David Thompson' LIMIT 1;

INSERT INTO "public"."resources" ("id", "title", "description", "type", "url", "image", "status", "featured", "contributor_id", "group_id", "tags", "created_at") 
SELECT 
	'd5555555-5555-5555-5555-555555555555',
	'Remote Work Tools Comparison 2025',
	'Comprehensive comparison of tools for remote teams: communication, project management, time tracking, and virtual collaboration.',
	'comparison',
	'https://remoteworkwarriors.ca/tools-2025',
	'https://images.unsplash.com/photo-1600508774634-4e11d34730e2?w=600&h=400&fit=crop&q=80',
	'published',
	true,
	m.id,
	'b0000000-0000-0000-0000-000000000000',
	ARRAY['remote-work', 'tools', 'productivity', 'comparison'],
	NOW()
FROM members m WHERE m.name = 'Marcus Chen' LIMIT 1;

-- =====================================================
-- GROUP GALLERIES (Link photo galleries to groups)
-- =====================================================

-- Since galleries table might not have a group_id field based on the schema,
-- we'll use a news_associations style approach or skip this section.
-- For now, we'll document which galleries would belong to which groups:

-- Gallery '11111111-1111-1111-1111-111111111111' (Sarah's Development Setup) -> React Developers Group
-- Gallery '55555555-5555-5555-5555-555555555555' (Jennifer's Data Visualization) -> AI & ML Group
-- Gallery '33333333-3333-3333-3333-333333333333' (Alex's Design Process) -> Junior Developers Network

-- =====================================================
-- GROUP NEWS (Create news articles about groups)
-- =====================================================

INSERT INTO "public"."news" ("id", "title", "slug", "content", "excerpt", "hero_image", "publish_date", "status", "tags", "author_id", "featured", "created_at") 
SELECT 
	'f1111111-1111-1111-1111-111111111111',
	'Women in Tech Kootenays Launches Mentorship Program',
	'women-tech-mentorship-launch-2025',
	'Women in Tech Kootenays is excited to announce the launch of our new mentorship program, connecting experienced tech professionals with women starting or advancing their careers in technology.

The program aims to address the gender gap in technology by providing structured support, guidance, and networking opportunities. Mentors and mentees will be matched based on career goals, technical interests, and availability.

**Program Highlights:**
- 6-month mentorship commitments
- Monthly one-on-one sessions
- Group workshops and networking events
- Career development resources
- Technical skill-building opportunities

"We believe mentorship is crucial for career advancement in tech," says Emily Rodriguez, group co-founder. "This program creates a supportive environment where women can learn, grow, and thrive in their tech careers."

Applications are now open for both mentors and mentees. The first cohort begins in August 2025.

**How to Apply:**
Visit our group page to access the application forms. We welcome women at all career stages, from students to senior professionals.

The program is free for all participants, thanks to sponsorship from local tech companies committed to diversity and inclusion.',
	'New mentorship program connects experienced professionals with women advancing in tech careers. Applications now open for August 2025 cohort.',
	'https://images.unsplash.com/photo-1600508774843-9b9c0dd4d249?w=800&h=600&fit=crop&q=80',
	'2025-06-15',
	'published',
	ARRAY['women-in-tech', 'mentorship', 'career-development'],
	m.id,
	true,
	NOW()
FROM members m WHERE m.name = 'Emily Rodriguez' LIMIT 1;

INSERT INTO "public"."news" ("id", "title", "slug", "content", "excerpt", "hero_image", "publish_date", "status", "tags", "author_id", "featured", "created_at") 
SELECT 
	'f2222222-2222-2222-2222-222222222222',
	'Tech for Good Kootenays Partners with Local Environmental Groups',
	'tech-good-environmental-partnership-2025',
	'Tech for Good Kootenays has announced partnerships with three local environmental organizations to develop technology solutions for conservation and climate action in the region.

The partnerships include:
- **Kootenay Conservation Program**: Building a wildlife tracking mobile app
- **Nelson EcoSociety**: Creating a carbon footprint calculator for residents
- **Columbia Basin Trust**: Developing data visualization tools for climate research

"Technology can be a powerful force for environmental good," explains Lisa Park, Tech for Good admin. "These partnerships allow our members to use their skills on projects that directly benefit our local ecosystem."

**Current Projects:**

*Wildlife Tracking App:* A mobile application that allows citizen scientists to report wildlife sightings, contributing to conservation research. The app uses AI to help identify species and validate observations.

*Carbon Calculator:* A web tool that helps Kootenay residents understand and reduce their carbon footprint, with localized data and actionable recommendations.

*Climate Data Visualization:* Interactive dashboards that make climate research accessible to the public, helping communities understand and respond to environmental changes.

**Get Involved:**
Tech for Good meets monthly and welcomes developers, designers, data scientists, and anyone interested in using technology for positive impact. No prior experience with environmental issues required!

These projects demonstrate how local tech talent can contribute to global challenges while making a real difference in our own backyard.',
	'Local tech group partners with environmental organizations to build conservation apps and climate action tools.',
	'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=800&h=600&fit=crop&q=80',
	'2025-06-20',
	'published',
	ARRAY['tech-for-good', 'environment', 'conservation', 'partnership'],
	m.id,
	false,
	NOW()
FROM members m WHERE m.name = 'Lisa Park' LIMIT 1;

INSERT INTO "public"."news" ("id", "title", "slug", "content", "excerpt", "hero_image", "publish_date", "status", "tags", "author_id", "featured", "created_at") 
SELECT 
	'f3333333-3333-3333-3333-333333333333',
	'Remote Work Warriors: Building Community for Distributed Teams',
	'remote-work-warriors-community-2025',
	'As remote work becomes the norm for many tech professionals in the Kootenays, the Remote Work Warriors group is creating vital connections for distributed workers.

The group, launched in April, has quickly grown to become one of the most active in the Nelson Tech community. Members share tips, organize co-working sessions, and support each other through the unique challenges of remote work.

**Popular Group Activities:**
- Weekly virtual coffee chats
- Monthly in-person co-working days at local cafes
- Productivity workshops and tool demonstrations
- Work-life balance discussions
- Outdoor networking hikes

"Working remotely in the Kootenays is a dream, but it can be isolating," says Marcus Chen, group founder. "We''re building a community where remote workers can connect, collaborate, and enjoy the lifestyle we all moved here for."

**Member Benefits:**
The group has negotiated discounts at local co-working spaces and cafes, created a resource library of remote work best practices, and maintains an active Slack community for daily support.

**Success Stories:**
Several members have found co-founders, collaborators, and even new job opportunities through group connections. The community aspect has been crucial for newcomers to the region.

Join Remote Work Warriors to connect with fellow distributed professionals and make the most of remote work in paradise!',
	'New group supports remote tech workers with co-working sessions, productivity tips, and mountain lifestyle balance.',
	'https://images.unsplash.com/photo-1521898284481-a5ec348cb555?w=800&h=600&fit=crop&q=80',
	'2025-06-22',
	'published',
	ARRAY['remote-work', 'community', 'productivity', 'lifestyle'],
	m.id,
	true,
	NOW()
FROM members m WHERE m.name = 'Marcus Chen' LIMIT 1;

-- =====================================================
-- GROUP TAGS (Add relevant tags to groups)
-- =====================================================

-- First, ensure we have the necessary tags
INSERT INTO "public"."tags" ("id", "name", "slug", "description", "category", "color", "usage_count", "status") VALUES
	('c1111111-1111-1111-1111-111111111111', 'React', 'react', 'React.js framework and ecosystem', 'technology', '#61DAFB', 0, 'active'),
	('c2222222-2222-2222-2222-222222222222', 'Machine Learning', 'machine-learning', 'ML algorithms and applications', 'technology', '#FF6B6B', 0, 'active'),
	('c3333333-3333-3333-3333-333333333333', 'Women in Tech', 'women-in-tech', 'Supporting women in technology', 'community', '#9B59B6', 0, 'active'),
	('c4444444-4444-4444-4444-444444444444', 'Startup', 'startup', 'Startup and entrepreneurship', 'business', '#E74C3C', 0, 'active'),
	('c5555555-5555-5555-5555-555555555555', 'Remote Work', 'remote-work', 'Remote and distributed work', 'lifestyle', '#3498DB', 0, 'active'),
	('c6666666-6666-6666-6666-666666666666', 'Blockchain', 'blockchain', 'Blockchain and Web3 technologies', 'technology', '#F39C12', 0, 'active'),
	('c7777777-7777-7777-7777-777777777777', 'Game Development', 'game-dev', 'Game design and development', 'technology', '#27AE60', 0, 'active'),
	('c8888888-8888-8888-8888-888888888888', 'Social Impact', 'social-impact', 'Tech for social good', 'community', '#16A085', 0, 'active')
ON CONFLICT (slug) DO NOTHING;

-- Link tags to groups
INSERT INTO "public"."group_tags" ("group_id", "tag_id") VALUES
	('a1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111'),
	('a2222222-2222-2222-2222-222222222222', 'c2222222-2222-2222-2222-222222222222'),
	('a3333333-3333-3333-3333-333333333333', 'c3333333-3333-3333-3333-333333333333'),
	('a4444444-4444-4444-4444-444444444444', 'c4444444-4444-4444-4444-444444444444'),
	('a5555555-5555-5555-5555-555555555555', 'c4444444-4444-4444-4444-444444444444'),
	('a6666666-6666-6666-6666-666666666666', 'c6666666-6666-6666-6666-666666666666'),
	('a7777777-7777-7777-7777-777777777777', 'c7777777-7777-7777-7777-777777777777'),
	('a8888888-8888-8888-8888-888888888888', 'c8888888-8888-8888-8888-888888888888'),
	('b0000000-0000-0000-0000-000000000000', 'c5555555-5555-5555-5555-555555555555');

-- =====================================================
-- UPDATE GROUP MEMBER COUNTS
-- =====================================================

UPDATE groups g SET member_count = (
	SELECT COUNT(*) FROM group_members gm WHERE gm.group_id = g.id
);

-- =====================================================
-- ASSOCIATE NEWS WITH GROUPS USING NEWS_ASSOCIATIONS
-- =====================================================

INSERT INTO "public"."news_associations" ("news_id", "association_type", "association_id") VALUES
	('f1111111-1111-1111-1111-111111111111', 'group', 'a3333333-3333-3333-3333-333333333333'),
	('f2222222-2222-2222-2222-222222222222', 'group', 'a8888888-8888-8888-8888-888888888888'),
	('f3333333-3333-3333-3333-333333333333', 'group', 'b0000000-0000-0000-0000-000000000000');

COMMIT;

-- =====================================================
-- VALIDATION QUERIES
-- =====================================================

-- Check group counts
SELECT 'Total Groups' as metric, COUNT(*) as count FROM groups
UNION ALL
SELECT 'Featured Groups', COUNT(*) FROM groups WHERE featured = true
UNION ALL
SELECT 'Total Group Members', COUNT(*) FROM group_members
UNION ALL
SELECT 'Groups with Events', COUNT(DISTINCT group_id) FROM events WHERE group_id IS NOT NULL
UNION ALL
SELECT 'Groups with Resources', COUNT(DISTINCT group_id) FROM resources WHERE group_id IS NOT NULL;

-- List groups with member counts
SELECT g.name, g.visibility, g.member_count, g.featured
FROM groups g
ORDER BY g.member_count DESC, g.name;