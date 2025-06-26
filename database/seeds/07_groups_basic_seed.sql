-- =====================================================
-- BASIC GROUPS SEED DATA
-- A simplified version that just creates the groups without complex associations
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
-- GROUP MEMBERS (Simple member associations)
-- =====================================================

-- Add a few members to each group
INSERT INTO "public"."group_members" ("group_id", "member_id", "role", "joined_date") 
SELECT 
    g.id as group_id,
    m.id as member_id,
    CASE 
        WHEN ROW_NUMBER() OVER (PARTITION BY g.id ORDER BY RANDOM()) = 1 THEN 'admin'
        ELSE 'member'
    END as role,
    g.created_at::date + (random() * 30)::int as joined_date
FROM groups g
CROSS JOIN members m
WHERE m.id IN (
    SELECT id FROM members ORDER BY RANDOM() LIMIT 5
)
ORDER BY g.id, RANDOM()
LIMIT 30;

-- Update member counts
UPDATE groups g SET member_count = (
    SELECT COUNT(*) FROM group_members gm WHERE gm.group_id = g.id
);

COMMIT;

-- =====================================================
-- VALIDATION QUERIES
-- =====================================================

-- Check group counts
SELECT 'Total Groups' as metric, COUNT(*) as count FROM groups
UNION ALL
SELECT 'Featured Groups', COUNT(*) FROM groups WHERE featured = true
UNION ALL
SELECT 'Total Group Members', COUNT(*) FROM group_members;

-- List groups with member counts
SELECT g.name, g.visibility, g.member_count, g.featured
FROM groups g
ORDER BY g.featured DESC, g.name;