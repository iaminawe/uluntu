-- ================================================================
-- Static Pages Migration with RLS Bypass
-- ================================================================

-- Temporarily disable RLS to insert system pages
ALTER TABLE public.pages DISABLE ROW LEVEL SECURITY;

-- Add missing columns if they don't exist
ALTER TABLE public.pages 
ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1;

ALTER TABLE public.pages 
ADD COLUMN IF NOT EXISTS is_system BOOLEAN DEFAULT FALSE;

ALTER TABLE public.pages 
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;

ALTER TABLE public.pages 
ADD COLUMN IF NOT EXISTS is_editable BOOLEAN DEFAULT TRUE;

ALTER TABLE public.pages 
ADD COLUMN IF NOT EXISTS meta_title TEXT;

ALTER TABLE public.pages 
ADD COLUMN IF NOT EXISTS meta_description TEXT;

-- Insert or update static pages
INSERT INTO public.pages (
  title, 
  slug, 
  blocks, 
  page_type, 
  status, 
  is_system, 
  is_featured, 
  is_editable,
  meta_title,
  meta_description,
  published_at,
  version
) VALUES 
(
  'Home',
  'home',
  '[
    {"type": "heading", "content": "Welcome to Nelson Tech Community"},
    {"type": "paragraph", "content": "Connect with the vibrant tech community in Nelson, New Zealand. Join us for events, share knowledge, and grow your network."},
    {"type": "heading", "content": "Upcoming Events"},
    {"type": "paragraph", "content": "Check out our latest tech meetups, workshops, and networking events."},
    {"type": "heading", "content": "Community Features"},
    {"type": "bulletList", "content": "🏢 Browse local tech companies"},
    {"type": "bulletList", "content": "👥 Connect with professionals"},
    {"type": "bulletList", "content": "📚 Share resources and knowledge"},
    {"type": "bulletList", "content": "🎯 Find job opportunities"},
    {"type": "bulletList", "content": "🚀 Showcase your projects"},
    {"type": "heading", "content": "Join Our Community"},
    {"type": "paragraph", "content": "Whether you''re a developer, designer, entrepreneur, or tech enthusiast, there''s a place for you in Nelson Tech."}
  ]'::jsonb,
  'block',
  'published',
  true,
  true,
  true,
  'Nelson Tech Community - Connect, Learn, Grow',
  'Join Nelson''s thriving tech community. Connect with professionals, discover events, and grow your career in New Zealand''s sunshine capital.',
  NOW(),
  1
),
(
  'About Us',
  'about',
  '[
    {"type": "heading", "content": "About Nelson Tech Community"},
    {"type": "paragraph", "content": "Nelson Tech is a community-driven platform that connects technology professionals, companies, and enthusiasts in the Nelson-Tasman region."},
    {"type": "heading", "content": "Our Mission"},
    {"type": "paragraph", "content": "To foster innovation, collaboration, and growth in Nelson''s technology ecosystem by providing a central hub for networking, knowledge sharing, and professional development."},
    {"type": "heading", "content": "What We Do"},
    {"type": "bulletList", "content": "Host regular tech meetups and workshops"},
    {"type": "bulletList", "content": "Connect local tech professionals and companies"},
    {"type": "bulletList", "content": "Provide a platform for sharing resources and knowledge"},
    {"type": "bulletList", "content": "Support tech education and career development"},
    {"type": "bulletList", "content": "Promote Nelson as a destination for tech talent"},
    {"type": "heading", "content": "Our Values"},
    {"type": "bulletList", "content": "🤝 Community First - We believe in the power of collaboration"},
    {"type": "bulletList", "content": "📚 Knowledge Sharing - Learning and teaching go hand in hand"},
    {"type": "bulletList", "content": "🌱 Growth Mindset - Always evolving and improving"},
    {"type": "bulletList", "content": "🎯 Inclusivity - Tech is for everyone"},
    {"type": "bulletList", "content": "✨ Innovation - Embracing new ideas and technologies"},
    {"type": "heading", "content": "Get Involved"},
    {"type": "paragraph", "content": "Join us in building Nelson''s tech future. Whether you want to attend events, share your expertise, or connect with like-minded professionals, we welcome you to our community."}
  ]'::jsonb,
  'block',
  'published',
  true,
  false,
  true,
  'About Nelson Tech Community',
  'Learn about Nelson Tech Community''s mission to connect and grow the technology ecosystem in Nelson, New Zealand.',
  NOW(),
  1
),
(
  'Partners',
  'partners',
  '[
    {"type": "heading", "content": "Our Partners"},
    {"type": "paragraph", "content": "Nelson Tech Community is proud to partner with organizations that support our mission of growing the local tech ecosystem."},
    {"type": "heading", "content": "Founding Partners"},
    {"type": "paragraph", "content": "These organizations have been instrumental in establishing Nelson Tech:"},
    {"type": "bulletList", "content": "Nelson City Council - Supporting local innovation"},
    {"type": "bulletList", "content": "NMIT - Educating the next generation of tech talent"},
    {"type": "bulletList", "content": "Nelson Regional Development Agency - Economic development"},
    {"type": "heading", "content": "Technology Partners"},
    {"type": "paragraph", "content": "Companies providing tools and resources to our community:"},
    {"type": "bulletList", "content": "Local tech companies offering mentorship"},
    {"type": "bulletList", "content": "Cloud service providers with startup credits"},
    {"type": "bulletList", "content": "Software vendors with community licenses"},
    {"type": "heading", "content": "Community Partners"},
    {"type": "bulletList", "content": "Co-working spaces providing event venues"},
    {"type": "bulletList", "content": "Local meetup groups and tech organizations"},
    {"type": "bulletList", "content": "Educational institutions and training providers"},
    {"type": "heading", "content": "Become a Partner"},
    {"type": "paragraph", "content": "Interested in partnering with Nelson Tech? We''re always looking for organizations that share our vision."},
    {"type": "paragraph", "content": "Contact us to discuss partnership opportunities and how we can work together to strengthen Nelson''s tech community."}
  ]'::jsonb,
  'block',
  'published',
  true,
  false,
  true,
  'Partners - Nelson Tech Community',
  'Meet the partners supporting Nelson Tech Community''s mission to grow the local technology ecosystem.',
  NOW(),
  1
),
(
  'Contact',
  'contact', 
  '[
    {"type": "heading", "content": "Get in Touch"},
    {"type": "paragraph", "content": "We''d love to hear from you! Whether you have questions, suggestions, or want to get involved, reach out to us."},
    {"type": "heading", "content": "Contact Information"},
    {"type": "paragraph", "content": "📧 Email: hello@nelson.tech"},
    {"type": "paragraph", "content": "🐦 Twitter: @NelsonTechNZ"},
    {"type": "paragraph", "content": "💼 LinkedIn: Nelson Tech Community"},
    {"type": "paragraph", "content": "📍 Location: Nelson, New Zealand"},
    {"type": "heading", "content": "Ways to Connect"},
    {"type": "bulletList", "content": "Join our community platform and start networking"},
    {"type": "bulletList", "content": "Attend our regular meetups and events"},
    {"type": "bulletList", "content": "Follow us on social media for updates"},
    {"type": "bulletList", "content": "Subscribe to our newsletter for tech news"},
    {"type": "bulletList", "content": "Contribute to community projects on GitHub"},
    {"type": "heading", "content": "Feedback & Suggestions"},
    {"type": "paragraph", "content": "Your input helps us improve. Share your ideas for events, features, or partnerships that would benefit the Nelson tech community."},
    {"type": "heading", "content": "Support"},
    {"type": "paragraph", "content": "Need help with your account or have technical issues? Our support team is here to assist you."}
  ]'::jsonb,
  'block',
  'published',
  true,
  false,
  true,
  'Contact - Nelson Tech Community',
  'Get in touch with Nelson Tech Community. Connect with us for partnerships, events, or to join our growing tech ecosystem.',
  NOW(),
  1
),
(
  'Privacy Policy',
  'privacy',
  '[
    {"type": "heading", "content": "Privacy Policy"},
    {"type": "paragraph", "content": "Last updated: January 2025"},
    {"type": "paragraph", "content": "Nelson Tech Community respects your privacy and is committed to protecting your personal data."},
    {"type": "heading", "content": "Information We Collect"},
    {"type": "bulletList", "content": "Account information (name, email, profile details)"},
    {"type": "bulletList", "content": "Usage data (pages visited, features used)"},
    {"type": "bulletList", "content": "Event registration and attendance"},
    {"type": "bulletList", "content": "Community contributions and interactions"},
    {"type": "heading", "content": "How We Use Your Information"},
    {"type": "bulletList", "content": "To provide and improve our services"},
    {"type": "bulletList", "content": "To communicate about events and updates"},
    {"type": "bulletList", "content": "To connect you with other community members"},
    {"type": "bulletList", "content": "To ensure platform security and prevent abuse"},
    {"type": "heading", "content": "Data Protection"},
    {"type": "paragraph", "content": "We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction."},
    {"type": "heading", "content": "Your Rights"},
    {"type": "bulletList", "content": "Access your personal data"},
    {"type": "bulletList", "content": "Correct inaccurate data"},
    {"type": "bulletList", "content": "Request deletion of your data"},
    {"type": "bulletList", "content": "Export your data"},
    {"type": "bulletList", "content": "Opt-out of communications"},
    {"type": "heading", "content": "Contact Us"},
    {"type": "paragraph", "content": "If you have questions about this privacy policy or your personal data, please contact us at privacy@nelson.tech."}
  ]'::jsonb,
  'block',
  'published',
  true,
  false,
  true,
  'Privacy Policy - Nelson Tech Community',
  'Learn how Nelson Tech Community protects your privacy and handles your personal information.',
  NOW(),
  1
),
(
  'Terms of Service',
  'terms',
  '[
    {"type": "heading", "content": "Terms of Service"},
    {"type": "paragraph", "content": "Last updated: January 2025"},
    {"type": "paragraph", "content": "By using Nelson Tech Community, you agree to these terms of service."},
    {"type": "heading", "content": "Acceptable Use"},
    {"type": "bulletList", "content": "Use the platform respectfully and professionally"},
    {"type": "bulletList", "content": "Provide accurate information in your profile"},
    {"type": "bulletList", "content": "Respect intellectual property rights"},
    {"type": "bulletList", "content": "Do not spam or harass other users"},
    {"type": "bulletList", "content": "Follow our community guidelines"},
    {"type": "heading", "content": "User Content"},
    {"type": "paragraph", "content": "You retain ownership of content you post, but grant us a license to use it on the platform. You are responsible for ensuring you have the right to share any content you post."},
    {"type": "heading", "content": "Platform Rules"},
    {"type": "bulletList", "content": "No illegal or harmful content"},
    {"type": "bulletList", "content": "No discrimination or hate speech"},
    {"type": "bulletList", "content": "No false or misleading information"},
    {"type": "bulletList", "content": "No unauthorized commercial activities"},
    {"type": "bulletList", "content": "No security violations or hacking attempts"},
    {"type": "heading", "content": "Disclaimer"},
    {"type": "paragraph", "content": "Nelson Tech Community is provided ''as is'' without warranties. We are not responsible for user-generated content or interactions between users."},
    {"type": "heading", "content": "Changes to Terms"},
    {"type": "paragraph", "content": "We may update these terms from time to time. Continued use of the platform constitutes acceptance of the updated terms."},
    {"type": "heading", "content": "Contact"},
    {"type": "paragraph", "content": "Questions about these terms? Contact us at legal@nelson.tech."}
  ]'::jsonb,
  'block',
  'published',
  true,
  false,
  true,
  'Terms of Service - Nelson Tech Community',
  'Read the terms of service for using Nelson Tech Community platform and services.',
  NOW(),
  1
)
ON CONFLICT (slug) DO UPDATE SET
  blocks = EXCLUDED.blocks,
  is_system = EXCLUDED.is_system,
  is_featured = EXCLUDED.is_featured,
  meta_title = EXCLUDED.meta_title,
  meta_description = EXCLUDED.meta_description,
  version = EXCLUDED.version,
  updated_at = NOW();

-- Re-enable RLS
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins can manage all pages" ON public.pages;
DROP POLICY IF EXISTS "Public can read published pages" ON public.pages;

-- Grant access for admins to manage pages
CREATE POLICY "Admins can manage all pages" ON public.pages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'superadmin')
    )
  );

-- Allow public to read published pages
CREATE POLICY "Public can read published pages" ON public.pages
  FOR SELECT USING (status = 'published');

-- Show migrated pages
SELECT 
  title, 
  slug, 
  is_system, 
  is_featured,
  status
FROM public.pages 
WHERE slug IN ('home', 'about', 'partners', 'contact', 'privacy', 'terms')
ORDER BY 
  CASE slug 
    WHEN 'home' THEN 1
    WHEN 'about' THEN 2
    WHEN 'partners' THEN 3
    WHEN 'contact' THEN 4
    WHEN 'privacy' THEN 5
    WHEN 'terms' THEN 6
  END;