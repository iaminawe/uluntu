-- Insert a test company with the specific UUID for debugging
INSERT INTO companies (
  id,
  name,
  slug,
  description,
  logo,
  cover_image,
  industry,
  size,
  founded,
  location,
  website,
  status,
  featured,
  social,
  created_at,
  updated_at
) VALUES (
  '00112233-aabb-ccdd-eeff-001122aabbcc',
  'Test Company UUID',
  'test-company-uuid',
  'A test company with a specific UUID for debugging purposes.',
  'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg',
  'https://images.pexels.com/photos/270348/pexels-photo-270348.jpeg',
  ARRAY['Technology', 'Testing'],
  '10-50 employees',
  '2023',
  'Nelson, BC',
  'https://testcompany.example.com',
  'published',
  true,
  jsonb_build_object(
    'linkedin', 'https://linkedin.com/company/testcompany',
    'twitter', 'https://twitter.com/testcompany'
  ),
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  description = EXCLUDED.description,
  logo = EXCLUDED.logo,
  cover_image = EXCLUDED.cover_image,
  industry = EXCLUDED.industry,
  size = EXCLUDED.size,
  founded = EXCLUDED.founded,
  location = EXCLUDED.location,
  website = EXCLUDED.website,
  status = EXCLUDED.status,
  featured = EXCLUDED.featured,
  social = EXCLUDED.social,
  updated_at = NOW();

-- Verify the insert
SELECT id, name, slug, status FROM companies WHERE id = '00112233-aabb-ccdd-eeff-001122aabbcc';