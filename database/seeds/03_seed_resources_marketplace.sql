-- Seed data for Resources and Marketplace listings
-- Run this after the main seed data has been inserted

-- Resources (20 items)
INSERT INTO resources (title, description, type, url, image, status, featured, contributor_id, tags) 
SELECT 
  title, description, type, url, image, status, featured,
  (SELECT id FROM members WHERE name = contributor LIMIT 1) as contributor_id,
  tags
FROM (VALUES
  -- Development Resources
  ('React Best Practices Guide', 'Comprehensive guide covering React hooks, state management, and performance optimization techniques.', 'guide', 'https://reactbestpractices.dev', 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600', 'published', true, 'Sarah Mitchell', ARRAY['react', 'javascript', 'frontend']),
  ('Node.js Performance Toolkit', 'Essential tools and libraries for optimizing Node.js application performance.', 'tool', 'https://nodejs-performance.tools', 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=600', 'published', false, 'David Thompson', ARRAY['nodejs', 'performance', 'backend']),
  ('Design System Documentation', 'Complete design system with components, tokens, and usage guidelines for modern web apps.', 'document', 'https://designsystem.docs', 'https://images.unsplash.com/photo-1558655146-d09347e92766?w=600', 'published', true, 'Emily Rodriguez', ARRAY['design', 'ui-ux', 'components']),
  ('DevOps Automation Scripts', 'Collection of bash scripts and workflows for CI/CD pipeline automation.', 'tool', 'https://devops-scripts.repo', 'https://images.unsplash.com/photo-1618477247222-acbdb0e159b3?w=600', 'published', false, 'David Thompson', ARRAY['devops', 'automation', 'ci-cd']),
  ('Product Management Framework', 'Step-by-step framework for managing tech products from ideation to launch.', 'guide', 'https://pmframework.guide', 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=600', 'published', true, 'Marcus Chen', ARRAY['product-management', 'strategy', 'planning']),
  
  -- Learning Resources
  ('JavaScript ES2024 Features', 'Detailed article covering the latest JavaScript features and how to use them effectively.', 'article', 'https://js2024features.blog', 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=600', 'published', false, 'Sarah Mitchell', ARRAY['javascript', 'es2024', 'features']),
  ('UX Research Methods Video Series', '12-part video series covering user research techniques for product teams.', 'video', 'https://uxresearch.videos', 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=600', 'published', true, 'Emily Rodriguez', ARRAY['ux-research', 'user-testing', 'methods']),
  ('Microservices Architecture Guide', 'Comprehensive guide to designing and implementing microservices in modern applications.', 'guide', 'https://microservices.guide', 'https://images.unsplash.com/photo-1518432031352-d6fc5c10da5a?w=600', 'published', false, 'David Thompson', ARRAY['microservices', 'architecture', 'scalability']),
  ('Startup Funding Toolkit', 'Resources and templates for preparing pitch decks, financial models, and investor presentations.', 'document', 'https://startup-funding.kit', 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=600', 'published', true, 'Marcus Chen', ARRAY['startup', 'funding', 'investment']),
  ('API Design Best Practices', 'Detailed documentation on RESTful API design patterns and implementation strategies.', 'guide', 'https://api-design.docs', 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600', 'published', false, 'Sarah Mitchell', ARRAY['api', 'rest', 'backend'])
) AS resource_data(title, description, type, url, image, status, featured, contributor, tags)
WHERE EXISTS (SELECT 1 FROM members WHERE name = resource_data.contributor)
ON CONFLICT (id) DO NOTHING;

-- Marketplace Listings (10 items - simplified to avoid syntax issues)
INSERT INTO marketplace_listings (title, description, price, type, condition, images, location, seller_id, status, featured, tags, contact_info) 
SELECT 
  title, description, price, type, condition, images, location,
  (SELECT id FROM members WHERE name = seller LIMIT 1) as seller_id,
  status, featured, tags, contact_info::jsonb
FROM (VALUES
  -- Tech Hardware
  ('MacBook Pro 16 M3 Pro 2023', 'Excellent condition MacBook Pro with M3 Pro chip, 18GB RAM, 512GB SSD. Used for development work, always kept in case with screen protector.', 2800, 'product', 'excellent', ARRAY['https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600'], 'Nelson, BC', 'Sarah Mitchell', 'published', true, ARRAY['laptop', 'apple', 'development'], '{"email": "sarah@example.com", "phone": "+1-250-555-0101"}'),
  ('Dell UltraSharp 4K Monitor 27 inch', 'Professional 4K monitor perfect for development and design work. Like new condition, includes original stand and cables.', 450, 'product', 'like-new', ARRAY['https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600'], 'Castlegar, BC', 'Marcus Chen', 'published', false, ARRAY['monitor', 'dell', 'display'], '{"email": "marcus@example.com", "phone": "+1-250-555-0102"}'),
  ('Herman Miller Aeron Chair', 'Size B Herman Miller Aeron chair in good condition. Perfect for long coding sessions. Some wear on armrests but fully functional.', 650, 'product', 'good', ARRAY['https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600'], 'Nelson, BC', 'Emily Rodriguez', 'published', true, ARRAY['chair', 'office', 'ergonomic'], '{"email": "emily@example.com", "phone": "+1-250-555-0103"}'),
  ('iPad Pro 12.9 with Apple Pencil', 'iPad Pro with Apple Pencil 2nd gen and Magic Keyboard. Great for design work and presentations. Minor scratches on back.', 850, 'product', 'good', ARRAY['https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600'], 'Kaslo, BC', 'David Thompson', 'published', false, ARRAY['tablet', 'apple', 'design'], '{"email": "david@example.com", "phone": "+1-250-555-0104"}'),
  ('Standing Desk Converter', 'Varidesk Pro Plus 36 standing desk converter. Adjustable height, excellent for health and productivity. Used but in great shape.', 280, 'product', 'good', ARRAY['https://images.unsplash.com/photo-1549438137-10d826e8fa74?w=600'], 'Nelson, BC', 'Sarah Mitchell', 'published', false, ARRAY['desk', 'standing', 'office'], '{"email": "sarah@example.com", "phone": "+1-250-555-0101"}'),
  
  -- Development Services
  ('Frontend React Development', 'Experienced React developer available for freelance projects. Specializing in modern React, TypeScript, and responsive design.', 75, 'service', 'new', ARRAY['https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600'], 'Remote/Nelson area', 'Sarah Mitchell', 'published', true, ARRAY['react', 'frontend', 'freelance'], '{"email": "sarah@example.com", "phone": "+1-250-555-0101", "portfolio": "https://sarahmitchell.dev"}'),
  ('UX UI Design Consultation', 'User experience design consultation and wireframing services. Help improve your products usability and user satisfaction.', 85, 'service', 'new', ARRAY['https://images.unsplash.com/photo-1558655146-d09347e92766?w=600'], 'Remote/Nelson area', 'Emily Rodriguez', 'published', true, ARRAY['ux', 'ui', 'design'], '{"email": "emily@example.com", "phone": "+1-250-555-0103", "portfolio": "https://emilyrodriguez.design"}'),
  ('DevOps Cloud Architecture', 'Cloud infrastructure setup and DevOps consulting. AWS, Azure, and Google Cloud expertise with CI/CD pipeline setup.', 95, 'service', 'new', ARRAY['https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=600'], 'Remote/Kootenay region', 'David Thompson', 'published', false, ARRAY['devops', 'cloud', 'consulting'], '{"email": "david@example.com", "phone": "+1-250-555-0104"}'),
  
  -- Tech Accessories
  ('Mechanical Keyboard Keychron K8', 'Wireless mechanical keyboard with hot-swappable switches. Brown switches, RGB backlighting. Barely used.', 95, 'product', 'like-new', ARRAY['https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=600'], 'Nelson, BC', 'Marcus Chen', 'published', false, ARRAY['keyboard', 'mechanical', 'wireless'], '{"email": "marcus@example.com", "phone": "+1-250-555-0102"}'),
  ('Blue Yeti USB Microphone', 'Professional USB microphone perfect for podcasting, streaming, or video calls. Excellent audio quality, includes boom arm.', 140, 'product', 'excellent', ARRAY['https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=600'], 'Nelson, BC', 'David Thompson', 'published', true, ARRAY['microphone', 'audio', 'streaming'], '{"email": "david@example.com", "phone": "+1-250-555-0104"}')
) AS marketplace_data(title, description, price, type, condition, images, location, seller, status, featured, tags, contact_info)
WHERE EXISTS (SELECT 1 FROM members WHERE name = marketplace_data.seller)
ON CONFLICT (id) DO NOTHING;

-- Verify data insertion
SELECT 'Resources and Marketplace data insertion complete. Checking counts:' as status;
SELECT entity, total, published, featured FROM (
  SELECT 'Resources' as entity, 
         COUNT(*) as total, 
         COUNT(*) FILTER (WHERE status = 'published') as published,
         COUNT(*) FILTER (WHERE featured = true) as featured 
  FROM resources
  UNION ALL
  SELECT 'Marketplace Listings', 
         COUNT(*), 
         COUNT(*) FILTER (WHERE status = 'published'),
         COUNT(*) FILTER (WHERE featured = true)
  FROM marketplace_listings
) counts
ORDER BY entity;