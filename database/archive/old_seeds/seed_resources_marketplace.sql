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
  ('API Design Best Practices', 'Detailed documentation on RESTful API design patterns and implementation strategies.', 'guide', 'https://api-design.docs', 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600', 'published', false, 'Sarah Mitchell', ARRAY['api', 'rest', 'backend']),
  
  -- Tools and Utilities
  ('Color Palette Generator', 'AI-powered tool for generating accessible color palettes for web and mobile applications.', 'tool', 'https://colorpalette.ai', 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=600', 'published', true, 'Emily Rodriguez', ARRAY['design', 'colors', 'accessibility']),
  ('Code Review Checklist', 'Comprehensive checklist for conducting effective code reviews in development teams.', 'document', 'https://codereview.checklist', 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600', 'published', false, 'David Thompson', ARRAY['code-review', 'quality', 'teamwork']),
  ('Remote Work Setup Guide', 'Complete guide to setting up an effective home office for remote software development.', 'guide', 'https://remote-setup.guide', 'https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b?w=600', 'published', true, 'Marcus Chen', ARRAY['remote-work', 'productivity', 'setup']),
  ('Database Migration Scripts', 'Collection of SQL scripts and tools for safe database schema migrations.', 'tool', 'https://db-migrations.tools', 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=600', 'published', false, 'David Thompson', ARRAY['database', 'migration', 'sql']),
  ('Agile Project Templates', 'Ready-to-use templates for sprint planning, retrospectives, and project tracking.', 'document', 'https://agile-templates.kit', 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=600', 'published', true, 'Marcus Chen', ARRAY['agile', 'project-management', 'templates']),
  
  -- Advanced Resources
  ('Machine Learning for Web Developers', 'Practical introduction to implementing ML models in web applications using TensorFlow.js.', 'article', 'https://ml-webdev.guide', 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600', 'published', false, 'Sarah Mitchell', ARRAY['machine-learning', 'tensorflow', 'web-development']),
  ('Kubernetes Deployment Guide', 'Step-by-step guide for deploying applications to Kubernetes clusters in production.', 'guide', 'https://k8s-deploy.guide', 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=600', 'published', true, 'David Thompson', ARRAY['kubernetes', 'deployment', 'containers']),
  ('Design Thinking Workshop Kit', 'Complete toolkit for running design thinking workshops with templates and exercises.', 'document', 'https://design-thinking.kit', 'https://images.unsplash.com/photo-1558655146-d09347e92766?w=600', 'published', false, 'Emily Rodriguez', ARRAY['design-thinking', 'workshop', 'innovation']),
  ('Cybersecurity Checklist for Startups', 'Essential security measures and practices for early-stage technology companies.', 'guide', 'https://security-startup.checklist', 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=600', 'published', true, 'David Thompson', ARRAY['cybersecurity', 'startup', 'security']),
  ('Product Analytics Dashboard', 'Open-source analytics dashboard for tracking user behavior and product metrics.', 'tool', 'https://product-analytics.dashboard', 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600', 'published', false, 'Marcus Chen', ARRAY['analytics', 'product', 'metrics'])
) AS resource_data(title, description, type, url, image, status, featured, contributor, tags)
WHERE EXISTS (SELECT 1 FROM members WHERE name = resource_data.contributor)
ON CONFLICT (id) DO NOTHING;

-- Marketplace Listings (20 items)
INSERT INTO marketplace_listings (title, description, price, type, condition, images, location, seller_id, status, featured, tags, contact_info) 
SELECT 
  title, description, price, type, condition, images, location,
  (SELECT id FROM members WHERE name = seller LIMIT 1) as seller_id,
  status, featured, tags, contact_info
FROM (VALUES
  -- Tech Hardware
  ('MacBook Pro 16" M3 Pro (2023)', 'Excellent condition MacBook Pro with M3 Pro chip, 18GB RAM, 512GB SSD. Used for development work, always kept in case with screen protector.', 2800, 'product', 'excellent', ARRAY['https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600'], 'Nelson, BC', 'Sarah Mitchell', 'published', true, ARRAY['laptop', 'apple', 'development'], '{"email": "sarah@example.com", "phone": "+1-250-555-0101"}'),
  ('Dell UltraSharp 4K Monitor 27"', 'Professional 4K monitor perfect for development and design work. Like new condition, includes original stand and cables.', 450, 'product', 'like-new', ARRAY['https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600'], 'Castlegar, BC', 'Marcus Chen', 'published', false, ARRAY['monitor', 'dell', 'display'], '{"email": "marcus@example.com", "phone": "+1-250-555-0102"}'),
  ('Herman Miller Aeron Chair', 'Size B Herman Miller Aeron chair in good condition. Perfect for long coding sessions. Some wear on armrests but fully functional.', 650, 'product', 'good', ARRAY['https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600'], 'Nelson, BC', 'Emily Rodriguez', 'published', true, ARRAY['chair', 'office', 'ergonomic'], '{"email": "emily@example.com", "phone": "+1-250-555-0103"}'),
  ('iPad Pro 12.9" with Apple Pencil', 'iPad Pro with Apple Pencil (2nd gen) and Magic Keyboard. Great for design work and presentations. Minor scratches on back.', 850, 'product', 'good', ARRAY['https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600'], 'Kaslo, BC', 'David Thompson', 'published', false, ARRAY['tablet', 'apple', 'design'], '{"email": "david@example.com", "phone": "+1-250-555-0104"}'),
  ('Standing Desk Converter', 'Varidesk Pro Plus 36 standing desk converter. Adjustable height, excellent for health and productivity. Used but in great shape.', 280, 'product', 'good', ARRAY['https://images.unsplash.com/photo-1549438137-10d826e8fa74?w=600'], 'Nelson, BC', 'Sarah Mitchell', 'published', false, ARRAY['desk', 'standing', 'office'], '{"email": "sarah@example.com", "phone": "+1-250-555-0101"}'),
  
  -- Software & Licenses
  ('Adobe Creative Suite License', 'Transferable Adobe Creative Cloud license (1 year remaining). Includes Photoshop, Illustrator, InDesign, and more.', 400, 'service', 'new', ARRAY['https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=600'], 'Digital Download', 'Emily Rodriguez', 'published', true, ARRAY['software', 'adobe', 'design'], '{"email": "emily@example.com", "phone": "+1-250-555-0103"}'),
  ('JetBrains IntelliJ IDEA License', 'Personal license for IntelliJ IDEA Ultimate (6 months remaining). Perfect for Java and web development.', 120, 'service', 'new', ARRAY['https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600'], 'Digital Download', 'David Thompson', 'published', false, ARRAY['software', 'ide', 'development'], '{"email": "david@example.com", "phone": "+1-250-555-0104"}'),
  
  -- Development Services
  ('Frontend React Development', 'Experienced React developer available for freelance projects. Specializing in modern React, TypeScript, and responsive design.', 75, 'service', 'new', ARRAY['https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600'], 'Remote/Nelson area', 'Sarah Mitchell', 'published', true, ARRAY['react', 'frontend', 'freelance'], '{"email": "sarah@example.com", "phone": "+1-250-555-0101", "portfolio": "https://sarahmitchell.dev"}'),
  ('UX/UI Design Consultation', 'User experience design consultation and wireframing services. Help improve your product\'s usability and user satisfaction.', 85, 'service', 'new', ARRAY['https://images.unsplash.com/photo-1558655146-d09347e92766?w=600'], 'Remote/Nelson area', 'Emily Rodriguez', 'published', true, ARRAY['ux', 'ui', 'design'], '{"email": "emily@example.com", "phone": "+1-250-555-0103", "portfolio": "https://emilyrodriguez.design"}'),
  ('DevOps & Cloud Architecture', 'Cloud infrastructure setup and DevOps consulting. AWS, Azure, and Google Cloud expertise with CI/CD pipeline setup.', 95, 'service', 'new', ARRAY['https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=600'], 'Remote/Kootenay region', 'David Thompson', 'published', false, ARRAY['devops', 'cloud', 'consulting'], '{"email": "david@example.com", "phone": "+1-250-555-0104"}'),
  
  -- Networking & Accessories
  ('Mechanical Keyboard - Keychron K8', 'Wireless mechanical keyboard with hot-swappable switches. Brown switches, RGB backlighting. Barely used.', 95, 'product', 'like-new', ARRAY['https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=600'], 'Nelson, BC', 'Marcus Chen', 'published', false, ARRAY['keyboard', 'mechanical', 'wireless'], '{"email": "marcus@example.com", "phone": "+1-250-555-0102"}'),
  ('Logitech MX Master 3 Mouse', 'Professional wireless mouse with precision tracking. Excellent for design and productivity work. Like new condition.', 75, 'product', 'like-new', ARRAY['https://images.unsplash.com/photo-1527814050087-3793815479db?w=600'], 'Castlegar, BC', 'Emily Rodriguez', 'published', false, ARRAY['mouse', 'wireless', 'productivity'], '{"email": "emily@example.com", "phone": "+1-250-555-0103"}'),
  ('USB-C Hub with 4K HDMI', '7-in-1 USB-C hub with 4K HDMI output, USB 3.0 ports, SD card reader, and power delivery. New in box.', 45, 'product', 'new', ARRAY['https://images.unsplash.com/photo-1625842268584-8f3296236761?w=600'], 'Nelson, BC', 'David Thompson', 'published', false, ARRAY['usb-c', 'hub', 'connectivity'], '{"email": "david@example.com", "phone": "+1-250-555-0104"}'),
  
  -- Books & Learning Materials
  ('Clean Code Book Set', 'Complete set of Uncle Bob\'s books: Clean Code, Clean Architecture, and Clean Coder. Excellent condition, minor highlighting.', 85, 'product', 'good', ARRAY['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600'], 'Nelson, BC', 'Sarah Mitchell', 'published', false, ARRAY['books', 'programming', 'education'], '{"email": "sarah@example.com", "phone": "+1-250-555-0101"}'),
  ('Design Thinking Toolkit', 'Complete design thinking toolkit with books, cards, and workshop materials. Great for product teams and startups.', 120, 'product', 'good', ARRAY['https://images.unsplash.com/photo-1558655146-d09347e92766?w=600'], 'Castlegar, BC', 'Marcus Chen', 'published', true, ARRAY['design-thinking', 'toolkit', 'product'], '{"email": "marcus@example.com", "phone": "+1-250-555-0102"}'),
  
  -- Audio/Visual Equipment
  ('Blue Yeti USB Microphone', 'Professional USB microphone perfect for podcasting, streaming, or video calls. Excellent audio quality, includes boom arm.', 140, 'product', 'excellent', ARRAY['https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=600'], 'Nelson, BC', 'David Thompson', 'published', true, ARRAY['microphone', 'audio', 'streaming'], '{"email": "david@example.com", "phone": "+1-250-555-0104"}'),
  ('Webcam - Logitech C920', 'HD webcam with auto-focus and built-in microphone. Perfect for video conferences and streaming. Like new condition.', 60, 'product', 'like-new', ARRAY['https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=600'], 'Kaslo, BC', 'Emily Rodriguez', 'published', false, ARRAY['webcam', 'video', 'streaming'], '{"email": "emily@example.com", "phone": "+1-250-555-0103"}'),
  
  -- Vintage/Collectible Tech
  ('Original iPhone (2007) - Collectors Item', 'First generation iPhone in original packaging. Never activated, collectors condition. Rare piece of tech history.', 800, 'product', 'new', ARRAY['https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=600'], 'Nelson, BC', 'Marcus Chen', 'published', true, ARRAY['vintage', 'iphone', 'collectible'], '{"email": "marcus@example.com", "phone": "+1-250-555-0102"}'),
  
  -- 3D Printing & Making
  ('3D Printer - Ender 3 V2', 'Creality Ender 3 V2 3D printer with upgrades: glass bed, silent board, and direct drive extruder. Great for prototyping.', 220, 'product', 'good', ARRAY['https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=600'], 'Nelson, BC', 'David Thompson', 'published', false, ARRAY['3d-printer', 'making', 'prototyping'], '{"email": "david@example.com", "phone": "+1-250-555-0104"}'),
  
  -- Mobile Accessories
  ('iPhone 15 Pro Case & MagSafe Charger', 'Official Apple leather case and MagSafe wireless charger for iPhone 15 Pro. Minimal wear, works perfectly.', 85, 'product', 'excellent', ARRAY['https://images.unsplash.com/photo-1609692814857-9ebdd40b7d1d?w=600'], 'Castlegar, BC', 'Sarah Mitchell', 'published', false, ARRAY['iphone', 'case', 'magsafe'], '{"email": "sarah@example.com", "phone": "+1-250-555-0101"}')
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