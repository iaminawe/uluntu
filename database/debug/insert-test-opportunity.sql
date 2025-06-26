-- Insert a test opportunity for debugging
INSERT INTO opportunities (
  id,
  title,
  description,
  type,
  organization,
  location,
  remote,
  compensation,
  deadline,
  contact_email,
  website,
  image,
  requirements,
  responsibilities,
  benefits,
  status,
  featured,
  posted_by,
  created_at,
  updated_at
) VALUES (
  '550e8400-e29b-41d4-a716-446655440001',
  'Senior Full Stack Developer',
  'We are looking for an experienced Full Stack Developer to join our growing team. You will be responsible for developing and maintaining our web applications using modern technologies.

Key Requirements:
- 5+ years of experience in full-stack development
- Strong proficiency in React, TypeScript, and Node.js
- Experience with cloud platforms (AWS, Azure, or GCP)
- Excellent problem-solving and communication skills

What We Offer:
- Competitive salary and equity
- Flexible work arrangements
- Health and dental benefits
- Professional development budget',
  'full-time',
  'Tech Innovators Inc.',
  'Nelson, BC',
  true,
  '$90,000 - $120,000',
  NOW() + INTERVAL '30 days',
  'careers@techinnovators.com',
  'https://techinnovators.com/careers',
  'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&h=400&fit=crop&q=80',
  ARRAY['5+ years of experience in full-stack development', 'Strong proficiency in React, TypeScript, and Node.js', 'Experience with cloud platforms (AWS, Azure, or GCP)', 'Excellent problem-solving and communication skills'],
  ARRAY['Design and develop scalable web applications', 'Collaborate with cross-functional teams', 'Mentor junior developers', 'Participate in code reviews and architectural decisions'],
  ARRAY['Competitive salary and equity', 'Flexible work arrangements', 'Health and dental benefits', 'Professional development budget'],
  'published',
  true,
  '1', -- Replace with a valid member ID from your system
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  type = EXCLUDED.type,
  organization = EXCLUDED.organization,
  location = EXCLUDED.location,
  remote = EXCLUDED.remote,
  compensation = EXCLUDED.compensation,
  deadline = EXCLUDED.deadline,
  contact_email = EXCLUDED.contact_email,
  website = EXCLUDED.website,
  image = EXCLUDED.image,
  requirements = EXCLUDED.requirements,
  responsibilities = EXCLUDED.responsibilities,
  benefits = EXCLUDED.benefits,
  status = EXCLUDED.status,
  featured = EXCLUDED.featured,
  updated_at = NOW();

-- Insert additional test opportunities
INSERT INTO opportunities (
  id,
  title,
  description,
  type,
  organization,
  location,
  remote,
  compensation,
  deadline,
  contact_email,
  website,
  image,
  requirements,
  responsibilities,
  benefits,
  status,
  featured,
  posted_by,
  created_at,
  updated_at
) VALUES 
(
  '550e8400-e29b-41d4-a716-446655440002',
  'UX/UI Designer',
  'Join our creative team to design beautiful and intuitive user experiences for our products.',
  'contract',
  'Creative Solutions Ltd.',
  'Kelowna, BC',
  true,
  '$40-60/hour',
  NOW() + INTERVAL '15 days',
  'design@creativesolutions.com',
  'https://creativesolutions.com',
  'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=800&h=400&fit=crop&q=80',
  ARRAY['3+ years of UX/UI design experience', 'Proficiency in Figma or Sketch', 'Strong portfolio demonstrating user-centered design'],
  ARRAY['Create wireframes and prototypes', 'Conduct user research', 'Collaborate with developers'],
  ARRAY['Flexible hours', 'Remote work', 'Creative freedom'],
  'published',
  false,
  '1',
  NOW() - INTERVAL '3 days',
  NOW()
),
(
  '550e8400-e29b-41d4-a716-446655440003',
  'Community Outreach Coordinator',
  'Help us connect with the local tech community and organize events.',
  'volunteer',
  'Kootenay Tech Association',
  'Remote',
  true,
  NULL,
  NOW() + INTERVAL '60 days',
  'volunteer@kootenaytech.org',
  'https://kootenaytech.org',
  'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=800&h=400&fit=crop&q=80',
  ARRAY['Strong communication skills', 'Event planning experience', 'Passion for community building'],
  ARRAY['Organize monthly meetups', 'Manage social media', 'Connect with sponsors'],
  ARRAY['Build your network', 'Gain event planning experience', 'Make a difference in the tech community'],
  'published',
  false,
  '1',
  NOW() - INTERVAL '7 days',
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Verify the inserts
SELECT id, title, organization, type, status FROM opportunities WHERE id IN ('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003');