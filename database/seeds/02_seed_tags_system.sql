-- Seed data for the new tags system
-- This populates the tags table and junction tables to replace array-based tags

-- Insert common tags that would be used across the platform
INSERT INTO tags (name, slug, description, color, category) VALUES
-- Technology tags
('React', 'react', 'JavaScript library for building user interfaces', '#61DAFB', 'technology'),
('JavaScript', 'javascript', 'Programming language for web development', '#F7DF1E', 'technology'),
('TypeScript', 'typescript', 'Typed superset of JavaScript', '#3178C6', 'technology'),
('Node.js', 'nodejs', 'JavaScript runtime for server-side development', '#339933', 'technology'),
('Python', 'python', 'High-level programming language', '#3776AB', 'technology'),
('DevOps', 'devops', 'Development and operations practices', '#326CE5', 'technology'),
('Cloud', 'cloud', 'Cloud computing and services', '#FF9900', 'technology'),
('API', 'api', 'Application Programming Interface', '#FF6B6B', 'technology'),
('Database', 'database', 'Data storage and management', '#336791', 'technology'),
('Frontend', 'frontend', 'Client-side web development', '#4ECDC4', 'technology'),
('Backend', 'backend', 'Server-side development', '#45B7D1', 'technology'),
('Mobile', 'mobile', 'Mobile application development', '#A8E6CF', 'technology'),
('AI', 'ai', 'Artificial Intelligence', '#9B59B6', 'technology'),
('Machine Learning', 'machine-learning', 'Machine learning and data science', '#E74C3C', 'technology'),
('Blockchain', 'blockchain', 'Distributed ledger technology', '#F39C12', 'technology'),

-- Skill level tags
('Beginner', 'beginner', 'Entry level skill or experience', '#28A745', 'skill-level'),
('Intermediate', 'intermediate', 'Moderate level skill or experience', '#17A2B8', 'skill-level'),
('Advanced', 'advanced', 'High level skill or experience', '#FFC107', 'skill-level'),
('Expert', 'expert', 'Expert level skill or experience', '#DC3545', 'skill-level'),

-- Industry tags
('Technology', 'technology', 'Technology and software industry', '#6C63FF', 'industry'),
('Healthcare', 'healthcare', 'Healthcare and medical industry', '#FF6B6B', 'industry'),
('Finance', 'finance', 'Financial services industry', '#4ECDC4', 'industry'),
('Education', 'education', 'Education and training sector', '#45B7D1', 'industry'),
('Manufacturing', 'manufacturing', 'Manufacturing and production', '#96CEB4', 'industry'),
('Retail', 'retail', 'Retail and e-commerce', '#FFEAA7', 'industry'),
('Tourism', 'tourism', 'Tourism and hospitality', '#74B9FF', 'industry'),
('Non-profit', 'nonprofit', 'Non-profit organizations', '#A29BFE', 'industry'),
('Government', 'government', 'Government and public sector', '#FD79A8', 'industry'),
('Consulting', 'consulting', 'Consulting and professional services', '#FDCB6E', 'industry'),

-- Topic tags
('Networking', 'networking', 'Professional networking and connections', '#E17055', 'topic'),
('Career Development', 'career-development', 'Career growth and development', '#00B894', 'topic'),
('Entrepreneurship', 'entrepreneurship', 'Starting and running businesses', '#E84393', 'topic'),
('Innovation', 'innovation', 'Innovation and new ideas', '#0984E3', 'topic'),
('Leadership', 'leadership', 'Leadership and management skills', '#6C5CE7', 'topic'),
('Sustainability', 'sustainability', 'Environmental and sustainable practices', '#00CEC9', 'topic'),
('Diversity', 'diversity', 'Diversity and inclusion', '#FF7675', 'topic'),
('Mentorship', 'mentorship', 'Mentoring and coaching', '#74B9FF', 'topic'),
('Training', 'training', 'Training and skill development', '#A29BFE', 'topic'),
('Research', 'research', 'Research and development', '#FD79A8', 'topic'),

-- Location tags (for local Nelson area)
('Nelson', 'nelson', 'Nelson, BC area', '#2D3436', 'location'),
('Kootenays', 'kootenays', 'Kootenay region', '#636E72', 'location'),
('Remote', 'remote', 'Remote work or virtual', '#00B894', 'location'),
('BC', 'bc', 'British Columbia', '#0984E3', 'location'),
('Canada', 'canada', 'Canada-wide', '#E84393', 'location'),

-- Event types
('Workshop', 'workshop', 'Hands-on learning workshop', '#6C5CE7', 'event-type'),
('Seminar', 'seminar', 'Educational seminar or lecture', '#00CEC9', 'event-type'),
('Networking Event', 'networking-event', 'Professional networking gathering', '#FF7675', 'event-type'),
('Conference', 'conference', 'Large-scale conference', '#74B9FF', 'event-type'),
('Meetup', 'meetup', 'Casual community meetup', '#A29BFE', 'event-type'),
('Panel Discussion', 'panel-discussion', 'Expert panel discussion', '#FD79A8', 'event-type'),

-- Resource types
('Tutorial', 'tutorial', 'Step-by-step tutorial', '#00B894', 'resource-type'),
('Guide', 'guide', 'Comprehensive guide', '#0984E3', 'resource-type'),
('Tool', 'tool', 'Software tool or utility', '#E84393', 'resource-type'),
('Template', 'template', 'Reusable template', '#6C5CE7', 'resource-type'),
('Course', 'course', 'Educational course', '#00CEC9', 'resource-type'),
('Article', 'article', 'Informational article', '#FF7675', 'resource-type'),
('Video', 'video', 'Video content', '#74B9FF', 'resource-type'),
('Podcast', 'podcast', 'Audio podcast', '#A29BFE', 'resource-type'),
('Book', 'book', 'Book recommendation', '#FD79A8', 'resource-type'),
('Documentation', 'documentation', 'Technical documentation', '#FDCB6E', 'resource-type'),

-- Missing marketplace tags from the seed data
('Office', 'office', 'Office equipment and furniture', '#8E44AD', 'category'),
('Design', 'design', 'Design and creative work', '#E67E22', 'topic'),
('Performance', 'performance', 'Performance optimization', '#27AE60', 'technology'),
('Architecture', 'architecture', 'Software architecture', '#3498DB', 'technology'),
('Laptop', 'laptop', 'Laptop computers', '#34495E', 'product'),
('Apple', 'apple', 'Apple products', '#95A5A6', 'brand'),
('Monitor', 'monitor', 'Computer monitors and displays', '#9B59B6', 'product'),
('Display', 'display', 'Display technology', '#1ABC9C', 'product'),
('Chair', 'chair', 'Office chairs and seating', '#F39C12', 'product'),
('Ergonomic', 'ergonomic', 'Ergonomic products', '#16A085', 'feature'),
('Tablet', 'tablet', 'Tablet computers', '#8E44AD', 'product'),
('Desk', 'desk', 'Desks and workstations', '#E74C3C', 'product'),
('Standing', 'standing', 'Standing desk solutions', '#2ECC71', 'feature'),
('Freelance', 'freelance', 'Freelance services', '#F1C40F', 'service-type'),
('UX', 'ux', 'User experience design', '#9B59B6', 'skill'),
('UI', 'ui', 'User interface design', '#3498DB', 'skill'),
('Keyboard', 'keyboard', 'Computer keyboards', '#34495E', 'product'),
('Mechanical', 'mechanical', 'Mechanical keyboards', '#E67E22', 'feature'),
('Wireless', 'wireless', 'Wireless technology', '#27AE60', 'feature'),
('Microphone', 'microphone', 'Microphones and audio equipment', '#8E44AD', 'product'),
('Audio', 'audio', 'Audio equipment and technology', '#E74C3C', 'category'),
('Streaming', 'streaming', 'Streaming and content creation', '#9B59B6', 'topic'),
('Development', 'development', 'Software development', '#3498DB', 'topic'),
('Dell', 'dell', 'Dell products', '#0073C7', 'brand'),
('Marketing', 'marketing', 'Marketing and promotion', '#E91E63', 'topic')
ON CONFLICT (name) DO NOTHING;

-- Now populate the junction tables based on the existing array data

-- Note: Skipping resources since the existing resource_tags table uses string tags instead of tag_id references
-- This can be migrated later if needed

-- Marketplace listings with tags (matching the actual data from seed_resources_marketplace_fixed.sql)
INSERT INTO marketplace_tags (listing_id, tag_id)
SELECT ml.id, t.id
FROM marketplace_listings ml, tags t
WHERE ml.title = 'MacBook Pro 16 M3 Pro 2023' AND t.name IN ('Laptop', 'Apple', 'Development')
UNION ALL
SELECT ml.id, t.id
FROM marketplace_listings ml, tags t
WHERE ml.title = 'Dell UltraSharp 4K Monitor 27 inch' AND t.name IN ('Monitor', 'Dell', 'Display')
UNION ALL
SELECT ml.id, t.id
FROM marketplace_listings ml, tags t
WHERE ml.title = 'Herman Miller Aeron Chair' AND t.name IN ('Chair', 'Office', 'Ergonomic')
UNION ALL
SELECT ml.id, t.id
FROM marketplace_listings ml, tags t
WHERE ml.title = 'iPad Pro 12.9 with Apple Pencil' AND t.name IN ('Tablet', 'Apple', 'Design')
UNION ALL
SELECT ml.id, t.id
FROM marketplace_listings ml, tags t
WHERE ml.title = 'Standing Desk Converter' AND t.name IN ('Desk', 'Standing', 'Office')
UNION ALL
SELECT ml.id, t.id
FROM marketplace_listings ml, tags t
WHERE ml.title = 'Frontend React Development' AND t.name IN ('React', 'Frontend', 'Freelance')
UNION ALL
SELECT ml.id, t.id
FROM marketplace_listings ml, tags t
WHERE ml.title = 'UX UI Design Consultation' AND t.name IN ('UX', 'UI', 'Design')
UNION ALL
SELECT ml.id, t.id
FROM marketplace_listings ml, tags t
WHERE ml.title = 'DevOps Cloud Architecture' AND t.name IN ('DevOps', 'Cloud', 'Consulting')
UNION ALL
SELECT ml.id, t.id
FROM marketplace_listings ml, tags t
WHERE ml.title = 'Mechanical Keyboard Keychron K8' AND t.name IN ('Keyboard', 'Mechanical', 'Wireless')
UNION ALL
SELECT ml.id, t.id
FROM marketplace_listings ml, tags t
WHERE ml.title = 'Blue Yeti USB Microphone' AND t.name IN ('Microphone', 'Audio', 'Streaming')
ON CONFLICT (listing_id, tag_id) DO NOTHING;

-- Add tags to companies based on their industry (only if companies exist)
INSERT INTO company_tags (company_id, tag_id)
SELECT c.id, t.id
FROM companies c, tags t
WHERE c.name = 'Nelson Tech Innovations' AND t.name IN ('Technology', 'Innovation')
AND EXISTS (SELECT 1 FROM companies WHERE name = 'Nelson Tech Innovations')
UNION ALL
SELECT c.id, t.id
FROM companies c, tags t
WHERE c.name = 'Kootenay Web Solutions' AND t.name IN ('Technology', 'Frontend')
AND EXISTS (SELECT 1 FROM companies WHERE name = 'Kootenay Web Solutions')
UNION ALL
SELECT c.id, t.id
FROM companies c, tags t
WHERE c.name = 'Mountain View Digital' AND t.name IN ('Technology', 'Remote')
AND EXISTS (SELECT 1 FROM companies WHERE name = 'Mountain View Digital')
UNION ALL
SELECT c.id, t.id
FROM companies c, tags t
WHERE c.name = 'Nelson Health Collective' AND t.name IN ('Healthcare', 'Nelson')
AND EXISTS (SELECT 1 FROM companies WHERE name = 'Nelson Health Collective')
UNION ALL
SELECT c.id, t.id
FROM companies c, tags t
WHERE c.name = 'West Kootenay Consulting' AND t.name IN ('Consulting', 'Kootenays')
AND EXISTS (SELECT 1 FROM companies WHERE name = 'West Kootenay Consulting')
ON CONFLICT (company_id, tag_id) DO NOTHING;

-- Add tags to events based on their content
INSERT INTO event_tags (event_id, tag_id)
SELECT e.id, t.id
FROM events e, tags t
WHERE e.title = 'React Workshop: Building Modern UIs' AND t.name IN ('React', 'Workshop', 'Frontend')
UNION ALL
SELECT e.id, t.id
FROM events e, tags t
WHERE e.title = 'Tech Networking Mixer' AND t.name IN ('Networking Event', 'Technology', 'Nelson')
UNION ALL
SELECT e.id, t.id
FROM events e, tags t
WHERE e.title = 'Startup Pitch Night' AND t.name IN ('Entrepreneurship', 'Networking Event', 'Innovation')
UNION ALL
SELECT e.id, t.id
FROM events e, tags t
WHERE e.title = 'DevOps Best Practices Seminar' AND t.name IN ('DevOps', 'Seminar', 'Technology')
UNION ALL
SELECT e.id, t.id
FROM events e, tags t
WHERE e.title = 'Women in Tech Panel Discussion' AND t.name IN ('Panel Discussion', 'Technology', 'Diversity')
ON CONFLICT (event_id, tag_id) DO NOTHING;

-- Add tags to groups based on their focus
INSERT INTO group_tags (group_id, tag_id)
SELECT g.id, t.id
FROM groups g, tags t
WHERE g.name = 'Nelson Tech Meetup' AND t.name IN ('Technology', 'Meetup', 'Nelson')
UNION ALL
SELECT g.id, t.id
FROM groups g, tags t
WHERE g.name = 'Kootenay Entrepreneurs' AND t.name IN ('Entrepreneurship', 'Kootenays', 'Networking')
UNION ALL
SELECT g.id, t.id
FROM groups g, tags t
WHERE g.name = 'Women in Tech Kootenays' AND t.name IN ('Technology', 'Diversity', 'Kootenays')
UNION ALL
SELECT g.id, t.id
FROM groups g, tags t
WHERE g.name = 'Digital Marketing Collective' AND t.name IN ('Technology', 'Marketing', 'Remote')
UNION ALL
SELECT g.id, t.id
FROM groups g, tags t
WHERE g.name = 'Sustainable Business Network' AND t.name IN ('Sustainability', 'Networking', 'Nelson')
ON CONFLICT (group_id, tag_id) DO NOTHING;

-- Add tags to news articles based on their content
INSERT INTO news_tags (news_id, tag_id)
SELECT n.id, t.id
FROM news n, tags t
WHERE n.title = 'Nelson Tech Scene Continues to Grow' AND t.name IN ('Technology', 'Nelson', 'Innovation')
UNION ALL
SELECT n.id, t.id
FROM news n, tags t
WHERE n.title = 'Local Startup Receives Provincial Funding' AND t.name IN ('Entrepreneurship', 'Finance', 'Nelson')
UNION ALL
SELECT n.id, t.id
FROM news n, tags t
WHERE n.title = 'Remote Work Trends in the Kootenays' AND t.name IN ('Remote', 'Kootenays', 'Career Development')
UNION ALL
SELECT n.id, t.id
FROM news n, tags t
WHERE n.title = 'New Co-working Space Opens in Nelson' AND t.name IN ('Nelson', 'Technology', 'Innovation')
UNION ALL
SELECT n.id, t.id
FROM news n, tags t
WHERE n.title = 'Tech Education Programs Launch' AND t.name IN ('Education', 'Technology', 'Training')
ON CONFLICT (news_id, tag_id) DO NOTHING;

-- Add some sample member skill tags
INSERT INTO member_tags (member_id, tag_id, skill_level, years_experience)
SELECT m.id, t.id, 'expert', 8
FROM members m, tags t
WHERE m.name = 'Sarah Mitchell' AND t.name IN ('React', 'JavaScript', 'Frontend')
UNION ALL
SELECT m.id, t.id, 'advanced', 6
FROM members m, tags t
WHERE m.name = 'Sarah Mitchell' AND t.name IN ('TypeScript', 'Node.js')
UNION ALL
SELECT m.id, t.id, 'expert', 10
FROM members m, tags t
WHERE m.name = 'David Thompson' AND t.name IN ('DevOps', 'Cloud', 'Backend')
UNION ALL
SELECT m.id, t.id, 'advanced', 7
FROM members m, tags t
WHERE m.name = 'David Thompson' AND t.name IN ('Python', 'Database')
UNION ALL
SELECT m.id, t.id, 'expert', 9
FROM members m, tags t
WHERE m.name = 'Emily Rodriguez' AND t.name IN ('Frontend', 'Leadership')
UNION ALL
SELECT m.id, t.id, 'advanced', 5
FROM members m, tags t
WHERE m.name = 'Emily Rodriguez' AND t.name IN ('JavaScript', 'Career Development')
UNION ALL
SELECT m.id, t.id, 'expert', 12
FROM members m, tags t
WHERE m.name = 'Marcus Chen' AND t.name IN ('Entrepreneurship', 'Leadership', 'Finance')
UNION ALL
SELECT m.id, t.id, 'advanced', 8
FROM members m, tags t
WHERE m.name = 'Marcus Chen' AND t.name IN ('Innovation', 'Consulting')
ON CONFLICT (member_id, tag_id) DO NOTHING;

-- Verify the tags were created and linked
SELECT 'Tags system seeding complete!' as status;

SELECT 
    'Summary:' as info,
    (SELECT COUNT(*) FROM tags) as total_tags,
    0 as resource_tag_links, -- Skipped due to existing table structure
    (SELECT COUNT(*) FROM marketplace_tags) as marketplace_tag_links,
    (SELECT COUNT(*) FROM company_tags) as company_tag_links,
    (SELECT COUNT(*) FROM event_tags) as event_tag_links,
    (SELECT COUNT(*) FROM group_tags) as group_tag_links,
    (SELECT COUNT(*) FROM news_tags) as news_tag_links,
    (SELECT COUNT(*) FROM member_tags) as member_skill_tags;

-- Show top tags by usage
SELECT 
    t.name,
    t.category,
    t.usage_count,
    t.color
FROM tags t
ORDER BY t.usage_count DESC, t.name
LIMIT 15;