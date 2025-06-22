-- =====================================================
-- NEWSLETTER & CAMPAIGN SEED DATA FOR NELSON TECH COMMUNITY PLATFORM
-- Creates realistic newsletter subscriptions, templates, campaigns, and analytics
-- =====================================================

BEGIN;

-- Set timezone for consistent timestamps
SET TIME ZONE 'America/Vancouver';

-- =====================================================
-- NEWSLETTER SUBSCRIPTIONS (diverse subscriber base)
-- =====================================================

INSERT INTO "public"."newsletter_subscriptions" ("id", "email", "member_id", "status", "preferences", "subscription_token", "confirmation_token", "confirmed_at", "subscribed_at", "last_sent_at", "bounce_count", "created_at", "updated_at") VALUES
	-- Active community members (confirmed subscriptions)
	('sub-001', 'sarah.mitchell@techflow.com', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'active', '{"frequency": "weekly", "content_types": ["events", "news", "opportunities"], "format": "digest", "location_filter": true, "language": "en"}', 'token-sarah-001', NULL, '2025-03-15 11:00:00+00', '2025-03-15 10:30:00+00', '2025-06-15 09:00:00+00', 0, '2025-03-15 10:30:00+00', '2025-06-15 09:00:00+00'),
	
	('sub-002', 'marcus@cloudpeak.tech', 'd0519096-9dd8-4397-b0bd-3dbb8cebdb39', 'active', '{"frequency": "bi-weekly", "content_types": ["events", "opportunities", "marketplace"], "format": "digest", "location_filter": true, "language": "en"}', 'token-marcus-002', NULL, '2025-02-20 14:30:00+00', '2025-02-20 14:15:00+00', '2025-06-08 09:00:00+00', 0, '2025-02-20 14:15:00+00', '2025-06-08 09:00:00+00'),
	
	('sub-003', 'emily@healthtechinnovations.ca', 'a75a33d8-aa13-42a9-a246-3a5c8e5c838f', 'active', '{"frequency": "weekly", "content_types": ["events", "news", "opportunities", "marketplace"], "format": "digest", "location_filter": false, "language": "en"}', 'token-emily-003', NULL, '2025-01-25 16:45:00+00', '2025-01-25 16:30:00+00', '2025-06-15 09:00:00+00', 0, '2025-01-25 16:30:00+00', '2025-06-15 09:00:00+00'),
	
	('sub-004', 'david@mobiletechstudio.com', '8fa10942-4a64-4911-a45d-eb4996002302', 'active', '{"frequency": "weekly", "content_types": ["events", "opportunities"], "format": "digest", "location_filter": true, "language": "en"}', 'token-david-004', NULL, '2025-03-25 12:20:00+00', '2025-03-25 12:05:00+00', '2025-06-15 09:00:00+00', 0, '2025-03-25 12:05:00+00', '2025-06-15 09:00:00+00'),
	
	('sub-005', 'jennifer@datawiseanalytics.com', 'b62e36e4-11a4-4567-979e-3f3ebbc9232d', 'active', '{"frequency": "weekly", "content_types": ["events", "news", "marketplace"], "format": "detailed", "location_filter": false, "language": "en"}', 'token-jennifer-005', NULL, '2025-02-10 09:30:00+00', '2025-02-10 09:15:00+00', '2025-06-15 09:00:00+00', 0, '2025-02-10 09:15:00+00', '2025-06-15 09:00:00+00'),
	
	('sub-006', 'alex@designcollective.ca', '7131f030-4431-4dbf-816b-9cb4ebd2d54d', 'active', '{"frequency": "weekly", "content_types": ["events", "marketplace"], "format": "digest", "location_filter": true, "language": "en"}', 'token-alex-006', NULL, '2025-01-15 15:45:00+00', '2025-01-15 15:30:00+00', '2025-06-15 09:00:00+00', 0, '2025-01-15 15:30:00+00', '2025-06-15 09:00:00+00'),
	
	('sub-007', 'lisa@productflow.ca', '1918195d-3aab-4a48-9999-f17e2a4f2ef9', 'active', '{"frequency": "weekly", "content_types": ["events", "news", "opportunities"], "format": "digest", "location_filter": true, "language": "en"}', 'token-lisa-007', NULL, '2025-04-20 11:15:00+00', '2025-04-20 11:00:00+00', '2025-06-15 09:00:00+00', 0, '2025-04-20 11:00:00+00', '2025-06-15 09:00:00+00'),
	
	('sub-008', 'amanda@growthmarketingco.ca', '4c6aca02-ccd6-46b6-ae8f-3969e32cb873', 'active', '{"frequency": "bi-weekly", "content_types": ["events", "news", "marketplace"], "format": "detailed", "location_filter": true, "language": "en"}', 'token-amanda-008', NULL, '2025-02-05 13:30:00+00', '2025-02-05 13:15:00+00', '2025-06-08 09:00:00+00', 0, '2025-02-05 13:15:00+00', '2025-06-08 09:00:00+00'),
	
	-- Non-member subscribers (email only)
	('sub-009', 'john.developer@gmail.com', NULL, 'active', '{"frequency": "weekly", "content_types": ["events", "opportunities"], "format": "digest", "location_filter": true, "language": "en"}', 'token-john-009', NULL, '2025-04-15 10:20:00+00', '2025-04-15 10:05:00+00', '2025-06-15 09:00:00+00', 0, '2025-04-15 10:05:00+00', '2025-06-15 09:00:00+00'),
	
	('sub-010', 'maria.gonzalez@techstartup.ca', NULL, 'active', '{"frequency": "weekly", "content_types": ["events", "news", "opportunities", "marketplace"], "format": "digest", "location_filter": false, "language": "en"}', 'token-maria-010', NULL, '2025-05-10 14:45:00+00', '2025-05-10 14:30:00+00', '2025-06-15 09:00:00+00', 0, '2025-05-10 14:30:00+00', '2025-06-15 09:00:00+00'),
	
	('sub-011', 'tech.recruiter@kootenaycompany.com', NULL, 'active', '{"frequency": "bi-weekly", "content_types": ["opportunities", "events"], "format": "digest", "location_filter": true, "language": "en"}', 'token-recruiter-011', NULL, '2025-03-30 16:20:00+00', '2025-03-30 16:05:00+00', '2025-06-08 09:00:00+00', 0, '2025-03-30 16:05:00+00', '2025-06-08 09:00:00+00'),
	
	-- Pending confirmation
	('sub-012', 'newbie@startup.co', NULL, 'pending', '{"frequency": "weekly", "content_types": ["events", "news"], "format": "digest", "location_filter": true, "language": "en"}', 'token-newbie-012', 'confirm-newbie-012', NULL, '2025-06-20 12:30:00+00', NULL, 0, '2025-06-20 12:30:00+00', '2025-06-20 12:30:00+00'),
	
	-- Unsubscribed (for analytics)
	('sub-013', 'former.member@company.com', NULL, 'unsubscribed', '{"frequency": "weekly", "content_types": ["events"], "format": "digest", "location_filter": true, "language": "en"}', 'token-former-013', NULL, '2025-01-05 09:15:00+00', '2025-01-05 09:00:00+00', '2025-04-15 09:00:00+00', 0, '2025-01-05 09:00:00+00', '2025-04-20 14:30:00+00');

-- =====================================================
-- NEWSLETTER TEMPLATES (enhanced templates)
-- =====================================================

INSERT INTO "public"."newsletter_templates" ("id", "name", "description", "type", "template_content", "default_settings", "preview_image", "is_active", "created_at", "updated_at") VALUES
	-- Community Digest Template
	('template-001', 'Kootenay Tech Weekly Digest', 'Comprehensive weekly newsletter featuring events, news, opportunities, and community highlights', 'mjml', 
	'<mjml>
	  <mj-head>
	    <mj-title>Kootenay Tech Weekly Digest</mj-title>
	    <mj-font name="Lato" href="https://fonts.googleapis.com/css?family=Lato:300,400,500,700" />
	    <mj-attributes>
	      <mj-all font-family="Lato, Helvetica, Arial, sans-serif" />
	      <mj-text font-size="16px" color="#2D3748" line-height="1.6" />
	      <mj-section background-color="#ffffff" />
	    </mj-attributes>
	  </mj-head>
	  <mj-body background-color="#F7FAFC">
	    <!-- Header -->
	    <mj-section background-color="#2B6CB0" padding="20px 0">
	      <mj-column>
	        <mj-text align="center" color="#FFFFFF" font-size="28px" font-weight="bold">
	          Kootenay Tech Community
	        </mj-text>
	        <mj-text align="center" color="#E2E8F0" font-size="16px">
	          Weekly Community Digest
	        </mj-text>
	      </mj-column>
	    </mj-section>
	    <!-- Content sections will be dynamically populated -->
	  </mj-body>
	</mjml>', 
	'{"header_color": "#2B6CB0", "accent_color": "#3182CE", "text_color": "#2D3748", "background_color": "#F7FAFC"}', 
	'https://placehold.co/600x400/2B6CB0/ffffff?text=Weekly+Digest', 
	true, '2025-01-10 09:00:00+00', '2025-06-01 14:30:00+00'),
	
	-- Event Announcement Template
	('template-002', 'Event Spotlight', 'Focused template for highlighting single events or workshops', 'mjml',
	'<mjml>
	  <mj-head>
	    <mj-title>Event Spotlight</mj-title>
	    <mj-font name="Lato" href="https://fonts.googleapis.com/css?family=Lato:300,400,500,700" />
	  </mj-head>
	  <mj-body background-color="#F7FAFC">
	    <mj-section background-color="#16A085" padding="30px 0">
	      <mj-column>
	        <mj-text align="center" color="#FFFFFF" font-size="32px" font-weight="bold">
	          Don''t Miss This Event!
	        </mj-text>
	      </mj-column>
	    </mj-section>
	  </mj-body>
	</mjml>',
	'{"header_color": "#16A085", "accent_color": "#1ABC9C", "text_color": "#2D3748"}',
	'https://placehold.co/600x400/16A085/ffffff?text=Event+Spotlight',
	true, '2025-01-10 09:30:00+00', '2025-06-01 14:30:00+00'),
	
	-- Welcome Email Template
	('template-003', 'Welcome to the Community', 'Warm welcome email for new subscribers and members', 'mjml',
	'<mjml>
	  <mj-head>
	    <mj-title>Welcome to Kootenay Tech</mj-title>
	  </mj-head>
	  <mj-body background-color="#F7FAFC">
	    <mj-section background-color="#7C3AED" padding="40px 0">
	      <mj-column>
	        <mj-text align="center" color="#FFFFFF" font-size="36px" font-weight="bold">
	          Welcome to the Community!
	        </mj-text>
	        <mj-text align="center" color="#E2E8F0" font-size="18px">
	          We''re excited to have you join the Kootenay tech ecosystem
	        </mj-text>
	      </mj-column>
	    </mj-section>
	  </mj-body>
	</mjml>',
	'{"header_color": "#7C3AED", "accent_color": "#8B5CF6", "text_color": "#2D3748"}',
	'https://placehold.co/600x400/7C3AED/ffffff?text=Welcome',
	true, '2025-01-10 10:00:00+00', '2025-06-01 14:30:00+00'),
	
	-- Monthly Roundup Template
	('template-004', 'Monthly Community Roundup', 'Comprehensive monthly summary of community achievements and highlights', 'mjml',
	'<mjml>
	  <mj-head>
	    <mj-title>Monthly Roundup</mj-title>
	  </mj-head>
	  <mj-body background-color="#F7FAFC">
	    <mj-section background-color="#DC2626" padding="30px 0">
	      <mj-column>
	        <mj-text align="center" color="#FFFFFF" font-size="30px" font-weight="bold">
	          Monthly Community Roundup
	        </mj-text>
	      </mj-column>
	    </mj-section>
	  </mj-body>
	</mjml>',
	'{"header_color": "#DC2626", "accent_color": "#EF4444", "text_color": "#2D3748"}',
	'https://placehold.co/600x400/DC2626/ffffff?text=Monthly+Roundup',
	true, '2025-01-10 10:30:00+00', '2025-06-01 14:30:00+00');

-- =====================================================
-- NEWSLETTER CAMPAIGNS (recent and upcoming campaigns)
-- =====================================================

INSERT INTO "public"."newsletter_campaigns" ("id", "title", "subject", "template_id", "template_data", "content", "custom_message", "branding", "status", "send_type", "scheduled_at", "sent_at", "recipient_count", "delivery_stats", "created_by", "created_at", "updated_at") VALUES
	-- Recently sent weekly digest
	('campaign-001', 'Weekly Digest - June 15, 2025', '🚀 This Week in Kootenay Tech: AI Summit, New Opportunities & More!', 'template-001', 
	'{"header_image": "https://placehold.co/600x200/2B6CB0/ffffff?text=June+15+Digest", "issue_number": "2025-024"}',
	'{
		"events": [
			{"title": "AI & Machine Learning Summit 2025", "date": "2025-07-15", "location": "Nelson Community Centre"},
			{"title": "Full Stack Web Development Workshop", "date": "2025-07-22", "location": "Selkirk College"}
		],
		"news": [
			{"title": "Kootenay Region Sees 40% Growth in Tech Startups", "excerpt": "Local entrepreneurs choosing quality of life"},
			{"title": "DataWise Analytics Receives Environmental Innovation Award", "excerpt": "Recognition for environmental monitoring contributions"}
		],
		"opportunities": [
			{"title": "Senior React Developer", "company": "TechFlow Solutions", "type": "full-time"},
			{"title": "Data Scientist - Environmental Projects", "company": "DataWise Analytics", "type": "contract"}
		]
	}',
	'This week has been incredible for our community! From exciting new startup announcements to innovative environmental data projects, the Kootenays continue to prove that great tech innovation happens outside major cities.',
	'{"primary_color": "#2B6CB0", "secondary_color": "#64748B", "logo_url": "https://placehold.co/150x50/2B6CB0/ffffff?text=KTC", "header_image": "https://placehold.co/600x200/2B6CB0/ffffff?text=Kootenay+Tech", "footer_text": "Connecting tech professionals in the heart of the Kootenays", "social_links": [{"platform": "linkedin", "url": "https://linkedin.com/company/kootenay-tech"}, {"platform": "twitter", "url": "https://twitter.com/kootenaytech"}]}',
	'sent', 'scheduled', '2025-06-15 09:00:00+00', '2025-06-15 09:05:00+00', 11, 
	'{"sent": 11, "delivered": 11, "bounced": 0, "opened": 8, "clicked": 5}',
	'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '2025-06-14 16:30:00+00', '2025-06-15 09:05:00+00'),
	
	-- AI Summit promotion campaign
	('campaign-002', 'AI & Machine Learning Summit 2025 - Registration Open!', '🤖 Don''t Miss the AI Summit - Early Bird Pricing Ends Soon!', 'template-002',
	'{"event_image": "https://placehold.co/600x300/16A085/ffffff?text=AI+Summit+2025", "cta_color": "#1ABC9C"}',
	'{
		"event": {
			"title": "AI & Machine Learning Summit 2025",
			"date": "July 15, 2025",
			"time": "9:00 AM - 5:00 PM",
			"location": "Nelson Community Centre",
			"description": "Join industry experts for insights on cutting-edge AI technologies and applications",
			"speakers": ["Dr. Sarah Chen - UBC AI Research", "Marcus Rodriguez - Microsoft AI", "Jennifer Walsh - DataWise Analytics"],
			"registration_url": "https://nelsontech.ai-summit.com",
			"early_bird_deadline": "June 30, 2025"
		}
	}',
	'We''re thrilled to announce that registration is now open for our biggest event of the year! This summit brings together the brightest minds in AI and machine learning for a day of learning, networking, and inspiration.',
	'{"primary_color": "#16A085", "secondary_color": "#1ABC9C", "logo_url": "https://placehold.co/150x50/16A085/ffffff?text=AI+Summit", "header_image": "https://placehold.co/600x200/16A085/ffffff?text=AI+ML+Summit+2025"}',
	'sent', 'manual', NULL, '2025-06-08 14:20:00+00', 9,
	'{"sent": 9, "delivered": 9, "bounced": 0, "opened": 7, "clicked": 6}',
	'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '2025-06-08 13:45:00+00', '2025-06-08 14:20:00+00'),
	
	-- Upcoming weekly digest (scheduled)
	('campaign-003', 'Weekly Digest - June 22, 2025', '🌟 Community Spotlight: Photo Galleries, New Members & Startup Pitch Night', 'template-001',
	'{"header_image": "https://placehold.co/600x200/2B6CB0/ffffff?text=June+22+Digest", "issue_number": "2025-025"}',
	'{
		"events": [
			{"title": "Startup Pitch Night - Q3 2025", "date": "2025-07-29", "location": "Hume Hotel & Spa"},
			{"title": "Cybersecurity Best Practices Webinar", "date": "2025-08-05", "location": "Online Event"}
		],
		"features": [
			{"title": "New Photo Galleries Feature", "description": "Members can now showcase their work and projects"},
			{"title": "Member Spotlight: Jennifer Walsh", "description": "Environmental data visualization expert"}
		],
		"opportunities": [
			{"title": "Product Manager - B2B SaaS", "company": "ProductFlow Inc", "type": "full-time"},
			{"title": "Junior Backend Developer", "company": "SystemsCore Technologies", "type": "full-time"}
		]
	}',
	'Exciting updates this week! We''ve launched our new photo galleries feature, allowing members to showcase their projects and workspaces. Plus, don''t miss the upcoming Startup Pitch Night - it''s going to be amazing!',
	'{"primary_color": "#2B6CB0", "secondary_color": "#64748B", "logo_url": "https://placehold.co/150x50/2B6CB0/ffffff?text=KTC", "header_image": "https://placehold.co/600x200/2B6CB0/ffffff?text=Kootenay+Tech"}',
	'scheduled', 'scheduled', '2025-06-22 09:00:00+00', NULL, 12,
	'{"sent": 0, "delivered": 0, "bounced": 0, "opened": 0, "clicked": 0}',
	'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '2025-06-21 15:30:00+00', '2025-06-21 15:30:00+00'),
	
	-- Welcome campaign (automated)
	('campaign-004', 'Welcome to Kootenay Tech Community!', '👋 Welcome! Here''s how to get the most out of our community', 'template-003',
	'{"welcome_image": "https://placehold.co/600x300/7C3AED/ffffff?text=Welcome+to+KTC"}',
	'{
		"welcome_message": "We''re excited to have you join our growing community of tech professionals in the Kootenays!",
		"getting_started": [
			{"step": "Complete your profile", "description": "Tell us about your tech background and interests"},
			{"step": "Join relevant groups", "description": "Connect with others in your field or area of interest"},
			{"step": "Attend an event", "description": "Meet the community in person at our next gathering"}
		],
		"featured_resources": [
			{"title": "Community Guidelines", "url": "https://nelsontech.ca/guidelines"},
			{"title": "Upcoming Events", "url": "https://nelsontech.ca/events"},
			{"title": "Member Directory", "url": "https://nelsontech.ca/directory"}
		]
	}',
	'Welcome to the most vibrant tech community in the Kootenays! We''re here to help you connect, learn, and grow alongside fellow professionals who''ve chosen this incredible region for both career and lifestyle.',
	'{"primary_color": "#7C3AED", "secondary_color": "#8B5CF6", "logo_url": "https://placehold.co/150x50/7C3AED/ffffff?text=Welcome"}',
	'sent', 'automated', NULL, '2025-06-20 13:15:00+00', 1,
	'{"sent": 1, "delivered": 1, "bounced": 0, "opened": 1, "clicked": 0}',
	'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '2025-06-20 13:00:00+00', '2025-06-20 13:15:00+00'),
	
	-- Draft monthly roundup
	('campaign-005', 'June 2025 Community Roundup', '📊 June Highlights: Record Growth, Major Achievements & Looking Ahead', 'template-004',
	'{"month": "June 2025", "hero_image": "https://placehold.co/600x300/DC2626/ffffff?text=June+2025+Roundup"}',
	'{
		"statistics": {
			"new_members": 12,
			"events_held": 3,
			"job_placements": 5,
			"startup_launches": 2
		},
		"achievements": [
			{"title": "DataWise Analytics Environmental Award", "description": "Recognition for innovative environmental monitoring solutions"},
			{"title": "Community Platform Launch", "description": "Our new platform officially launched with amazing member response"},
			{"title": "Record Event Attendance", "description": "AI Summit registrations exceeded expectations by 200%"}
		],
		"looking_ahead": [
			{"month": "July", "highlights": "AI Summit, Startup Pitch Night, Summer Networking Events"},
			{"month": "August", "highlights": "Data Science Bootcamp, Cybersecurity Workshop Series"}
		]
	}',
	'What an incredible month June has been for our community! From launching our new platform to celebrating major member achievements, we''re seeing unprecedented growth and engagement.',
	'{"primary_color": "#DC2626", "secondary_color": "#EF4444", "logo_url": "https://placehold.co/150x50/DC2626/ffffff?text=Roundup"}',
	'draft', 'manual', NULL, NULL, 0,
	'{"sent": 0, "delivered": 0, "bounced": 0, "opened": 0, "clicked": 0}',
	'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '2025-06-22 10:00:00+00', '2025-06-22 10:00:00+00');

-- =====================================================
-- NEWSLETTER CONTENT RULES (enhanced automation rules)
-- =====================================================

INSERT INTO "public"."newsletter_content_rules" ("id", "name", "description", "content_type", "selection_criteria", "max_items", "priority", "is_active", "created_at", "updated_at") VALUES
	-- Event-focused rules
	('rule-001', 'Upcoming Featured Events', 'Select upcoming featured events for the next 3 weeks', 'events', 
	'{"status": "published", "date_filter": "upcoming", "max_weeks_ahead": 3, "featured_only": true, "sort_by": "date"}', 
	3, 100, true, '2025-01-10 09:00:00+00', '2025-06-01 14:30:00+00'),
	
	('rule-002', 'All Upcoming Events', 'Include all upcoming events within 2 weeks', 'events',
	'{"status": "published", "date_filter": "upcoming", "max_weeks_ahead": 2, "sort_by": "date"}',
	5, 90, true, '2025-01-10 09:15:00+00', '2025-06-01 14:30:00+00'),
	
	-- News content rules
	('rule-003', 'Latest Community News', 'Recent news articles from the past week', 'news',
	'{"status": "published", "date_filter": "recent", "max_days_old": 7, "featured_first": true}',
	3, 85, true, '2025-01-10 09:30:00+00', '2025-06-01 14:30:00+00'),
	
	('rule-004', 'Featured News Stories', 'Important featured news regardless of date', 'news',
	'{"status": "published", "featured_only": true, "max_days_old": 30}',
	2, 80, true, '2025-01-10 09:45:00+00', '2025-06-01 14:30:00+00'),
	
	-- Opportunities and jobs
	('rule-005', 'Active Job Opportunities', 'Current job and volunteer opportunities', 'opportunities',
	'{"status": "active", "date_filter": "recent", "max_days_old": 21, "location_filter": "kootenays"}',
	4, 75, true, '2025-01-10 10:00:00+00', '2025-06-01 14:30:00+00'),
	
	('rule-006', 'High-Priority Opportunities', 'Featured or urgent opportunities', 'opportunities',
	'{"status": "active", "featured_first": true, "priority": "high"}',
	2, 85, true, '2025-01-10 10:15:00+00', '2025-06-01 14:30:00+00'),
	
	-- Member and community highlights
	('rule-007', 'New Featured Members', 'Recently joined or featured community members', 'members',
	'{"featured_first": true, "new_members": true, "max_days_old": 14, "status": "published"}',
	3, 70, true, '2025-01-10 10:30:00+00', '2025-06-01 14:30:00+00'),
	
	('rule-008', 'Member Achievements', 'Members with recent achievements or updates', 'members',
	'{"recent_updates": true, "achievements": true, "max_days_old": 30}',
	2, 65, true, '2025-01-10 10:45:00+00', '2025-06-01 14:30:00+00'),
	
	-- Marketplace content
	('rule-009', 'Featured Marketplace Items', 'Highlighted products and services', 'marketplace',
	'{"status": "published", "featured_first": true, "max_days_old": 14}',
	3, 60, true, '2025-01-10 11:00:00+00', '2025-06-01 14:30:00+00'),
	
	('rule-010', 'New Marketplace Listings', 'Recently added marketplace items', 'marketplace',
	'{"status": "published", "date_filter": "recent", "max_days_old": 7}',
	5, 55, true, '2025-01-10 11:15:00+00', '2025-06-01 14:30:00+00');

-- =====================================================
-- NEWSLETTER ANALYTICS (realistic engagement data)
-- =====================================================

INSERT INTO "public"."newsletter_analytics" ("id", "campaign_id", "subscription_id", "event_type", "event_data", "postmark_message_id", "occurred_at", "ip_address", "user_agent") VALUES
	-- Analytics for June 15 Weekly Digest (campaign-001)
	('analytics-001', 'campaign-001', 'sub-001', 'sent', '{"message_size": 45678}', 'pm-001-sarah', '2025-06-15 09:05:00+00', '192.168.1.100', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'),
	('analytics-002', 'campaign-001', 'sub-001', 'delivered', '{}', 'pm-001-sarah', '2025-06-15 09:05:30+00', NULL, NULL),
	('analytics-003', 'campaign-001', 'sub-001', 'opened', '{"open_location": "Nelson, BC"}', 'pm-001-sarah', '2025-06-15 10:30:00+00', '192.168.1.100', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'),
	('analytics-004', 'campaign-001', 'sub-001', 'clicked', '{"link_clicked": "AI Summit Registration", "click_position": 3}', 'pm-001-sarah', '2025-06-15 10:32:00+00', '192.168.1.100', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'),
	
	('analytics-005', 'campaign-001', 'sub-002', 'sent', '{"message_size": 45678}', 'pm-001-marcus', '2025-06-15 09:05:00+00', '192.168.1.101', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'),
	('analytics-006', 'campaign-001', 'sub-002', 'delivered', '{}', 'pm-001-marcus', '2025-06-15 09:05:45+00', NULL, NULL),
	('analytics-007', 'campaign-001', 'sub-002', 'opened', '{"open_location": "Castlegar, BC"}', 'pm-001-marcus', '2025-06-15 14:20:00+00', '192.168.1.101', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'),
	
	-- Analytics for AI Summit campaign (campaign-002)
	('analytics-008', 'campaign-002', 'sub-003', 'sent', '{"message_size": 32145}', 'pm-002-emily', '2025-06-08 14:20:00+00', '192.168.1.102', 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)'),
	('analytics-009', 'campaign-002', 'sub-003', 'delivered', '{}', 'pm-002-emily', '2025-06-08 14:20:15+00', NULL, NULL),
	('analytics-010', 'campaign-002', 'sub-003', 'opened', '{"open_location": "Nelson, BC"}', 'pm-002-emily', '2025-06-08 16:45:00+00', '192.168.1.102', 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)'),
	('analytics-011', 'campaign-002', 'sub-003', 'clicked', '{"link_clicked": "Register Now", "click_position": 1}', 'pm-002-emily', '2025-06-08 16:47:00+00', '192.168.1.102', 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)'),
	
	('analytics-012', 'campaign-002', 'sub-005', 'sent', '{"message_size": 32145}', 'pm-002-jennifer', '2025-06-08 14:20:00+00', '192.168.1.103', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'),
	('analytics-013', 'campaign-002', 'sub-005', 'delivered', '{}', 'pm-002-jennifer', '2025-06-08 14:20:30+00', NULL, NULL),
	('analytics-014', 'campaign-002', 'sub-005', 'opened', '{"open_location": "Nelson, BC"}', 'pm-002-jennifer', '2025-06-08 18:30:00+00', '192.168.1.103', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'),
	('analytics-015', 'campaign-002', 'sub-005', 'clicked', '{"link_clicked": "Speaker Bio - Jennifer Walsh", "click_position": 5}', 'pm-002-jennifer', '2025-06-08 18:32:00+00', '192.168.1.103', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'),
	
	-- Analytics for Welcome campaign (campaign-004)
	('analytics-016', 'campaign-004', 'sub-012', 'sent', '{"message_size": 28934}', 'pm-004-newbie', '2025-06-20 13:15:00+00', '192.168.1.104', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'),
	('analytics-017', 'campaign-004', 'sub-012', 'delivered', '{}', 'pm-004-newbie', '2025-06-20 13:15:20+00', NULL, NULL),
	('analytics-018', 'campaign-004', 'sub-012', 'opened', '{"open_location": "Vancouver, BC"}', 'pm-004-newbie', '2025-06-20 15:45:00+00', '192.168.1.104', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)');

-- =====================================================
-- NEWSLETTER CONTENT CACHE (performance optimization)
-- =====================================================

INSERT INTO "public"."newsletter_content_cache" ("id", "content_type", "date_range_start", "date_range_end", "content", "generated_at", "expires_at") VALUES
	-- Cached events for this week
	('cache-001', 'events', '2025-06-22', '2025-06-29', 
	'[
		{"id": "11111111-1111-1111-1111-111111111111", "title": "AI & Machine Learning Summit 2025", "date": "2025-07-15", "location": "Nelson Community Centre", "featured": true},
		{"id": "22222222-2222-2222-2222-222222222222", "title": "Full Stack Web Development Workshop", "date": "2025-07-22", "location": "Selkirk College", "featured": false}
	]', 
	'2025-06-22 08:00:00+00', '2025-06-23 08:00:00+00'),
	
	-- Cached news for this week
	('cache-002', 'news', '2025-06-15', '2025-06-22',
	'[
		{"id": "550e8400-e29b-41d4-a716-446655442001", "title": "Kootenay Region Sees 40% Growth in Tech Startups", "featured": true, "publish_date": "2025-06-21"},
		{"id": "550e8400-e29b-41d4-a716-446655442002", "title": "DataWise Analytics Receives Environmental Innovation Award", "featured": true, "publish_date": "2025-06-19"}
	]',
	'2025-06-22 08:15:00+00', '2025-06-23 08:15:00+00'),
	
	-- Cached opportunities
	('cache-003', 'opportunities', '2025-06-08', '2025-06-29',
	'[
		{"id": "750e8400-e29b-41d4-a716-446655444001", "title": "Senior React Developer", "company": "TechFlow Solutions", "type": "full-time", "featured": true},
		{"id": "750e8400-e29b-41d4-a716-446655444003", "title": "Product Manager - B2B SaaS", "company": "ProductFlow Inc", "type": "full-time", "featured": true},
		{"id": "750e8400-e29b-41d4-a716-446655444004", "title": "Data Scientist - Environmental Projects", "company": "DataWise Analytics", "type": "contract", "featured": true}
	]',
	'2025-06-22 08:30:00+00', '2025-06-23 08:30:00+00');

COMMIT;

-- =====================================================
-- SUMMARY OF NEWSLETTER & CAMPAIGN SEED DATA
-- =====================================================
-- Created comprehensive newsletter and campaign demo data:
-- - 13 Newsletter subscriptions with diverse preferences and statuses
-- - 4 Professional email templates for different campaign types
-- - 5 Newsletter campaigns covering various scenarios (sent, scheduled, draft)
-- - 10 Content automation rules for intelligent newsletter curation
-- - 18 Analytics records showing realistic engagement patterns
-- - 3 Content cache entries for performance optimization
-- 
-- Newsletter features demonstrated:
-- - Active community member subscriptions with various preferences
-- - Professional email templates with MJML markup
-- - Comprehensive campaign management (manual, scheduled, automated)
-- - Detailed analytics tracking for engagement metrics
-- - Content automation rules for intelligent newsletter assembly
-- - Performance optimization through content caching
-- - Various email types: digests, event announcements, welcome emails
-- 
-- Analytics show realistic engagement:
-- - Open rates: ~70-80% (excellent for tech community)
-- - Click rates: ~60-80% of opens (highly engaged audience)
-- - Geographic distribution across Kootenay region
-- - Multiple device types and browsers
-- - Detailed event tracking for optimization
-- =====================================================