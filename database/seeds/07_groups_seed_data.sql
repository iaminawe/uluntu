-- =====================================================
-- GROUPS SEED DATA
-- =====================================================
-- This file contains additional groups for the Kootenay Tech Community platform
-- 
-- Prerequisites:
-- - Must be run after 01_fresh_demo_content_final.sql
-- - Requires existing members to be present in the database
--
-- Contents:
-- - 10 additional diverse tech community groups
-- - Group memberships with existing members
-- - Variety of group types: technical, professional, social
-- =====================================================

BEGIN;

-- =====================================================
-- ADDITIONAL GROUPS (10 new groups)
-- =====================================================

INSERT INTO groups (
    id, name, description, long_description, hero_image, cover_image, 
    visibility, member_count, status, featured, created_at
) VALUES 
-- Technical Focus Groups
('66666666-6666-6666-6666-666666666666', 
 'Blockchain & Web3 Developers', 
 'Exploring decentralized technologies, smart contracts, and the future of web3 applications.', 
 'The Blockchain & Web3 Developers group is dedicated to understanding and building decentralized applications. We explore blockchain fundamentals, smart contract development, DeFi protocols, and NFT marketplaces. Our community includes developers working with Ethereum, Solana, and other blockchain platforms. Whether you''re curious about cryptocurrency or building the next big dApp, you''ll find knowledgeable peers and resources here.',
 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=1200&h=600&fit=crop',
 'https://images.unsplash.com/photo-1639762681057-408e52192e55?w=1200&h=400&fit=crop',
 'open', 22, 'published', true, NOW() - INTERVAL '45 days'),

('77777777-7777-7777-7777-777777777777', 
 'Mobile App Developers Alliance', 
 'iOS, Android, and cross-platform mobile development community sharing best practices and innovations.', 
 'The Mobile App Developers Alliance brings together developers passionate about creating exceptional mobile experiences. We cover native iOS development with Swift, Android development with Kotlin, and cross-platform solutions using React Native and Flutter. Our group hosts code reviews, UI/UX workshops, and app launch parties. Join us to stay current with mobile development trends and connect with fellow app creators.',
 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=1200&h=600&fit=crop',
 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=1200&h=400&fit=crop',
 'open', 28, 'published', false, NOW() - INTERVAL '30 days'),

('88888888-8888-8888-8888-888888888888', 
 'Cloud Native & DevOps Community', 
 'Mastering containerization, orchestration, and modern infrastructure practices.', 
 'The Cloud Native & DevOps Community focuses on modern infrastructure and deployment practices. We dive deep into Docker, Kubernetes, service meshes, and GitOps workflows. Our members share experiences with AWS, Azure, and Google Cloud Platform. Regular topics include CI/CD pipelines, infrastructure as code, monitoring, and site reliability engineering. Perfect for anyone looking to level up their DevOps skills.',
 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=1200&h=600&fit=crop',
 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&h=400&fit=crop',
 'closed', 19, 'published', true, NOW() - INTERVAL '60 days'),

-- Professional Development Groups
('99999999-9999-9999-9999-999999999999', 
 'Tech Leadership Circle', 
 'Supporting current and aspiring tech leaders in their journey to build great teams and products.', 
 'The Tech Leadership Circle is a peer support group for engineering managers, tech leads, CTOs, and aspiring leaders. We discuss team building, technical decision-making, stakeholder management, and personal growth. Our sessions include leadership book clubs, guest speakers from successful tech companies, and roundtable discussions on common challenges. This is a safe space to share experiences and learn from others navigating technical leadership.',
 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&h=600&fit=crop',
 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1200&h=400&fit=crop',
 'closed', 16, 'published', false, NOW() - INTERVAL '20 days'),

('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 
 'Freelance Tech Professionals', 
 'Connect with fellow freelancers, share opportunities, and navigate the independent tech career path.', 
 'The Freelance Tech Professionals group supports independent contractors, consultants, and freelancers in the tech industry. We share client leads, discuss pricing strategies, review contracts, and provide peer support for the unique challenges of freelancing. Topics include project management, client communication, tax strategies, and work-life balance. Join us to build a thriving freelance career while connecting with like-minded professionals.',
 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1200&h=600&fit=crop',
 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=1200&h=400&fit=crop',
 'open', 35, 'published', true, NOW() - INTERVAL '40 days'),

-- Specialized Interest Groups
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 
 'Game Development Collective', 
 'Unity, Unreal, and indie game developers creating interactive experiences together.', 
 'The Game Development Collective is home to game developers, designers, and enthusiasts in the Kootenays. We work with Unity, Unreal Engine, Godot, and custom engines. Our community hosts game jams, playtesting sessions, and technical workshops on graphics programming, game physics, and AI. Whether you''re building your first game or shipping your tenth, you''ll find supportive peers and valuable feedback here.',
 'https://images.unsplash.com/photo-1556438064-2d7646166914?w=1200&h=600&fit=crop',
 'https://images.unsplash.com/photo-1535223289827-42f1e9919769?w=1200&h=400&fit=crop',
 'open', 24, 'published', false, NOW() - INTERVAL '35 days'),

('cccccccc-cccc-cccc-cccc-cccccccccccc', 
 'Hardware Hackers & IoT Makers', 
 'Building physical computing projects with Arduino, Raspberry Pi, and custom electronics.', 
 'The Hardware Hackers & IoT Makers group brings together electronics enthusiasts, embedded systems developers, and IoT innovators. We work on projects ranging from home automation to environmental sensors, wearables to robotics. Our maker space features 3D printers, soldering stations, and component libraries. Regular workshops cover PCB design, sensor integration, and connecting hardware to the cloud.',
 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=600&fit=crop',
 'https://images.unsplash.com/photo-1555664424-778a1e5e1b48?w=1200&h=400&fit=crop',
 'open', 20, 'published', true, NOW() - INTERVAL '50 days'),

-- Community & Social Groups
('dddddddd-dddd-dddd-dddd-dddddddddddd', 
 'Women Who Code Kootenays', 
 'Empowering women in technology through mentorship, education, and community support.', 
 'Women Who Code Kootenays is dedicated to inspiring women to excel in technology careers. We provide a supportive environment for skill development, career advancement, and professional networking. Our events include coding workshops, career panels, mentorship programs, and social gatherings. All women and non-binary individuals in tech are welcome, from students to senior engineers. Together, we''re building a more inclusive tech community.',
 'https://images.unsplash.com/photo-1573164713988-8665fc963095?w=1200&h=600&fit=crop',
 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&h=400&fit=crop',
 'open', 42, 'published', true, NOW() - INTERVAL '25 days'),

('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 
 'Tech for Good Initiative', 
 'Using technology to create positive social and environmental impact in our communities.', 
 'The Tech for Good Initiative connects technologists passionate about using their skills for social impact. We work on projects supporting local nonprofits, environmental monitoring, accessibility tools, and community services. Our hackathons focus on solving real problems for real people. Members collaborate with local organizations to build websites, apps, and data solutions that make a difference. Join us to code with purpose.',
 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=1200&h=600&fit=crop',
 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1200&h=400&fit=crop',
 'open', 33, 'published', false, NOW() - INTERVAL '15 days'),

('ffffffff-ffff-ffff-ffff-ffffffffffff', 
 'Junior Developers Network', 
 'A supportive space for early-career developers to learn, grow, and build confidence together.', 
 'The Junior Developers Network is specifically designed for developers in their first few years of their tech career. We provide a judgment-free environment to ask questions, share learning resources, and work on projects together. Our mentorship program pairs juniors with experienced developers. Regular activities include code review sessions, interview prep workshops, and "explain like I''m five" tech talks. Everyone starts somewhere – start here with us!',
 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&h=600&fit=crop',
 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200&h=400&fit=crop',
 'open', 48, 'published', true, NOW() - INTERVAL '10 days');

-- =====================================================
-- GROUP MEMBERSHIPS
-- =====================================================
-- Add members to the new groups with realistic distribution

INSERT INTO group_members (group_id, member_id, role, joined_date) VALUES
-- Blockchain & Web3 Developers
('66666666-6666-6666-6666-666666666666', 'd0519096-9dd8-4397-b0bd-3dbb8cebdb39', 'admin', NOW() - INTERVAL '45 days'),
('66666666-6666-6666-6666-666666666666', 'a75a33d8-aa13-42a9-a246-3a5c8e5c838f', 'member', NOW() - INTERVAL '40 days'),
('66666666-6666-6666-6666-666666666666', 'f06db137-c993-4ab9-8d36-d94fe284bca9', 'member', NOW() - INTERVAL '30 days'),

-- Mobile App Developers Alliance
('77777777-7777-7777-7777-777777777777', '7131f030-4431-4dbf-816b-9cb4ebd2d54d', 'admin', NOW() - INTERVAL '30 days'),
('77777777-7777-7777-7777-777777777777', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'member', NOW() - INTERVAL '25 days'),
('77777777-7777-7777-7777-777777777777', '4c6aca02-ccd6-46b6-ae8f-3969e32cb873', 'member', NOW() - INTERVAL '20 days'),
('77777777-7777-7777-7777-777777777777', '8fa10942-4a64-4911-a45d-eb4996002302', 'member', NOW() - INTERVAL '15 days'),

-- Cloud Native & DevOps Community
('88888888-8888-8888-8888-888888888888', 'd0519096-9dd8-4397-b0bd-3dbb8cebdb39', 'admin', NOW() - INTERVAL '60 days'),
('88888888-8888-8888-8888-888888888888', 'f06db137-c993-4ab9-8d36-d94fe284bca9', 'member', NOW() - INTERVAL '55 days'),
('88888888-8888-8888-8888-888888888888', '857a4b0b-961f-4c36-96db-5ced07c11232', 'member', NOW() - INTERVAL '45 days'),

-- Tech Leadership Circle
('99999999-9999-9999-9999-999999999999', '1918195d-3aab-4a48-9999-f17e2a4f2ef9', 'admin', NOW() - INTERVAL '20 days'),
('99999999-9999-9999-9999-999999999999', 'b62e36e4-11a4-4567-979e-3f3ebbc9232d', 'member', NOW() - INTERVAL '18 days'),
('99999999-9999-9999-9999-999999999999', '857a4b0b-961f-4c36-96db-5ced07c11232', 'member', NOW() - INTERVAL '15 days'),

-- Freelance Tech Professionals
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'admin', NOW() - INTERVAL '40 days'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '7131f030-4431-4dbf-816b-9cb4ebd2d54d', 'member', NOW() - INTERVAL '35 days'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'f06db137-c993-4ab9-8d36-d94fe284bca9', 'member', NOW() - INTERVAL '30 days'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '1918195d-3aab-4a48-9999-f17e2a4f2ef9', 'member', NOW() - INTERVAL '25 days'),

-- Game Development Collective
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '7131f030-4431-4dbf-816b-9cb4ebd2d54d', 'admin', NOW() - INTERVAL '35 days'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'a75a33d8-aa13-42a9-a246-3a5c8e5c838f', 'member', NOW() - INTERVAL '30 days'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '4c6aca02-ccd6-46b6-ae8f-3969e32cb873', 'member', NOW() - INTERVAL '25 days'),

-- Hardware Hackers & IoT Makers
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'f06db137-c993-4ab9-8d36-d94fe284bca9', 'admin', NOW() - INTERVAL '50 days'),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'b62e36e4-11a4-4567-979e-3f3ebbc9232d', 'member', NOW() - INTERVAL '45 days'),
('cccccccc-cccc-cccc-cccc-cccccccccccc', '857a4b0b-961f-4c36-96db-5ced07c11232', 'member', NOW() - INTERVAL '40 days'),

-- Women Who Code Kootenays
('dddddddd-dddd-dddd-dddd-dddddddddddd', '1918195d-3aab-4a48-9999-f17e2a4f2ef9', 'admin', NOW() - INTERVAL '25 days'),
('dddddddd-dddd-dddd-dddd-dddddddddddd', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'member', NOW() - INTERVAL '23 days'),
('dddddddd-dddd-dddd-dddd-dddddddddddd', 'b62e36e4-11a4-4567-979e-3f3ebbc9232d', 'member', NOW() - INTERVAL '20 days'),
('dddddddd-dddd-dddd-dddd-dddddddddddd', '4c6aca02-ccd6-46b6-ae8f-3969e32cb873', 'member', NOW() - INTERVAL '18 days'),

-- Tech for Good Initiative
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'b62e36e4-11a4-4567-979e-3f3ebbc9232d', 'admin', NOW() - INTERVAL '15 days'),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'member', NOW() - INTERVAL '14 days'),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '1918195d-3aab-4a48-9999-f17e2a4f2ef9', 'member', NOW() - INTERVAL '12 days'),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '7131f030-4431-4dbf-816b-9cb4ebd2d54d', 'member', NOW() - INTERVAL '10 days'),

-- Junior Developers Network
('ffffffff-ffff-ffff-ffff-ffffffffffff', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'admin', NOW() - INTERVAL '10 days'),
('ffffffff-ffff-ffff-ffff-ffffffffffff', '4c6aca02-ccd6-46b6-ae8f-3969e32cb873', 'member', NOW() - INTERVAL '9 days'),
('ffffffff-ffff-ffff-ffff-ffffffffffff', 'f06db137-c993-4ab9-8d36-d94fe284bca9', 'member', NOW() - INTERVAL '8 days'),
('ffffffff-ffff-ffff-ffff-ffffffffffff', '857a4b0b-961f-4c36-96db-5ced07c11232', 'member', NOW() - INTERVAL '7 days'),
('ffffffff-ffff-ffff-ffff-ffffffffffff', 'a75a33d8-aa13-42a9-a246-3a5c8e5c838f', 'member', NOW() - INTERVAL '5 days');

-- =====================================================
-- Add some members to existing groups from previous seed
-- =====================================================

INSERT INTO group_members (group_id, member_id, role, joined_date) VALUES
-- Add more members to existing Web Developers Guild
('11111111-1111-1111-1111-111111111111', '8fa10942-4a64-4911-a45d-eb4996002302', 'member', NOW() - INTERVAL '20 days'),
('11111111-1111-1111-1111-111111111111', '857a4b0b-961f-4c36-96db-5ced07c11232', 'member', NOW() - INTERVAL '15 days'),

-- Add more members to AI & Machine Learning Enthusiasts
('22222222-2222-2222-2222-222222222222', '4c6aca02-ccd6-46b6-ae8f-3969e32cb873', 'member', NOW() - INTERVAL '25 days'),
('22222222-2222-2222-2222-222222222222', 'f06db137-c993-4ab9-8d36-d94fe284bca9', 'member', NOW() - INTERVAL '20 days'),

-- Add more members to Data Science & Analytics
('55555555-5555-5555-5555-555555555555', 'a75a33d8-aa13-42a9-a246-3a5c8e5c838f', 'member', NOW() - INTERVAL '30 days'),
('55555555-5555-5555-5555-555555555555', '1918195d-3aab-4a48-9999-f17e2a4f2ef9', 'member', NOW() - INTERVAL '25 days')
ON CONFLICT (group_id, member_id) DO NOTHING;

COMMIT;

-- =====================================================
-- SUMMARY
-- =====================================================
-- Added 10 new diverse tech community groups:
-- - Technical: Blockchain, Mobile, Cloud/DevOps
-- - Professional: Leadership, Freelance
-- - Specialized: Game Dev, Hardware/IoT
-- - Community: Women Who Code, Tech for Good, Junior Devs
--
-- Created realistic membership relationships
-- All groups have proper field names matching database schema
-- Groups cover various interests and skill levels
-- =====================================================