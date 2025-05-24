-- Comprehensive seed file for Nelson Tech Community Platform

-- Note: We're not inserting any user_roles data since it depends on auth.users
-- which requires actual authentication setup

-- Insert sample members
INSERT INTO members (id, name, title, bio, location, image, website, employment_status, open_to_volunteering, status, featured) VALUES
('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'Sarah Johnson', 'Full Stack Developer', 'Experienced developer with a passion for clean code', 'Nelson, BC', 'https://randomuser.me/api/portraits/women/1.jpg', 'https://sarahjohnson.dev', 'Employed', true, 'published', true),
('f47ac10b-58cc-4372-a567-0e02b2c3d480', 'Michael Chen', 'UX Designer', 'Creating beautiful and functional user experiences', 'Nelson, BC', 'https://randomuser.me/api/portraits/men/2.jpg', 'https://michaelchen.design', 'Freelance', true, 'published', false),
('f47ac10b-58cc-4372-a567-0e02b2c3d481', 'Emily Rodriguez', 'Data Scientist', 'Turning data into actionable insights', 'Nelson, BC', 'https://randomuser.me/api/portraits/women/3.jpg', 'https://emilyrodriguez.io', 'Employed', false, 'published', true),
('f47ac10b-58cc-4372-a567-0e02b2c3d482', 'David Kim', 'DevOps Engineer', 'Automating everything for efficient workflows', 'Nelson, BC', 'https://randomuser.me/api/portraits/men/4.jpg', 'https://davidkim.tech', 'Looking for work', true, 'published', false),
('f47ac10b-58cc-4372-a567-0e02b2c3d483', 'Lisa Patel', 'Frontend Developer', 'Creating responsive and accessible web interfaces', 'Nelson, BC', 'https://randomuser.me/api/portraits/women/5.jpg', 'https://lisapatel.dev', 'Employed', true, 'published', true)
ON CONFLICT DO NOTHING;

-- Insert sample member skills
INSERT INTO member_skills (member_id, skill) VALUES
('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'JavaScript'),
('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'React'),
('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'Node.js'),
('f47ac10b-58cc-4372-a567-0e02b2c3d480', 'UI Design'),
('f47ac10b-58cc-4372-a567-0e02b2c3d480', 'Figma'),
('f47ac10b-58cc-4372-a567-0e02b2c3d480', 'User Research'),
('f47ac10b-58cc-4372-a567-0e02b2c3d481', 'Python'),
('f47ac10b-58cc-4372-a567-0e02b2c3d481', 'Machine Learning'),
('f47ac10b-58cc-4372-a567-0e02b2c3d481', 'SQL'),
('f47ac10b-58cc-4372-a567-0e02b2c3d482', 'Docker'),
('f47ac10b-58cc-4372-a567-0e02b2c3d482', 'Kubernetes'),
('f47ac10b-58cc-4372-a567-0e02b2c3d482', 'AWS'),
('f47ac10b-58cc-4372-a567-0e02b2c3d483', 'HTML'),
('f47ac10b-58cc-4372-a567-0e02b2c3d483', 'CSS'),
('f47ac10b-58cc-4372-a567-0e02b2c3d483', 'Vue.js')
ON CONFLICT DO NOTHING;

-- Insert sample companies
INSERT INTO companies (id, name, description, logo, industry, size, founded, location, status, featured) VALUES
('6ba7b810-9dad-11d1-80b4-00c04fd430c8', 'Mountain Tech Solutions', 'Innovative software development company focused on sustainable technology', 'https://placehold.co/400x400?text=MTS', ARRAY['Software Development', 'Technology'], 'Small (1-10)', '2018', 'Nelson, BC', 'published', true),
('6ba7b811-9dad-11d1-80b4-00c04fd430c8', 'Green Valley Design', 'Creative design studio specializing in eco-friendly branding', 'https://placehold.co/400x400?text=GVD', ARRAY['Design', 'Marketing'], 'Small (1-10)', '2019', 'Nelson, BC', 'published', false),
('6ba7b812-9dad-11d1-80b4-00c04fd430c8', 'Data Insights Co', 'Data analytics company helping businesses make better decisions', 'https://placehold.co/400x400?text=DIC', ARRAY['Data Analytics', 'Consulting'], 'Medium (11-50)', '2017', 'Nelson, BC', 'published', true)
ON CONFLICT DO NOTHING;

-- Insert sample company members
INSERT INTO company_members (company_id, member_id, role, joined_date) VALUES
('6ba7b810-9dad-11d1-80b4-00c04fd430c8', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'Lead Developer', '2020-01-15'),
('6ba7b810-9dad-11d1-80b4-00c04fd430c8', 'f47ac10b-58cc-4372-a567-0e02b2c3d482', 'DevOps Specialist', '2021-03-10'),
('6ba7b811-9dad-11d1-80b4-00c04fd430c8', 'f47ac10b-58cc-4372-a567-0e02b2c3d480', 'Senior Designer', '2019-06-20'),
('6ba7b811-9dad-11d1-80b4-00c04fd430c8', 'f47ac10b-58cc-4372-a567-0e02b2c3d483', 'Web Developer', '2020-11-05'),
('6ba7b812-9dad-11d1-80b4-00c04fd430c8', 'f47ac10b-58cc-4372-a567-0e02b2c3d481', 'Data Scientist', '2018-09-12')
ON CONFLICT DO NOTHING;

-- Insert sample groups
INSERT INTO groups (id, name, description, long_description, hero_image, visibility, status, featured) VALUES
('7c9e6679-7425-40de-944b-e07fc1f90ae7', 'Nelson Tech Meetup', 'Regular meetups for tech professionals in Nelson', 'We host monthly meetups covering various technology topics. Join us to network with other tech professionals, learn new skills, and share your knowledge.', 'https://placehold.co/1200x600?text=Tech+Meetup', 'open', 'published', true),
('7c9e6679-7425-40de-944b-e07fc1f90ae8', 'Web Development Study Group', 'Study group focused on web development technologies', 'Our study group meets weekly to learn and practice web development skills. We cover frontend and backend technologies, with a focus on modern frameworks and best practices.', 'https://placehold.co/1200x600?text=Web+Dev', 'closed', 'published', false),
('7c9e6679-7425-40de-944b-e07fc1f90ae9', 'Data Science Club', 'Group for data enthusiasts to share knowledge', 'A community of data scientists, analysts, and enthusiasts who share knowledge, discuss trends, and collaborate on projects. We welcome all skill levels from beginners to experts.', 'https://placehold.co/1200x600?text=Data+Science', 'secret', 'published', true)
ON CONFLICT DO NOTHING;

-- Insert sample group members
INSERT INTO group_members (group_id, member_id, role, joined_date) VALUES
('7c9e6679-7425-40de-944b-e07fc1f90ae7', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'admin', '2022-01-10'),
('7c9e6679-7425-40de-944b-e07fc1f90ae7', 'f47ac10b-58cc-4372-a567-0e02b2c3d480', 'member', '2022-02-15'),
('7c9e6679-7425-40de-944b-e07fc1f90ae7', 'f47ac10b-58cc-4372-a567-0e02b2c3d481', 'member', '2022-03-20'),
('7c9e6679-7425-40de-944b-e07fc1f90ae8', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'member', '2022-02-05'),
('7c9e6679-7425-40de-944b-e07fc1f90ae8', 'f47ac10b-58cc-4372-a567-0e02b2c3d483', 'admin', '2022-01-25'),
('7c9e6679-7425-40de-944b-e07fc1f90ae9', 'f47ac10b-58cc-4372-a567-0e02b2c3d481', 'admin', '2022-01-15'),
('7c9e6679-7425-40de-944b-e07fc1f90ae9', 'f47ac10b-58cc-4372-a567-0e02b2c3d482', 'member', '2022-02-20')
ON CONFLICT DO NOTHING;

-- Insert sample events
INSERT INTO events (id, title, description, date, location, image, type, status, featured, organizer_id, group_id) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Introduction to React Hooks', 'Learn how to use React Hooks to simplify your components', '2023-06-15 18:00:00', 'Nelson Innovation Centre', 'https://placehold.co/1200x600?text=React+Hooks', 'in-person', 'published', true, 'f47ac10b-58cc-4372-a567-0e02b2c3d479', '7c9e6679-7425-40de-944b-e07fc1f90ae7'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Web Accessibility Workshop', 'Hands-on workshop on making your websites accessible', '2023-07-20 17:30:00', 'Online', 'https://placehold.co/1200x600?text=Accessibility', 'online', 'published', false, 'f47ac10b-58cc-4372-a567-0e02b2c3d483', '7c9e6679-7425-40de-944b-e07fc1f90ae8'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'Data Visualization with Python', 'Explore data visualization techniques using Python libraries', '2023-08-10 19:00:00', 'Nelson Makerspace', 'https://placehold.co/1200x600?text=Data+Viz', 'in-person', 'published', true, 'f47ac10b-58cc-4372-a567-0e02b2c3d481', '7c9e6679-7425-40de-944b-e07fc1f90ae9')
ON CONFLICT DO NOTHING;

-- Insert sample event sessions
INSERT INTO event_sessions (id, event_id, title, description, start_time, end_time) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'React Hooks Basics', 'Introduction to useState and useEffect', '2023-06-15 18:00:00', '2023-06-15 19:00:00'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Advanced Hooks', 'Deep dive into useContext, useReducer, and custom hooks', '2023-06-15 19:15:00', '2023-06-15 20:15:00'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Accessibility Fundamentals', 'Core principles of web accessibility', '2023-07-20 17:30:00', '2023-07-20 18:30:00'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a17', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'Matplotlib and Seaborn', 'Creating effective visualizations with Python libraries', '2023-08-10 19:00:00', '2023-08-10 20:00:00')
ON CONFLICT DO NOTHING;

-- Insert sample event attendees
INSERT INTO event_attendees (event_id, member_id, registered_at, status) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'f47ac10b-58cc-4372-a567-0e02b2c3d480', '2023-05-20 10:15:00', 'registered'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'f47ac10b-58cc-4372-a567-0e02b2c3d482', '2023-05-22 14:30:00', 'registered'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', '2023-06-25 09:45:00', 'registered'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'f47ac10b-58cc-4372-a567-0e02b2c3d481', '2023-06-28 16:20:00', 'registered'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'f47ac10b-58cc-4372-a567-0e02b2c3d482', '2023-07-15 11:10:00', 'registered'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'f47ac10b-58cc-4372-a567-0e02b2c3d483', '2023-07-18 13:25:00', 'registered')
ON CONFLICT DO NOTHING;

-- Insert sample news articles
INSERT INTO news (id, title, slug, content, excerpt, hero_image, publish_date, status, tags, author_id, featured) VALUES
('b5a0d63f-5d34-4878-a70c-40e15913d982', 'Nelson Tech Community Launches New Website', 'nelson-tech-community-launches-new-website', 'The Nelson Tech Community is excited to announce the launch of our new website. This platform will serve as a hub for tech professionals in the Nelson area to connect, share resources, and stay updated on local tech events.', 'Nelson Tech Community launches a new website to connect local tech professionals', 'https://placehold.co/1200x600?text=Website+Launch', '2023-04-10', 'published', ARRAY['announcement', 'community'], 'f47ac10b-58cc-4372-a567-0e02b2c3d479', true),
('b5a0d63f-5d34-4878-a70c-40e15913d983', 'Upcoming Tech Workshops for Summer 2023', 'upcoming-tech-workshops-summer-2023', 'We are pleased to announce a series of tech workshops scheduled for Summer 2023. These workshops will cover various topics including web development, data science, and UX design. All workshops are open to members of the Nelson Tech Community.', 'Series of tech workshops announced for Summer 2023', 'https://placehold.co/1200x600?text=Summer+Workshops', '2023-05-15', 'published', ARRAY['events', 'workshops', 'learning'], 'f47ac10b-58cc-4372-a567-0e02b2c3d481', false),
('b5a0d63f-5d34-4878-a70c-40e15913d984', 'Local Tech Company Expands Operations', 'local-tech-company-expands-operations', 'Mountain Tech Solutions, a local software development company, has announced plans to expand their operations in Nelson. The expansion will create new job opportunities for tech professionals in the area.', 'Mountain Tech Solutions announces expansion plans in Nelson', 'https://placehold.co/1200x600?text=Company+Expansion', '2023-05-20', 'published', ARRAY['business', 'jobs'], 'f47ac10b-58cc-4372-a567-0e02b2c3d483', true)
ON CONFLICT DO NOTHING;

-- Insert sample news associations
INSERT INTO news_associations (news_id, association_type, association_id) VALUES
('b5a0d63f-5d34-4878-a70c-40e15913d982', 'group', '7c9e6679-7425-40de-944b-e07fc1f90ae7'),
('b5a0d63f-5d34-4878-a70c-40e15913d983', 'event', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
('b5a0d63f-5d34-4878-a70c-40e15913d983', 'event', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12'),
('b5a0d63f-5d34-4878-a70c-40e15913d984', 'company', '6ba7b810-9dad-11d1-80b4-00c04fd430c8')
ON CONFLICT DO NOTHING;

-- Insert sample resources
INSERT INTO resources (id, title, description, type, url, image, status, featured, contributor_id, group_id) VALUES
('c8b15161-4f92-4c3f-9a9f-8c6a9a3d2a1e', 'React Best Practices Guide', 'A comprehensive guide to React best practices for building scalable applications', 'guide', 'https://example.com/react-best-practices', 'https://placehold.co/800x400?text=React+Guide', 'published', true, 'f47ac10b-58cc-4372-a567-0e02b2c3d479', '7c9e6679-7425-40de-944b-e07fc1f90ae8'),
('c8b15161-4f92-4c3f-9a9f-8c6a9a3d2a1f', 'Introduction to Data Science with Python', 'Beginner-friendly introduction to data science concepts using Python', 'article', 'https://example.com/intro-data-science', 'https://placehold.co/800x400?text=Data+Science', 'published', false, 'f47ac10b-58cc-4372-a567-0e02b2c3d481', '7c9e6679-7425-40de-944b-e07fc1f90ae9'),
('c8b15161-4f92-4c3f-9a9f-8c6a9a3d2a20', 'Web Accessibility Checklist', 'Essential checklist for ensuring your websites are accessible to all users', 'document', 'https://example.com/accessibility-checklist', 'https://placehold.co/800x400?text=Accessibility', 'published', true, 'f47ac10b-58cc-4372-a567-0e02b2c3d483', NULL)
ON CONFLICT DO NOTHING;

-- Insert sample resource tags
INSERT INTO resource_tags (resource_id, tag) VALUES
('c8b15161-4f92-4c3f-9a9f-8c6a9a3d2a1e', 'react'),
('c8b15161-4f92-4c3f-9a9f-8c6a9a3d2a1e', 'javascript'),
('c8b15161-4f92-4c3f-9a9f-8c6a9a3d2a1e', 'frontend'),
('c8b15161-4f92-4c3f-9a9f-8c6a9a3d2a1f', 'python'),
('c8b15161-4f92-4c3f-9a9f-8c6a9a3d2a1f', 'data-science'),
('c8b15161-4f92-4c3f-9a9f-8c6a9a3d2a1f', 'beginner'),
('c8b15161-4f92-4c3f-9a9f-8c6a9a3d2a20', 'accessibility'),
('c8b15161-4f92-4c3f-9a9f-8c6a9a3d2a20', 'web'),
('c8b15161-4f92-4c3f-9a9f-8c6a9a3d2a20', 'best-practices')
ON CONFLICT DO NOTHING;

-- Insert sample marketplace listings
INSERT INTO marketplace_listings (id, title, description, type, price, condition, images, seller_id, location, tags, status, featured) VALUES
('d1a302d5-7109-4c75-9ec8-2d8f41ab8432', 'Web Development Services', 'Professional web development services for small businesses and startups', 'service', 75.00, NULL, ARRAY['https://placehold.co/800x600?text=Web+Dev'], 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'Nelson, BC', ARRAY['web-development', 'frontend', 'backend'], 'published', true),
('d1a302d5-7109-4c75-9ec8-2d8f41ab8433', 'Used MacBook Pro (2019)', '2019 MacBook Pro, 16-inch, 16GB RAM, 512GB SSD, excellent condition', 'product', 1200.00, 'used', ARRAY['https://placehold.co/800x600?text=MacBook'], 'f47ac10b-58cc-4372-a567-0e02b2c3d482', 'Nelson, BC', ARRAY['laptop', 'apple', 'macbook'], 'published', false),
('d1a302d5-7109-4c75-9ec8-2d8f41ab8434', 'UX Design Workshop', 'One-day workshop on UX design principles and practices', 'event', 50.00, NULL, ARRAY['https://placehold.co/800x600?text=UX+Workshop'], 'f47ac10b-58cc-4372-a567-0e02b2c3d480', 'Nelson, BC', ARRAY['ux', 'design', 'workshop'], 'published', true)
ON CONFLICT DO NOTHING;

-- Insert sample opportunities
INSERT INTO opportunities (id, title, description, type, location, remote, compensation, deadline, contact_email, website, image, status, featured, organization, posted_by, requirements, responsibilities, benefits) VALUES
('e4e1a013-c60c-4f9f-9a7b-3b5a0c2622d1', 'Full Stack Developer', 'We are looking for a skilled Full Stack Developer to join our team', 'full-time', 'Nelson, BC', true, '$70,000 - $90,000/year', '2023-07-30', 'jobs@mountaintech.example.com', 'https://mountaintech.example.com/careers', 'https://placehold.co/800x400?text=Developer+Job', 'published', true, 'Mountain Tech Solutions', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', ARRAY['3+ years experience with JavaScript', 'Experience with React and Node.js', 'Strong problem-solving skills'], ARRAY['Develop and maintain web applications', 'Collaborate with the design team', 'Optimize applications for performance'], ARRAY['Flexible work hours', 'Health benefits', 'Professional development budget']),
('e4e1a013-c60c-4f9f-9a7b-3b5a0c2622d2', 'UX/UI Designer', 'Seeking a talented UX/UI Designer to create beautiful user experiences', 'contract', 'Nelson, BC', true, '$40-50/hour', '2023-08-15', 'design@greenvalley.example.com', 'https://greenvalley.example.com/jobs', 'https://placehold.co/800x400?text=Designer+Job', 'published', false, 'Green Valley Design', 'f47ac10b-58cc-4372-a567-0e02b2c3d480', ARRAY['Portfolio demonstrating UI/UX skills', 'Experience with Figma or similar tools', 'Understanding of accessibility standards'], ARRAY['Create user-centered designs', 'Develop wireframes and prototypes', 'Conduct user testing'], ARRAY['Remote work options', 'Flexible schedule', 'Collaborative team environment']),
('e4e1a013-c60c-4f9f-9a7b-3b5a0c2622d3', 'Data Science Volunteer', 'Volunteer opportunity to help local non-profits with data analysis', 'volunteer', 'Nelson, BC', false, 'Unpaid', '2023-09-01', 'volunteer@datainsights.example.com', 'https://datainsights.example.com/volunteer', 'https://placehold.co/800x400?text=Volunteer', 'published', true, 'Data Insights Co', 'f47ac10b-58cc-4372-a567-0e02b2c3d481', ARRAY['Basic knowledge of data analysis', 'Familiarity with Python or R', 'Interest in non-profit sector'], ARRAY['Analyze data for local non-profits', 'Create visualizations and reports', 'Present findings to stakeholders'], ARRAY['Valuable experience', 'Networking opportunities', 'Reference letter upon completion'])
ON CONFLICT DO NOTHING;

-- Update counts for groups (this would normally be handled by triggers)
UPDATE groups
SET member_count = (
  SELECT COUNT(*) FROM group_members WHERE group_members.group_id = groups.id
);

-- Update counts for events (this would normally be handled by triggers)
UPDATE events
SET current_attendees = (
  SELECT COUNT(*) FROM event_attendees WHERE event_attendees.event_id = events.id
);
