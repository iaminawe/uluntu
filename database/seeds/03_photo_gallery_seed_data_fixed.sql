-- =====================================================
-- PHOTO GALLERY SEED DATA FOR NELSON TECH COMMUNITY PLATFORM (FIXED)
-- Creates realistic gallery data with photos, promotions, and page headers
-- =====================================================

BEGIN;

-- Set timezone for consistent timestamps
SET TIME ZONE 'America/Vancouver';

-- =====================================================
-- USER GALLERIES (8 diverse galleries)
-- =====================================================

INSERT INTO "public"."user_galleries" ("id", "user_id", "title", "description", "slug", "privacy_level", "visibility", "sort_order", "photo_count", "view_count", "is_featured", "tags", "created_at", "updated_at") VALUES
	-- Sarah Mitchell's Tech Portfolio
	('11111111-1111-1111-1111-111111111111', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'My Development Setup', 'Photos of my home office setup, development environment, and tech gear. Sharing my workspace evolution over the years in Nelson.', 'my-development-setup', 'public', 'visible', 0, 8, 127, true, ARRAY['tech', 'workspace', 'setup'], '2025-03-15 10:30:00+00', '2025-06-20 14:15:00+00'),
	
	-- Dr. Emily's Healthcare Tech
	('22222222-2222-2222-2222-222222222222', 'a75a33d8-aa13-42a9-a246-3a5c8e5c838f', 'Healthcare Innovation in the Kootenays', 'Documenting the intersection of healthcare and technology in rural BC. Photos from telemedicine setups, health tech conferences, and innovative medical equipment.', 'healthcare-innovation-kootenays', 'public', 'visible', 0, 12, 89, true, ARRAY['healthcare', 'innovation', 'technology'], '2025-02-28 16:45:00+00', '2025-06-18 11:30:00+00'),
	
	-- Alex Thompson's Design Portfolio
	('33333333-3333-3333-3333-333333333333', '7131f030-4431-4dbf-816b-9cb4ebd2d54d', 'UI/UX Design Process', 'Behind-the-scenes look at my design process, from sketches to final products. Includes photos of whiteboard sessions, user research, and design thinking workshops.', 'ui-ux-design-process', 'public', 'visible', 0, 15, 156, false, ARRAY['design', 'process', 'ui', 'ux'], '2025-01-20 09:15:00+00', '2025-06-15 16:20:00+00'),
	
	-- Marcus Chen's Cloud Infrastructure
	('44444444-4444-4444-4444-444444444444', 'd0519096-9dd8-4397-b0bd-3dbb8cebdb39', 'Cloud Infrastructure Journey', 'Visual documentation of cloud architecture diagrams, server setups, and DevOps workflow improvements. A peek into the world of cloud computing.', 'cloud-infrastructure-journey', 'members_only', 'visible', 0, 6, 43, false, ARRAY['cloud', 'devops', 'infrastructure'], '2025-04-10 13:25:00+00', '2025-06-12 08:45:00+00'),
	
	-- Jennifer Walsh's Data Science
	('55555555-5555-5555-5555-555555555555', 'b62e36e4-11a4-4567-979e-3f3ebbc9232d', 'Environmental Data Visualization', 'Beautiful data visualizations and charts from environmental research projects. Combining art and science to tell stories about our planet.', 'environmental-data-visualization', 'public', 'visible', 0, 18, 234, true, ARRAY['data-science', 'environment', 'visualization'], '2025-02-05 11:50:00+00', '2025-06-22 09:30:00+00'),
	
	-- David Kim's Mobile Development
	('66666666-6666-6666-6666-666666666666', '8fa10942-4a64-4911-a45d-eb4996002302', 'Mobile App Prototypes', 'Screenshots and mockups from various mobile app projects. From initial wireframes to final app store screenshots.', 'mobile-app-prototypes', 'public', 'visible', 0, 22, 178, false, ARRAY['mobile', 'apps', 'prototypes'], '2025-03-22 14:30:00+00', '2025-06-19 12:10:00+00'),
	
	-- Lisa Park's Product Management
	('77777777-7777-7777-7777-777777777777', '1918195d-3aab-4a48-9999-f17e2a4f2ef9', 'Product Strategy Boards', 'Photos of strategic planning sessions, roadmap discussions, and user journey mapping workshops. The visual side of product management.', 'product-strategy-boards', 'members_only', 'visible', 0, 9, 67, false, ARRAY['product-management', 'strategy', 'planning'], '2025-04-18 10:20:00+00', '2025-06-14 15:40:00+00'),
	
	-- Amanda Foster's Marketing Campaigns
	('88888888-8888-8888-8888-888888888888', '4c6aca02-ccd6-46b6-ae8f-3969e32cb873', 'Creative Marketing Campaigns', 'Visual documentation of marketing campaigns, social media content creation, and brand photoshoots for various tech clients.', 'creative-marketing-campaigns', 'public', 'visible', 0, 14, 198, true, ARRAY['marketing', 'creative', 'campaigns'], '2025-01-30 12:40:00+00', '2025-06-21 10:25:00+00');

-- =====================================================
-- GALLERY PHOTOS (realistic tech/professional photos)
-- =====================================================

INSERT INTO "public"."gallery_photos" ("id", "gallery_id", "user_id", "file_name", "original_file_name", "file_size", "mime_type", "storage_path", "thumbnail_path", "medium_path", "title", "description", "alt_text", "caption", "width", "height", "location_name", "sort_order", "visibility", "processing_status", "view_count", "like_count", "comment_count", "moderation_status", "is_featured", "tags", "created_at", "updated_at") VALUES
	-- Sarah's Development Setup Photos
	('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'dual-monitor-setup.jpg', 'IMG_2024_dual_monitor_setup.jpg', 2547000, 'image/jpeg', 'galleries/sarah/dual-monitor-setup.jpg', 'galleries/sarah/thumbs/dual-monitor-setup.jpg', 'galleries/sarah/medium/dual-monitor-setup.jpg', 'Dual Monitor Development Setup', 'My home office setup with dual 4K monitors, perfect for coding and design work. The mountain view doesn''t hurt either!', 'Dual monitor computer setup with mountain view from window', 'Clean desk, clear mind - my daily workspace in Nelson', 3840, 2160, 'Nelson, BC', 0, 'visible', 'completed', 45, 12, 3, 'approved', true, ARRAY['workspace', 'monitors', 'office'], '2025-03-15 10:30:00+00', '2025-06-20 14:15:00+00'),
	
	('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'code-editor-screen.jpg', 'vscode_screenshot_2024.jpg', 1823000, 'image/jpeg', 'galleries/sarah/code-editor-screen.jpg', 'galleries/sarah/thumbs/code-editor-screen.jpg', 'galleries/sarah/medium/code-editor-screen.jpg', 'VS Code in Action', 'Screenshot of my VS Code setup with my favorite React project. Dark theme, of course!', 'VS Code editor showing React TypeScript code', 'Late night coding session on the new onboarding feature', 2560, 1440, 'Nelson, BC', 1, 'visible', 'completed', 32, 8, 1, 'approved', false, ARRAY['code', 'vscode', 'react'], '2025-03-16 22:15:00+00', '2025-06-19 09:30:00+00'),
	
	-- Dr. Emily's Healthcare Tech Photos
	('cccccccc-cccc-cccc-cccc-cccccccccccc', '22222222-2222-2222-2222-222222222222', 'a75a33d8-aa13-42a9-a246-3a5c8e5c838f', 'telemedicine-setup.jpg', 'telehealth_consultation_room.jpg', 3124000, 'image/jpeg', 'galleries/emily/telemedicine-setup.jpg', 'galleries/emily/thumbs/telemedicine-setup.jpg', 'galleries/emily/medium/telemedicine-setup.jpg', 'Telemedicine Consultation Room', 'State-of-the-art telemedicine setup allowing rural patients to connect with specialists in Vancouver. Technology bridging the healthcare gap.', 'Modern telemedicine room with large screen and medical equipment', 'Bringing world-class healthcare to the Kootenays', 4032, 3024, 'Nelson, BC', 0, 'visible', 'completed', 78, 15, 5, 'approved', true, ARRAY['telemedicine', 'healthcare', 'technology'], '2025-02-28 16:45:00+00', '2025-06-18 11:30:00+00'),
	
	-- Alex's Design Process Photos
	('dddddddd-dddd-dddd-dddd-dddddddddddd', '33333333-3333-3333-3333-333333333333', '7131f030-4431-4dbf-816b-9cb4ebd2d54d', 'whiteboard-session.jpg', 'design_thinking_workshop.jpg', 2890000, 'image/jpeg', 'galleries/alex/whiteboard-session.jpg', 'galleries/alex/thumbs/whiteboard-session.jpg', 'galleries/alex/medium/whiteboard-session.jpg', 'Design Thinking Workshop', 'Collaborative design session with the team, mapping out user journeys and brainstorming solutions for better user experience.', 'Whiteboard covered with sticky notes, sketches and user flow diagrams', 'When the best ideas come from getting everyone in the room', 3456, 2304, 'Nelson, BC', 0, 'visible', 'completed', 67, 11, 2, 'approved', false, ARRAY['design-thinking', 'workshop', 'collaboration'], '2025-01-20 09:15:00+00', '2025-06-15 16:20:00+00'),
	
	-- Marcus's Cloud Infrastructure
	('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '44444444-4444-4444-4444-444444444444', 'd0519096-9dd8-4397-b0bd-3dbb8cebdb39', 'aws-architecture-diagram.jpg', 'cloud_architecture_diagram_v3.jpg', 1567000, 'image/jpeg', 'galleries/marcus/aws-architecture-diagram.jpg', 'galleries/marcus/thumbs/aws-architecture-diagram.jpg', 'galleries/marcus/medium/aws-architecture-diagram.jpg', 'AWS Cloud Architecture', 'Comprehensive AWS architecture diagram for a scalable SaaS application. Load balancers, auto-scaling groups, and microservices all working in harmony.', 'Detailed cloud architecture diagram showing AWS services and connections', 'Months of planning condensed into one beautiful diagram', 2880, 1620, 'Castlegar, BC', 0, 'visible', 'completed', 23, 6, 1, 'approved', false, ARRAY['aws', 'architecture', 'cloud'], '2025-04-10 13:25:00+00', '2025-06-12 08:45:00+00'),
	
	-- Jennifer's Data Visualization
	('ffffffff-ffff-ffff-ffff-ffffffffffff', '55555555-5555-5555-5555-555555555555', 'b62e36e4-11a4-4567-979e-3f3ebbc9232d', 'climate-data-viz.jpg', 'kootenay_climate_trends_2024.jpg', 3456000, 'image/jpeg', 'galleries/jennifer/climate-data-viz.jpg', 'galleries/jennifer/thumbs/climate-data-viz.jpg', 'galleries/jennifer/medium/climate-data-viz.jpg', 'Kootenay Climate Trends Visualization', 'Beautiful data visualization showing climate trends in the Kootenay region over the past 50 years. Data tells a story when presented right.', 'Colorful data visualization showing temperature and precipitation trends', 'Making climate data accessible and beautiful', 4096, 2304, 'Nelson, BC', 0, 'visible', 'completed', 156, 28, 8, 'approved', true, ARRAY['data-visualization', 'climate', 'environment'], '2025-02-05 11:50:00+00', '2025-06-22 09:30:00+00'),
	
	-- David's Mobile App Screenshots
	('00000001-0001-0001-0001-000000000001', '66666666-6666-6666-6666-666666666666', '8fa10942-4a64-4911-a45d-eb4996002302', 'hiking-app-mockup.jpg', 'kootenay_trails_app_mockup.jpg', 2134000, 'image/jpeg', 'galleries/david/hiking-app-mockup.jpg', 'galleries/david/thumbs/hiking-app-mockup.jpg', 'galleries/david/medium/hiking-app-mockup.jpg', 'Kootenay Trails App Mockup', 'Mobile app design for discovering hiking trails in the Kootenays. Clean interface with beautiful photography and intuitive navigation.', 'Mobile app interface mockup showing trail discovery features', 'Bringing the outdoors to your phone', 1242, 2688, 'Kaslo, BC', 0, 'visible', 'completed', 89, 16, 4, 'approved', false, ARRAY['mobile-app', 'hiking', 'ui-design'], '2025-03-22 14:30:00+00', '2025-06-19 12:10:00+00'),
	
	-- Lisa's Product Strategy
	('00000002-0002-0002-0002-000000000002', '77777777-7777-7777-7777-777777777777', '1918195d-3aab-4a48-9999-f17e2a4f2ef9', 'product-roadmap-board.jpg', 'Q3_product_roadmap_session.jpg', 2678000, 'image/jpeg', 'galleries/lisa/product-roadmap-board.jpg', 'galleries/lisa/thumbs/product-roadmap-board.jpg', 'galleries/lisa/medium/product-roadmap-board.jpg', 'Q3 Product Roadmap Session', 'Strategic planning session for our Q3 product roadmap. Features, priorities, and user impact all mapped out on our planning board.', 'Product roadmap board with features, timelines and priority markers', 'Strategy becomes reality when the team aligns on priorities', 3840, 2160, 'Nelson, BC', 0, 'visible', 'completed', 34, 7, 2, 'approved', false, ARRAY['product-roadmap', 'strategy', 'planning'], '2025-04-18 10:20:00+00', '2025-06-14 15:40:00+00'),
	
	-- Amanda's Marketing Campaign
	('00000003-0003-0003-0003-000000000003', '88888888-8888-8888-8888-888888888888', '4c6aca02-ccd6-46b6-ae8f-3969e32cb873', 'brand-photoshoot.jpg', 'tech_startup_brand_shoot.jpg', 4123000, 'image/jpeg', 'galleries/amanda/brand-photoshoot.jpg', 'galleries/amanda/thumbs/brand-photoshoot.jpg', 'galleries/amanda/medium/brand-photoshoot.jpg', 'Tech Startup Brand Photoshoot', 'Behind-the-scenes from a brand photoshoot for a local tech startup. Capturing the innovative spirit and collaborative culture of Kootenay tech.', 'Professional brand photoshoot setup with lighting and tech props', 'Every brand has a story - we help tell it visually', 5760, 3840, 'Nelson, BC', 0, 'visible', 'completed', 112, 21, 6, 'approved', true, ARRAY['brand-photography', 'startup', 'marketing'], '2025-01-30 12:40:00+00', '2025-06-21 10:25:00+00');

-- Set cover photos for galleries
UPDATE user_galleries SET cover_photo_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' WHERE id = '11111111-1111-1111-1111-111111111111';
UPDATE user_galleries SET cover_photo_id = 'cccccccc-cccc-cccc-cccc-cccccccccccc' WHERE id = '22222222-2222-2222-2222-222222222222';
UPDATE user_galleries SET cover_photo_id = 'dddddddd-dddd-dddd-dddd-dddddddddddd' WHERE id = '33333333-3333-3333-3333-333333333333';
UPDATE user_galleries SET cover_photo_id = 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee' WHERE id = '44444444-4444-4444-4444-444444444444';
UPDATE user_galleries SET cover_photo_id = 'ffffffff-ffff-ffff-ffff-ffffffffffff' WHERE id = '55555555-5555-5555-5555-555555555555';
UPDATE user_galleries SET cover_photo_id = '00000001-0001-0001-0001-000000000001' WHERE id = '66666666-6666-6666-6666-666666666666';
UPDATE user_galleries SET cover_photo_id = '00000002-0002-0002-0002-000000000002' WHERE id = '77777777-7777-7777-7777-777777777777';
UPDATE user_galleries SET cover_photo_id = '00000003-0003-0003-0003-000000000003' WHERE id = '88888888-8888-8888-8888-888888888888';

-- =====================================================
-- PHOTO LIKES (realistic engagement patterns)
-- =====================================================

INSERT INTO "public"."photo_likes" ("id", "photo_id", "user_id", "created_at") VALUES
	-- Sarah's dual monitor setup (popular)
	('10000001-0001-0001-0001-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'd0519096-9dd8-4397-b0bd-3dbb8cebdb39', '2025-06-20 15:30:00+00'),
	('10000002-0002-0002-0002-000000000002', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '7131f030-4431-4dbf-816b-9cb4ebd2d54d', '2025-06-20 16:45:00+00'),
	('10000003-0003-0003-0003-000000000003', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '8fa10942-4a64-4911-a45d-eb4996002302', '2025-06-21 09:15:00+00'),
	('10000004-0004-0004-0004-000000000004', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'b62e36e4-11a4-4567-979e-3f3ebbc9232d', '2025-06-21 14:20:00+00'),
	
	-- Emily's telemedicine setup
	('10000005-0005-0005-0005-000000000005', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '2025-06-18 12:30:00+00'),
	('10000006-0006-0006-0006-000000000006', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '1918195d-3aab-4a48-9999-f17e2a4f2ef9', '2025-06-18 16:45:00+00'),
	('10000007-0007-0007-0007-000000000007', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '4c6aca02-ccd6-46b6-ae8f-3969e32cb873', '2025-06-19 10:20:00+00'),
	
	-- Jennifer's data visualization (very popular)
	('10000008-0008-0008-0008-000000000008', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '2025-06-22 10:15:00+00'),
	('10000009-0009-0009-0009-000000000009', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 'a75a33d8-aa13-42a9-a246-3a5c8e5c838f', '2025-06-22 11:30:00+00'),
	('10000010-0010-0010-0010-000000000010', 'ffffffff-ffff-ffff-ffff-ffffffffffff', '7131f030-4431-4dbf-816b-9cb4ebd2d54d', '2025-06-22 13:45:00+00'),
	('10000011-0011-0011-0011-000000000011', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 'd0519096-9dd8-4397-b0bd-3dbb8cebdb39', '2025-06-22 15:20:00+00'),
	('10000012-0012-0012-0012-000000000012', 'ffffffff-ffff-ffff-ffff-ffffffffffff', '1918195d-3aab-4a48-9999-f17e2a4f2ef9', '2025-06-22 16:10:00+00'),
	
	-- Amanda's brand photoshoot
	('10000013-0013-0013-0013-000000000013', '00000003-0003-0003-0003-000000000003', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '2025-06-21 11:30:00+00'),
	('10000014-0014-0014-0014-000000000014', '00000003-0003-0003-0003-000000000003', '7131f030-4431-4dbf-816b-9cb4ebd2d54d', '2025-06-21 14:15:00+00'),
	('10000015-0015-0015-0015-000000000015', '00000003-0003-0003-0003-000000000003', 'b62e36e4-11a4-4567-979e-3f3ebbc9232d', '2025-06-21 16:45:00+00');

-- =====================================================
-- PHOTO COMMENTS (thoughtful professional feedback)
-- =====================================================

INSERT INTO "public"."photo_comments" ("id", "photo_id", "user_id", "content", "moderation_status", "created_at") VALUES
	-- Comments on Sarah's setup
	('20000001-0001-0001-0001-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'd0519096-9dd8-4397-b0bd-3dbb8cebdb39', 'Love the clean setup! What monitor arms are you using? I''m looking to upgrade my own workspace.', 'approved', '2025-06-20 15:35:00+00'),
	('20000002-0002-0002-0002-000000000002', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '7131f030-4431-4dbf-816b-9cb4ebd2d54d', 'That mountain view is incredible! Makes me want to move my desk closer to the window.', 'approved', '2025-06-20 16:50:00+00'),
	
	-- Comments on Emily's telemedicine setup
	('20000003-0003-0003-0003-000000000003', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '1918195d-3aab-4a48-9999-f17e2a4f2ef9', 'This is amazing! How are you handling patient privacy and security with remote consultations?', 'approved', '2025-06-18 17:00:00+00'),
	('20000004-0004-0004-0004-000000000004', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'The impact this must have on rural healthcare access is huge. Great work bridging that gap!', 'approved', '2025-06-19 08:30:00+00'),
	
	-- Comments on Jennifer's data visualization
	('20000005-0005-0005-0005-000000000005', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 'a75a33d8-aa13-42a9-a246-3a5c8e5c838f', 'Absolutely beautiful way to present climate data. What tools did you use for this visualization?', 'approved', '2025-06-22 12:00:00+00'),
	('20000006-0006-0006-0006-000000000006', 'ffffffff-ffff-ffff-ffff-ffffffffffff', '7131f030-4431-4dbf-816b-9cb4ebd2d54d', 'The color palette really helps tell the story. Data visualization is truly an art form!', 'approved', '2025-06-22 14:30:00+00'),
	
	-- Comments on Amanda's brand shoot
	('20000007-0007-0007-0007-000000000007', '00000003-0003-0003-0003-000000000003', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'The lighting in this shot is perfect! Which local startup was this for?', 'approved', '2025-06-21 12:15:00+00'),
	('20000008-0008-0008-0008-000000000008', '00000003-0003-0003-0003-000000000003', 'b62e36e4-11a4-4567-979e-3f3ebbc9232d', 'Love seeing the behind-the-scenes process. Brand photography is such an important part of startup identity.', 'approved', '2025-06-21 17:20:00+00');

-- =====================================================
-- PHOTO PROMOTIONS (admin promotion workflow)
-- =====================================================

INSERT INTO "public"."photo_promotions" ("id", "photo_id", "promoted_by", "promotion_type", "promotion_status", "priority", "start_date", "end_date", "context_type", "review_notes", "impression_count", "click_count", "created_at", "updated_at") VALUES
	-- Homepage hero promotion for Jennifer's data viz
	('30000001-0001-0001-0001-000000000001', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'homepage_hero', 'active', 100, '2025-06-22 00:00:00+00', '2025-07-22 23:59:59+00', 'general', 'Perfect representation of our data-driven community. Beautiful and impactful.', 1247, 89, '2025-06-22 08:00:00+00', '2025-06-22 08:00:00+00'),
	
	-- Featured promotion for Emily's telemedicine
	('30000002-0002-0002-0002-000000000002', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'featured', 'active', 90, '2025-06-18 00:00:00+00', '2025-07-18 23:59:59+00', 'general', 'Showcases innovation in healthcare tech - perfect for our community image.', 567, 34, '2025-06-18 09:00:00+00', '2025-06-18 09:00:00+00'),
	
	-- Gallery cover promotion for Sarah's setup
	('30000003-0003-0003-0003-000000000003', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'gallery_cover', 'active', 80, '2025-06-20 00:00:00+00', '2025-08-20 23:59:59+00', 'page', 'Great example of remote work setup in the Kootenays.', 234, 12, '2025-06-20 10:00:00+00', '2025-06-20 10:00:00+00');

-- =====================================================
-- PAGE HEADERS (dynamic page headers with photos)
-- =====================================================

INSERT INTO "public"."page_headers" ("id", "page_slug", "photo_id", "title", "subtitle", "overlay_text", "overlay_position", "overlay_opacity", "text_color", "background_color", "darken_image", "priority", "is_active", "start_date", "end_date", "created_by", "created_at") VALUES
	-- Home page header with Jennifer's data viz
	('40000001-0001-0001-0001-000000000001', 'home', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 'Nelson Tech Community', 'Where Innovation Meets Nature', 'Connecting tech professionals in the heart of the Kootenays', 'center', 0.75, '#ffffff', '#1f2937', true, 100, true, '2025-06-22 00:00:00+00', '2025-12-31 23:59:59+00', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '2025-06-22 08:00:00+00'),
	
	-- About page header with Emily's telemedicine
	('40000002-0002-0002-0002-000000000002', 'about', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'About Us', 'Innovation in Healthcare Technology', 'Bridging the gap between healthcare and technology in rural BC', 'bottom-left', 0.80, '#ffffff', '#065f46', true, 90, true, '2025-06-18 00:00:00+00', '2025-12-31 23:59:59+00', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '2025-06-18 09:00:00+00'),
	
	-- Directory page header with Amanda's brand shoot
	('40000003-0003-0003-0003-000000000003', 'directory', '00000003-0003-0003-0003-000000000003', 'Member Directory', 'Meet Our Community', 'Discover talented tech professionals in the Kootenays', 'top-right', 0.70, '#ffffff', '#7c2d12', true, 80, true, '2025-06-21 00:00:00+00', '2025-12-31 23:59:59+00', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '2025-06-21 11:00:00+00');

COMMIT;

-- =====================================================
-- SUMMARY OF PHOTO GALLERY SEED DATA (FIXED)
-- =====================================================
-- Fixed UUID format issues and created comprehensive photo gallery demo data:
-- - 8 User galleries covering diverse tech disciplines
-- - 9 High-quality photos with realistic metadata (proper UUIDs)
-- - 15 Photo likes showing community engagement
-- - 8 Thoughtful comments with professional feedback
-- - 3 Photo promotions demonstrating admin workflow
-- - 3 Page headers with dynamic photo backgrounds
-- 
-- All UUIDs now use proper hexadecimal format:
-- - Changed invalid 'g', 'h', 'i' characters to valid hex digits
-- - Used sequential patterns for easy identification
-- - Maintained referential integrity throughout
-- =====================================================