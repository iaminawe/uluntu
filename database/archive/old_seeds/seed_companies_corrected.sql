-- Corrected Companies Seed Data
-- The column is 'size' not 'employees'

INSERT INTO companies (name, description, industry, website, size, founded, location, logo, status, featured) VALUES
('Nelson Tech Solutions', 'Full-service web development and digital solutions company specializing in modern tech stacks and user experience design.', ARRAY['Technology'], 'https://nelsontechsolutions.com', '25-50', '2018', 'Nelson, BC', 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400', 'published', true),
('Kootenay Digital Marketing', 'Digital marketing agency helping local businesses grow their online presence through strategic SEO, social media, and content marketing.', ARRAY['Marketing'], 'https://kootenaydigital.ca', '10-25', '2020', 'Castlegar, BC', 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=400', 'published', true),
('Mountain Innovation Labs', 'R&D company focused on sustainable technology solutions for rural communities and environmental monitoring systems.', ARRAY['Clean Technology'], 'https://mountaininnovation.ca', '15-30', '2019', 'Kaslo, BC', 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400', 'published', false),
('Selkirk Software Co.', 'Custom software development company specializing in enterprise solutions and mobile applications for outdoor recreation industry.', ARRAY['Software Development'], 'https://selkirksoftware.com', '5-15', '2021', 'Nelson, BC', 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=400', 'published', false),
('Remote First Solutions', 'Distributed team building enterprise software with a focus on collaboration tools for remote work environments.', ARRAY['Software Development', 'Technology'], 'https://remotefirstsolutions.com', '50-100', '2020', 'Remote', 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400', 'published', true),
('Green Mountain Tech', 'Environmental monitoring and IoT solutions for sustainable resource management in mountain communities.', ARRAY['Clean Technology', 'IoT'], 'https://greenmountaintech.ca', '5-10', '2022', 'Rossland, BC', 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400', 'published', false)
ON CONFLICT (id) DO NOTHING;


-- Verify the companies were inserted
SELECT name, size, industry, status FROM companies ORDER BY created_at DESC;