-- =====================================================
-- OPPORTUNITY GALLERY RELATIONSHIPS SEED DATA
-- Creates sample gallery attachments to opportunities
-- =====================================================

BEGIN;

-- Set timezone for consistent timestamps
SET TIME ZONE 'America/Vancouver';

-- =====================================================
-- SAMPLE OPPORTUNITIES (for demonstration)
-- =====================================================

-- Insert some sample opportunities if they don't exist
INSERT INTO "public"."opportunities" ("id", "title", "description", "type", "location", "remote", "compensation", "deadline", "contact_email", "website", "organization", "posted_by", "status", "featured", "requirements", "responsibilities", "benefits", "created_at") VALUES
  -- Tech job opportunity showcasing development setup
  ('opp-00001-tech-job-nelson', 'Senior Full Stack Developer', 'Join our team to build innovative web applications for the tourism industry. We''re looking for someone passionate about creating scalable solutions and working in a collaborative environment.', 'job', 'Nelson, BC', true, '$90,000 - $120,000 CAD', '2025-07-15', 'careers@mountaintechsolutions.ca', 'https://mountaintechsolutions.ca', 'Mountain Tech Solutions', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'published', true, 
    ARRAY['5+ years React/TypeScript experience', 'Node.js backend development', 'Cloud platform experience (AWS/Azure)', 'Strong communication skills'],
    ARRAY['Develop and maintain web applications', 'Collaborate with design and product teams', 'Optimize for performance and scalability', 'Mentor junior developers'],
    ARRAY['Competitive salary', 'Remote work flexibility', 'Professional development budget', 'Health and dental coverage'],
    '2025-06-10 09:00:00+00'),

  -- Healthcare tech volunteer opportunity
  ('opp-00002-health-volunteer', 'Healthcare Tech Volunteer', 'Help us bridge the digital divide in rural healthcare by volunteering your technical skills. Work on telemedicine platforms and health data visualization projects that make a real difference in people''s lives.', 'volunteer', 'Nelson, BC', true, null, '2025-08-01', 'volunteer@kootenayhealthtech.org', 'https://kootenayhealthtech.org', 'Kootenay Health Tech Initiative', 'a75a33d8-aa13-42a9-a246-3a5c8e5c838f', 'published', true,
    ARRAY['Background in software development', 'Interest in healthcare applications', 'Availability for 5-10 hours per week', 'Team collaboration skills'],
    ARRAY['Develop telemedicine user interfaces', 'Create data visualization dashboards', 'Test and improve accessibility features', 'Document technical processes'],
    ARRAY['Portfolio project experience', 'Networking with healthcare professionals', 'Skills development in health tech', 'Community impact'],
    '2025-06-05 14:30:00+00'),

  -- Design consultancy opportunity
  ('opp-00003-design-contract', 'UX/UI Design Consultant', 'We need a talented designer to help redesign our customer portal and create a cohesive design system. This is a 3-month contract with potential for extension based on project success.', 'contract', 'Castlegar, BC', true, '$75-100/hour', '2025-07-30', 'projects@alpinesoftware.ca', 'https://alpinesoftware.ca', 'Alpine Software', '7131f030-4431-4dbf-816b-9cb4ebd2d54d', 'published', false,
    ARRAY['3+ years UX/UI design experience', 'Proficiency in Figma and design systems', 'Portfolio of B2B software projects', 'User research experience'],
    ARRAY['Redesign customer portal interface', 'Create comprehensive design system', 'Conduct user research and testing', 'Collaborate with development team'],
    ARRAY['Competitive hourly rate', 'Flexible working hours', 'Remote work options', 'Portfolio piece opportunity'],
    '2025-06-12 11:15:00+00'),

  -- Startup funding opportunity
  ('opp-00004-startup-funding', 'Tech Startup Seed Funding', 'Kootenay Innovation Fund is now accepting applications for our 2025 cohort. We provide seed funding, mentorship, and workspace for early-stage tech startups in the region.', 'funding', 'Multiple Locations', false, '$50,000 - $200,000', '2025-09-15', 'applications@kootenayinnovation.ca', 'https://kootenayinnovation.ca', 'Kootenay Innovation Fund', '4c6aca02-ccd6-46b6-ae8f-3969e32cb873', 'published', true,
    ARRAY['Tech startup in early stage', 'Founding team based in Kootenays', 'Scalable business model', 'Commitment to program participation'],
    ARRAY['Develop business plan and pitch', 'Participate in mentorship program', 'Attend weekly workshops', 'Present at demo day'],
    ARRAY['Seed funding up to $200K', 'Access to mentor network', 'Co-working space access', 'Marketing and PR support'],
    '2025-06-01 08:00:00+00')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- GALLERY ATTACHMENTS TO OPPORTUNITIES
-- =====================================================

INSERT INTO "public"."opportunity_galleries" ("id", "opportunity_id", "gallery_id", "display_order", "featured", "caption", "attached_by", "created_at") VALUES
  -- Senior Full Stack Developer opportunity showcases tech setups and development work
  ('att-001-tech-job-sarah-setup', 'opp-00001-tech-job-nelson', '11111111-1111-1111-1111-111111111111', 0, true, 'The kind of development environment we provide for our team members - dual monitors, ergonomic setup, and that inspiring mountain view!', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '2025-06-10 10:30:00+00'),
  
  ('att-002-tech-job-alex-design', 'opp-00001-tech-job-nelson', '33333333-3333-3333-3333-333333333333', 1, false, 'Our collaborative design process - we believe great software comes from close collaboration between developers and designers.', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '2025-06-10 10:45:00+00'),

  -- Healthcare volunteer opportunity showcases health tech innovation
  ('att-003-health-volunteer-emily', 'opp-00002-health-volunteer', '22222222-2222-2222-2222-222222222222', 0, true, 'Examples of the telemedicine technology you''ll be working on - making healthcare accessible to rural communities throughout the Kootenays.', 'a75a33d8-aa13-42a9-a246-3a5c8e5c838f', '2025-06-05 15:00:00+00'),
  
  ('att-004-health-volunteer-data', 'opp-00002-health-volunteer', '55555555-5555-5555-5555-555555555555', 1, false, 'Data visualization projects that help healthcare providers understand patient trends and improve care delivery.', 'a75a33d8-aa13-42a9-a246-3a5c8e5c838f', '2025-06-05 15:15:00+00'),

  -- Design consultant opportunity showcases design process and mobile work
  ('att-005-design-contract-alex', 'opp-00003-design-contract', '33333333-3333-3333-3333-333333333333', 0, true, 'Our design thinking methodology - workshops, user journey mapping, and collaborative ideation sessions.', '7131f030-4431-4dbf-816b-9cb4ebd2d54d', '2025-06-12 12:00:00+00'),
  
  ('att-006-design-contract-mobile', 'opp-00003-design-contract', '66666666-6666-6666-6666-666666666666', 1, false, 'Mobile app prototypes showing the kind of user experience design work you''ll be creating.', '7131f030-4431-4dbf-816b-9cb4ebd2d54d', '2025-06-12 12:15:00+00'),

  -- Startup funding opportunity showcases successful startups and marketing
  ('att-007-funding-marketing', 'opp-00004-startup-funding', '88888888-8888-8888-8888-888888888888', 0, true, 'Marketing and branding work from our previous cohort companies - we help startups tell their story professionally.', '4c6aca02-ccd6-46b6-ae8f-3969e32cb873', '2025-06-01 09:30:00+00'),
  
  ('att-008-funding-product', 'opp-00004-startup-funding', '77777777-7777-7777-7777-777777777777', 1, false, 'Product strategy sessions from our accelerator program - mentorship in action.', '4c6aca02-ccd6-46b6-ae8f-3969e32cb873', '2025-06-01 09:45:00+00'),
  
  ('att-009-funding-cloud', 'opp-00004-startup-funding', '44444444-4444-4444-4444-444444444444', 2, false, 'Technical infrastructure examples - cloud architecture and DevOps practices we teach in our program.', '4c6aca02-ccd6-46b6-ae8f-3969e32cb873', '2025-06-01 10:00:00+00');

COMMIT;

-- =====================================================
-- SUMMARY OF OPPORTUNITY GALLERY RELATIONSHIPS
-- =====================================================
-- Created realistic gallery attachments showing:
-- 
-- 🏢 Tech Job Opportunity (Mountain Tech Solutions):
--    • Sarah's development setup (featured) - showcases work environment
--    • Alex's design process - demonstrates collaboration
-- 
-- 🏥 Healthcare Volunteer (Kootenay Health Tech):
--    • Emily's telemedicine gallery (featured) - shows technology impact
--    • Jennifer's data visualization - demonstrates projects
-- 
-- 🎨 Design Contract (Alpine Software):
--    • Alex's design process (featured) - shows methodology
--    • David's mobile prototypes - demonstrates deliverables
-- 
-- 💰 Startup Funding (Kootenay Innovation Fund):
--    • Amanda's marketing campaigns (featured) - shows success stories
--    • Lisa's product strategy - demonstrates mentorship
--    • Marcus's cloud infrastructure - shows technical guidance
-- 
-- Each attachment includes contextual captions explaining how the
-- gallery relates to the opportunity, creating a rich storytelling
-- experience for potential applicants.
-- =====================================================