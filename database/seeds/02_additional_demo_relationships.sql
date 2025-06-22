-- =====================================================
-- ADDITIONAL DEMO RELATIONSHIPS FOR NELSON TECH PLATFORM
-- This file adds event registrations, resource interactions, and other relationships
-- =====================================================

BEGIN;

-- =====================================================
-- EVENT REGISTRATIONS (realistic attendance patterns)
-- =====================================================

INSERT INTO event_registrations (event_id, member_id, registered_at, status) VALUES
-- AI & Machine Learning Summit (Popular event with 45 attendees)
('11111111-1111-1111-1111-111111111111', 'b62e36e4-11a4-4567-979e-3f3ebbc9232d', '2025-06-20 10:15:00+00', 'confirmed'), -- Jennifer (Data Scientist)
('11111111-1111-1111-1111-111111111111', 'a75a33d8-aa13-42a9-a246-3a5c8e5c838f', '2025-06-20 14:30:00+00', 'confirmed'), -- Dr. Emily (Healthcare Tech)
('11111111-1111-1111-1111-111111111111', 'f06db137-c993-4ab9-8d36-d94fe284bca9', '2025-06-21 09:45:00+00', 'confirmed'), -- Robert (Backend Architect)
('11111111-1111-1111-1111-111111111111', '1918195d-3aab-4a48-9999-f17e2a4f2ef9', '2025-06-21 16:20:00+00', 'confirmed'), -- Lisa (Product Manager)
('11111111-1111-1111-1111-111111111111', 'd0519096-9dd8-4397-b0bd-3dbb8cebdb39', '2025-06-22 08:30:00+00', 'confirmed'), -- Marcus (DevOps)

-- Full Stack Workshop (28 attendees - practical developers)
('22222222-2222-2222-2222-222222222222', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '2025-06-18 11:00:00+00', 'confirmed'), -- Sarah (Full Stack Dev)
('22222222-2222-2222-2222-222222222222', '8fa10942-4a64-4911-a45d-eb4996002302', '2025-06-19 15:45:00+00', 'confirmed'), -- David (Mobile Dev)
('22222222-2222-2222-2222-222222222222', '7131f030-4431-4dbf-816b-9cb4ebd2d54d', '2025-06-20 12:30:00+00', 'confirmed'), -- Alex (Designer)
('22222222-2222-2222-2222-222222222222', 'f06db137-c993-4ab9-8d36-d94fe284bca9', '2025-06-21 10:15:00+00', 'confirmed'), -- Robert (Backend)

-- Startup Pitch Night (Just opened, no registrations yet)

-- Cybersecurity Webinar (67 attendees - security focused)
('44444444-4444-4444-4444-444444444444', '857a4b0b-961f-4c36-96db-5ced07c11232', '2025-06-15 14:20:00+00', 'confirmed'), -- Michael (Cybersecurity)
('44444444-4444-4444-4444-444444444444', 'd0519096-9dd8-4397-b0bd-3dbb8cebdb39', '2025-06-16 09:30:00+00', 'confirmed'), -- Marcus (DevOps)
('44444444-4444-4444-4444-444444444444', 'f06db137-c993-4ab9-8d36-d94fe284bca9', '2025-06-17 16:45:00+00', 'confirmed'), -- Robert (Backend)
('44444444-4444-4444-4444-444444444444', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '2025-06-18 13:15:00+00', 'confirmed'), -- Sarah (Full Stack)

-- Data Science Bootcamp (22 attendees - data focused)
('55555555-5555-5555-5555-555555555555', 'b62e36e4-11a4-4567-979e-3f3ebbc9232d', '2025-06-14 11:30:00+00', 'confirmed'), -- Jennifer (Data Scientist)
('55555555-5555-5555-5555-555555555555', 'a75a33d8-aa13-42a9-a246-3a5c8e5c838f', '2025-06-15 08:45:00+00', 'confirmed'), -- Dr. Emily (Healthcare)
('55555555-5555-5555-5555-555555555555', '1918195d-3aab-4a48-9999-f17e2a4f2ef9', '2025-06-16 14:20:00+00', 'confirmed'), -- Lisa (Product Manager)
('55555555-5555-5555-5555-555555555555', '4c6aca02-ccd6-46b6-ae8f-3969e32cb873', '2025-06-17 10:30:00+00', 'confirmed'); -- Amanda (Marketing)

-- =====================================================
-- ADDITIONAL GROUP MEMBERSHIPS (expand community connections)
-- =====================================================

INSERT INTO group_members (group_id, member_id, role, joined_date, status) VALUES
-- Web Developers Guild (expand membership)
('11111111-1111-1111-1111-111111111111', '8fa10942-4a64-4911-a45d-eb4996002302', 'member', '2025-02-15', 'active'), -- David (Mobile Dev)
('11111111-1111-1111-1111-111111111111', 'f06db137-c993-4ab9-8d36-d94fe284bca9', 'member', '2025-03-01', 'active'), -- Robert (Backend)
('11111111-1111-1111-1111-111111111111', '7131f030-4431-4dbf-816b-9cb4ebd2d54d', 'member', '2025-03-10', 'active'), -- Alex (Designer)

-- AI & Machine Learning Enthusiasts (expand membership)
('22222222-2222-2222-2222-222222222222', 'f06db137-c993-4ab9-8d36-d94fe284bca9', 'member', '2025-02-20', 'active'), -- Robert (Backend)
('22222222-2222-2222-2222-222222222222', '1918195d-3aab-4a48-9999-f17e2a4f2ef9', 'member', '2025-03-05', 'active'), -- Lisa (Product Manager)

-- Startup Founders Network (private group)
('33333333-3333-3333-3333-333333333333', 'a75a33d8-aa13-42a9-a246-3a5c8e5c838f', 'member', '2025-01-15', 'active'), -- Dr. Emily (Founder)
('33333333-3333-3333-3333-333333333333', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'member', '2025-02-01', 'active'), -- Sarah (considering startup)

-- Cybersecurity Professionals (expand membership)
('44444444-4444-4444-4444-444444444444', 'd0519096-9dd8-4397-b0bd-3dbb8cebdb39', 'member', '2025-02-10', 'active'), -- Marcus (DevOps security)
('44444444-4444-4444-4444-444444444444', 'f06db137-c993-4ab9-8d36-d94fe284bca9', 'member', '2025-02-25', 'active'), -- Robert (Backend security)

-- Data Science & Analytics (expand membership)
('55555555-5555-5555-5555-555555555555', 'a75a33d8-aa13-42a9-a246-3a5c8e5c838f', 'member', '2025-01-20', 'active'), -- Dr. Emily (Healthcare data)
('55555555-5555-5555-5555-555555555555', '1918195d-3aab-4a48-9999-f17e2a4f2ef9', 'member', '2025-02-15', 'active'), -- Lisa (Product analytics)
('55555555-5555-5555-5555-555555555555', '4c6aca02-ccd6-46b6-ae8f-3969e32cb873', 'member', '2025-03-01', 'active'); -- Amanda (Marketing analytics)

-- =====================================================
-- MARKETPLACE INTERACTIONS (bookmarks, inquiries)
-- =====================================================

-- Create marketplace_bookmarks table if it doesn't exist
CREATE TABLE IF NOT EXISTS marketplace_bookmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID REFERENCES marketplace_listings(id) ON DELETE CASCADE,
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(listing_id, member_id)
);

-- Add bookmarks for popular listings
INSERT INTO marketplace_bookmarks (listing_id, member_id, created_at) VALUES
-- MacBook Air (popular among developers)
('550e8400-e29b-41d4-a716-446655441001', '8fa10942-4a64-4911-a45d-eb4996002302', '2025-06-20 14:30:00+00'), -- David
('550e8400-e29b-41d4-a716-446655441001', 'f06db137-c993-4ab9-8d36-d94fe284bca9', '2025-06-21 09:15:00+00'), -- Robert
('550e8400-e29b-41d4-a716-446655441001', '7131f030-4431-4dbf-816b-9cb4ebd2d54d', '2025-06-21 16:45:00+00'), -- Alex

-- React Development Services (bookmarked by potential clients)
('550e8400-e29b-41d4-a716-446655441002', '1918195d-3aab-4a48-9999-f17e2a4f2ef9', '2025-06-19 11:20:00+00'), -- Lisa
('550e8400-e29b-41d4-a716-446655441002', 'a75a33d8-aa13-42a9-a246-3a5c8e5c838f', '2025-06-20 08:30:00+00'), -- Dr. Emily

-- UI/UX Design Services
('550e8400-e29b-41d4-a716-446655441003', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '2025-06-18 15:45:00+00'), -- Sarah
('550e8400-e29b-41d4-a716-446655441003', '4c6aca02-ccd6-46b6-ae8f-3969e32cb873', '2025-06-19 10:30:00+00'), -- Amanda

-- DevOps Services
('550e8400-e29b-41d4-a716-446655441004', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '2025-06-17 12:15:00+00'), -- Sarah
('550e8400-e29b-41d4-a716-446655441004', 'f06db137-c993-4ab9-8d36-d94fe284bca9', '2025-06-18 14:20:00+00'); -- Robert

-- =====================================================
-- RESOURCE INTERACTIONS (views, bookmarks)
-- =====================================================

-- Create resource_bookmarks table if it doesn't exist
CREATE TABLE IF NOT EXISTS resource_bookmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource_id UUID REFERENCES resources(id) ON DELETE CASCADE,
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(resource_id, member_id)
);

-- Add resource bookmarks
INSERT INTO resource_bookmarks (resource_id, member_id, created_at) VALUES
-- React Course (popular among developers)
('650e8400-e29b-41d4-a716-446655443001', '8fa10942-4a64-4911-a45d-eb4996002302', '2025-06-18 10:30:00+00'), -- David
('650e8400-e29b-41d4-a716-446655443001', 'f06db137-c993-4ab9-8d36-d94fe284bca9', '2025-06-19 14:15:00+00'), -- Robert
('650e8400-e29b-41d4-a716-446655443001', '7131f030-4431-4dbf-816b-9cb4ebd2d54d', '2025-06-20 09:45:00+00'), -- Alex

-- DevOps Guide
('650e8400-e29b-41d4-a716-446655443002', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '2025-06-17 11:20:00+00'), -- Sarah
('650e8400-e29b-41d4-a716-446655443002', 'f06db137-c993-4ab9-8d36-d94fe284bca9', '2025-06-18 16:30:00+00'), -- Robert
('650e8400-e29b-41d4-a716-446655443002', '857a4b0b-961f-4c36-96db-5ced07c11232', '2025-06-19 08:45:00+00'), -- Michael

-- Data Science Course
('650e8400-e29b-41d4-a716-446655443003', 'a75a33d8-aa13-42a9-a246-3a5c8e5c838f', '2025-06-16 13:15:00+00'), -- Dr. Emily
('650e8400-e29b-41d4-a716-446655443003', '1918195d-3aab-4a48-9999-f17e2a4f2ef9', '2025-06-17 15:30:00+00'), -- Lisa
('650e8400-e29b-41d4-a716-446655443003', '4c6aca02-ccd6-46b6-ae8f-3969e32cb873', '2025-06-18 12:45:00+00'), -- Amanda

-- UX Research Guide
('650e8400-e29b-41d4-a716-446655443004', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '2025-06-15 14:20:00+00'), -- Sarah
('650e8400-e29b-41d4-a716-446655443004', '1918195d-3aab-4a48-9999-f17e2a4f2ef9', '2025-06-16 10:30:00+00'), -- Lisa
('650e8400-e29b-41d4-a716-446655443004', '8fa10942-4a64-4911-a45d-eb4996002302', '2025-06-17 09:15:00+00'), -- David

-- Cybersecurity Framework
('650e8400-e29b-41d4-a716-446655443005', 'd0519096-9dd8-4397-b0bd-3dbb8cebdb39', '2025-06-14 11:45:00+00'), -- Marcus
('650e8400-e29b-41d4-a716-446655443005', 'f06db137-c993-4ab9-8d36-d94fe284bca9', '2025-06-15 16:20:00+00'), -- Robert
('650e8400-e29b-41d4-a716-446655443005', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '2025-06-16 13:30:00+00'); -- Sarah

-- =====================================================
-- JOB APPLICATION TRACKING
-- =====================================================

-- Create opportunity_applications table if it doesn't exist
CREATE TABLE IF NOT EXISTS opportunity_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    opportunity_id UUID REFERENCES opportunities(id) ON DELETE CASCADE,
    applicant_id UUID REFERENCES members(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'submitted',
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    cover_letter TEXT,
    resume_url VARCHAR(500),
    UNIQUE(opportunity_id, applicant_id)
);

-- Add realistic job applications
INSERT INTO opportunity_applications (opportunity_id, applicant_id, status, applied_at, cover_letter) VALUES
-- Senior React Developer (competitive position)
('750e8400-e29b-41d4-a716-446655444001', '8fa10942-4a64-4911-a45d-eb4996002302', 'submitted', '2025-06-20 09:30:00+00', 'I am excited to apply for the Senior React Developer position. With my experience in mobile development using React Native, I believe I can bring valuable cross-platform insights to your web development team.'),
('750e8400-e29b-41d4-a716-446655444001', '7131f030-4431-4dbf-816b-9cb4ebd2d54d', 'submitted', '2025-06-21 14:15:00+00', 'As a UX/UI designer with strong frontend development skills, I am interested in expanding into full-stack development. Your mentorship culture aligns perfectly with my learning goals.'),

-- DevOps Engineer
('750e8400-e29b-41d4-a716-446655444002', '857a4b0b-961f-4c36-96db-5ced07c11232', 'submitted', '2025-06-19 11:45:00+00', 'My cybersecurity background provides a unique perspective on DevOps practices. I am particularly interested in implementing security-first CI/CD pipelines and infrastructure as code.'),

-- Data Scientist - Environmental Projects (part-time, attractive to many)
('750e8400-e29b-41d4-a716-446655444004', 'a75a33d8-aa13-42a9-a246-3a5c8e5c838f', 'submitted', '2025-06-18 16:30:00+00', 'The intersection of healthcare and environmental data is fascinating. My medical background combined with technology consulting experience makes me uniquely qualified for this role.'),
('750e8400-e29b-41d4-a716-446655444004', '1918195d-3aab-4a48-9999-f17e2a4f2ef9', 'submitted', '2025-06-19 10:20:00+00', 'As a product manager, I understand the importance of data-driven decision making. This part-time opportunity would allow me to deepen my data science skills while contributing to meaningful environmental work.');

-- =====================================================
-- NEWS ARTICLE INTERACTIONS
-- =====================================================

-- Create news_likes table if it doesn't exist
CREATE TABLE IF NOT EXISTS news_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    article_id UUID REFERENCES news(id) ON DELETE CASCADE,
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(article_id, member_id)
);

-- Add article likes/engagement
INSERT INTO news_likes (article_id, member_id, created_at) VALUES
-- Kootenay Tech Growth (popular with everyone)
('550e8400-e29b-41d4-a716-446655442001', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '2025-06-21 10:15:00+00'),
('550e8400-e29b-41d4-a716-446655442001', 'd0519096-9dd8-4397-b0bd-3dbb8cebdb39', '2025-06-21 11:30:00+00'),
('550e8400-e29b-41d4-a716-446655442001', '1918195d-3aab-4a48-9999-f17e2a4f2ef9', '2025-06-21 14:45:00+00'),
('550e8400-e29b-41d4-a716-446655442001', '4c6aca02-ccd6-46b6-ae8f-3969e32cb873', '2025-06-21 16:20:00+00'),

-- DataWise Award (data science community)
('550e8400-e29b-41d4-a716-446655442002', 'b62e36e4-11a4-4567-979e-3f3ebbc9232d', '2025-06-19 09:30:00+00'),
('550e8400-e29b-41d4-a716-446655442002', 'a75a33d8-aa13-42a9-a246-3a5c8e5c838f', '2025-06-19 12:15:00+00'),
('550e8400-e29b-41d4-a716-446655442002', '1918195d-3aab-4a48-9999-f17e2a4f2ef9', '2025-06-19 15:45:00+00'),

-- Women in Tech Mentorship (broad appeal)
('550e8400-e29b-41d4-a716-446655442003', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '2025-06-20 08:45:00+00'),
('550e8400-e29b-41d4-a716-446655442003', 'b62e36e4-11a4-4567-979e-3f3ebbc9232d', '2025-06-20 11:30:00+00'),
('550e8400-e29b-41d4-a716-446655442003', '7131f030-4431-4dbf-816b-9cb4ebd2d54d', '2025-06-20 14:15:00+00'),
('550e8400-e29b-41d4-a716-446655442003', '4c6aca02-ccd6-46b6-ae8f-3969e32cb873', '2025-06-20 16:45:00+00'),

-- Innovation Centre Expansion (local interest)
('550e8400-e29b-41d4-a716-446655442004', 'd0519096-9dd8-4397-b0bd-3dbb8cebdb39', '2025-06-17 10:20:00+00'),
('550e8400-e29b-41d4-a716-446655442004', 'f06db137-c993-4ab9-8d36-d94fe284bca9', '2025-06-17 13:45:00+00'),
('550e8400-e29b-41d4-a716-446655442004', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '2025-06-17 16:30:00+00'),

-- Developer Portfolio Guide (developers)
('550e8400-e29b-41d4-a716-446655442005', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '2025-06-18 09:15:00+00'),
('550e8400-e29b-41d4-a716-446655442005', '8fa10942-4a64-4911-a45d-eb4996002302', '2025-06-18 12:30:00+00'),
('550e8400-e29b-41d4-a716-446655442005', 'f06db137-c993-4ab9-8d36-d94fe284bca9', '2025-06-18 15:45:00+00');

COMMIT;

-- =====================================================
-- SUMMARY OF ADDITIONAL RELATIONSHIPS
-- =====================================================
-- Added realistic interaction patterns:
-- - Event registrations showing community engagement
-- - Expanded group memberships creating cross-pollination
-- - Marketplace bookmarks and interest tracking
-- - Resource bookmarks showing learning patterns
-- - Job applications demonstrating career mobility
-- - News article engagement showing community interests
-- 
-- This creates a more vibrant, interconnected community
-- with realistic user behavior patterns
-- =====================================================