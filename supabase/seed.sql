-- Comprehensive seed file for Nelson Tech Community Platform

-- Create test users and assign roles using helper functions
DO $$ 
DECLARE 
  admin_user_id uuid;
  superadmin_user_id uuid;
  groupmember_user_id uuid;
  basic_user_id uuid;
BEGIN
  -- Create test users
  admin_user_id := private.create_test_user('admin@example.com', 'password123');
  superadmin_user_id := private.create_test_user('superadmin@example.com', 'password123');
  groupmember_user_id := private.create_test_user('member@example.com', 'password123');
  basic_user_id := private.create_test_user('basic@example.com', 'password123');

  -- Assign roles to admin_user
  PERFORM private.assign_role_to_user(admin_user_id, 'authenticated');
  PERFORM private.assign_role_to_user(admin_user_id, 'admin');

  -- Assign roles to superadmin_user
  PERFORM private.assign_role_to_user(superadmin_user_id, 'authenticated');
  PERFORM private.assign_role_to_user(superadmin_user_id, 'superadmin');

  -- Assign roles to groupmember_user
  PERFORM private.assign_role_to_user(groupmember_user_id, 'authenticated');
  PERFORM private.assign_role_to_user(groupmember_user_id, 'group_member');

  -- Assign role to basic_user
  PERFORM private.assign_role_to_user(basic_user_id, 'authenticated');

  RAISE NOTICE 'Test users created and roles assigned.';
END $$;

-- Note: It's common for every authenticated user to at least have the 'authenticated' role.
-- The private.create_test_user function sets the user's role in auth.users to 'authenticated',
-- and we explicitly add 'authenticated' to our public.user_roles table for clarity and potential
-- specific RLS policies on user_roles itself that might check this.

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
INSERT INTO companies (id, name, description, logo, cover_image_url, industry, size, founded, location, status, featured) VALUES
('6ba7b810-9dad-11d1-80b4-00c04fd430c8', 'Mountain Tech Solutions', 'Innovative software development company focused on sustainable technology', 'https://placehold.co/400x400?text=MTS', 'https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', ARRAY['Software Development', 'Technology'], 'Small (1-10)', '2018', 'Nelson, BC', 'published', true),
('6ba7b811-9dad-11d1-80b4-00c04fd430c8', 'Green Valley Design', 'Creative design studio specializing in eco-friendly branding', 'https://placehold.co/400x400?text=GVD', 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', ARRAY['Design', 'Marketing'], 'Small (1-10)', '2019', 'Nelson, BC', 'published', false),
('6ba7b812-9dad-11d1-80b4-00c04fd430c8', 'Data Insights Co', 'Data analytics company helping businesses make better decisions', 'https://placehold.co/400x400?text=DIC', 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', ARRAY['Data Analytics', 'Consulting'], 'Medium (11-50)', '2017', 'Nelson, BC', 'published', true),
-- Added 12 new local organizations below
('c0000001-0000-0000-0000-000000000001', 'Kootenay Co-op', 'A community-owned grocery store offering local, organic, and natural foods. Committed to supporting local producers and sustainable practices.', 'https://images.pexels.com/photos/2252584/pexels-photo-2252584.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', ARRAY['Retail', 'Grocery', 'Organic Foods', 'Local Business'], '51-200 employees', '1975', 'Nelson, BC', 'published', true),
('c0000002-0000-0000-0000-000000000002', 'Oso Negro Coffee', 'Artisan coffee roaster and iconic café in Nelson, known for its quality beans, vibrant atmosphere, and beautiful garden.', 'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', 'https://images.pexels.com/photos/1695052/pexels-photo-1695052.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', ARRAY['Food & Beverage', 'Coffee Shop', 'Retail', 'Local Business'], 'Medium (11-50)', '1993', 'Nelson, BC', 'published', true),
('c0000003-0000-0000-0000-000000000003', 'Whitewater Ski Resort', 'Legendary ski resort famous for its deep powder, challenging terrain, and community vibe. Offers winter and summer mountain experiences.', 'https://images.pexels.com/photos/3408353/pexels-photo-3408353.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', 'https://images.pexels.com/photos/776092/pexels-photo-776092.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', ARRAY['Tourism', 'Recreation', 'Ski Resort', 'Hospitality'], '51-200 employees', '1976', 'Nelson, BC', 'published', false),
('c0000004-0000-0000-0000-000000000004', 'Nelson Brewing Company', 'Award-winning organic brewery, one of BC’s oldest. Crafting high-quality, certified organic ales and lagers.', 'https://images.pexels.com/photos/1267338/pexels-photo-1267338.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', 'https://images.pexels.com/photos/274192/pexels-photo-274192.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', ARRAY['Food & Beverage', 'Brewery', 'Organic Products', 'Manufacturing'], 'Medium (11-50)', '1991', 'Nelson, BC', 'published', true),
('c0000005-0000-0000-0000-000000000005', 'Kootenay Mountain Culture Magazine', 'Independent print magazine celebrating the rich culture and lifestyle of BC’s mountain communities. Stunning photography and storytelling.', 'https://images.pexels.com/photos/261579/pexels-photo-261579.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', 'https://images.pexels.com/photos/15286/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', ARRAY['Media', 'Publishing', 'Outdoor Recreation', 'Arts & Culture'], 'Small (1-10)', '2002', 'Nelson, BC', 'published', false),
('c0000006-0000-0000-0000-000000000006', 'Kaslo Jazz Etc. Festival', 'Unique outdoor music festival held on a floating stage in Kaslo Bay, featuring diverse jazz, blues, and world music artists.', 'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', 'https://images.pexels.com/photos/196652/pexels-photo-196652.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', ARRAY['Arts & Culture', 'Events', 'Music Festival', 'Tourism'], 'Small (1-10)', '1991', 'Kaslo, BC', 'published', true),
('c0000007-0000-0000-0000-000000000007', 'Selkirk College', 'Community college offering a wide range of programs including university arts and sciences, trades, health, and creative arts. Campuses across the West Kootenay & Boundary.', 'https://images.pexels.com/photos/256490/pexels-photo-256490.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', 'https://images.pexels.com/photos/207692/pexels-photo-207692.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', ARRAY['Education', 'Post-Secondary', 'Community College', 'Trades Training'], '201-500 employees', '1966', 'Castlegar, BC (Main Campus)', 'published', true),
('c0000008-0000-0000-0000-000000000008', 'Creston Valley Mechatronics', 'Innovative company specializing in custom automation solutions, robotics, and mechatronic systems for agricultural and industrial applications.', 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', 'https://images.pexels.com/photos/7107529/pexels-photo-7107529.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', ARRAY['Manufacturing', 'Technology', 'Automation', 'Robotics'], 'Medium (11-50)', '2016', 'Creston, BC', 'published', false),
('c0000009-0000-0000-0000-000000000009', 'Revelstoke Renewable Energy', 'Developing and promoting renewable energy projects in the Revelstoke area, including solar, micro-hydro, and geothermal solutions.', 'https://images.pexels.com/photos/433308/pexels-photo-433308.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', 'https://images.pexels.com/photos/1591373/pexels-photo-1591373.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', ARRAY['Energy', 'Sustainability', 'Renewable Technology'], 'Small (1-10)', '2021', 'Revelstoke, BC', 'published', true),
('c000000a-0000-0000-0000-00000000000a', 'Golden Timber Framing', 'Crafting beautiful and sustainable timber frame homes and structures. Combining traditional craftsmanship with modern building science.', 'https://images.pexels.com/photos/129494/pexels-photo-129494.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', 'https://images.pexels.com/photos/2089698/pexels-photo-2089698.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', ARRAY['Construction', 'Trades', 'Home Building'], 'Medium (11-50)', '2005', 'Golden, BC', 'published', false),
('c000000b-0000-0000-0000-00000000000b', 'Nakusp Wellness Collective', 'A collaborative space for holistic health practitioners, offering massage therapy, acupuncture, yoga, and naturopathic services.', 'https://images.pexels.com/photos/3985321/pexels-photo-3985321.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', 'https://images.pexels.com/photos/4056535/pexels-photo-4056535.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', ARRAY['Health & Wellness', 'Alternative Medicine', 'Therapy'], 'Small (1-10)', '2022', 'Nakusp, BC', 'published', false),
('c000000c-0000-0000-0000-00000000000c', 'Fernie Alpine Catering', 'Providing exceptional catering services for weddings, corporate events, and private parties in Fernie and the Elk Valley. Mountain-inspired cuisine.', 'https://images.pexels.com/photos/699953/pexels-photo-699953.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', 'https://images.pexels.com/photos/3323682/pexels-photo-3323682.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', ARRAY['Hospitality', 'Food Service', 'Event Catering'], 'Small (1-10)', '2014', 'Fernie, BC', 'published', true)
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
('b5a0d63f-5d34-4878-a70c-40e15913d984', 'Local Tech Company Expands Operations', 'local-tech-company-expands-operations', 'Mountain Tech Solutions, a local software development company, has announced plans to expand their operations in Nelson. The expansion will create new job opportunities for tech professionals in the area.', 'Mountain Tech Solutions announces expansion plans in Nelson', 'https://placehold.co/1200x600?text=Company+Expansion', '2023-05-20', 'published', ARRAY['business', 'jobs'], 'f47ac10b-58cc-4372-a567-0e02b2c3d483', true),
-- Start of 12 new mock articles (author_id is placeholder)
('c1a0d63f-5d34-4878-a70c-40e15913d001', 'The Future of AI in Rural Communities', 'the-future-of-ai-in-rural-communities', 'Exploring how artificial intelligence can bridge gaps and create opportunities in less urbanized areas like the Kootenays. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.', 'Exploring how artificial intelligence can bridge gaps and create opportunities in less urbanized areas like the Kootenays.', 'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg', '2025-05-20', 'published', ARRAY['AI', 'Rural Tech', 'Innovation'], 'f47ac10b-58cc-4372-a567-0e02b2c3d479', true),
('c1a0d63f-5d34-4878-a70c-40e15913d002', 'Getting Started with Machine Learning: A Kootenay Perspective', 'getting-started-with-machine-learning-a-kootenay-perspective', 'A beginner-friendly guide to ML concepts, with a focus on resources available to aspiring techies in the Kootenay region. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.', 'A beginner-friendly guide to ML concepts, with a focus on resources available to aspiring techies in the Kootenay region.', 'https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg', '2025-05-15', 'published', ARRAY['Machine Learning', 'Education', 'Kootenays'], 'f47ac10b-58cc-4372-a567-0e02b2c3d479', false),
('c1a0d63f-5d34-4878-a70c-40e15913d003', 'Data-Driven Decisions for Small Town Businesses', 'data-driven-decisions-for-small-town-businesses', 'How small businesses in towns like Rossland and Nelson can leverage data analytics for growth. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit.', 'How small businesses in towns like Rossland and Nelson can leverage data analytics for growth.', 'https://images.pexels.com/photos/669615/pexels-photo-669615.jpeg', '2025-05-10', 'published', ARRAY['Data Science', 'Small Business', 'Analytics'], 'f47ac10b-58cc-4372-a567-0e02b2c3d479', true),
('c1a0d63f-5d34-4878-a70c-40e15913d004', 'Accessible Web Design: Why It Matters for Kootenay Websites', 'accessible-web-design-why-it-matters-for-kootenay-websites', 'Ensuring your local business website is usable by everyone, including those with disabilities. Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur.', 'Ensuring your local business website is usable by everyone, including those with disabilities.', 'https://images.pexels.com/photos/270348/pexels-photo-270348.jpeg', '2025-05-05', 'published', ARRAY['Web Design', 'Accessibility', 'UX'], 'f47ac10b-58cc-4372-a567-0e02b2c3d479', false),
('c1a0d63f-5d34-4878-a70c-40e15913d005', 'Building Scalable Backends for Local Tech Startups', 'building-scalable-backends-for-local-tech-startups', 'Challenges and solutions for developing robust backend systems for growing Kootenay tech companies. Similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga.', 'Challenges and solutions for developing robust backend systems for growing Kootenay tech companies.', 'https://images.pexels.com/photos/577585/pexels-photo-577585.jpeg', '2025-04-30', 'published', ARRAY['Backend', 'Startups', 'Scalability'], 'f47ac10b-58cc-4372-a567-0e02b2c3d479', true),
('c1a0d63f-5d34-4878-a70c-40e15913d006', 'Blockchain Beyond Crypto: Use Cases for Regional Economies', 'blockchain-beyond-crypto-use-cases-for-regional-economies', 'Exploring practical applications of blockchain technology that could benefit the Kootenay region. Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet.', 'Exploring practical applications of blockchain technology that could benefit the Kootenay region.', 'https://images.pexels.com/photos/735911/pexels-photo-735911.jpeg', '2025-04-25', 'published', ARRAY['Blockchain', 'Innovation', 'Local Economy'], 'f47ac10b-58cc-4372-a567-0e02b2c3d479', false),
('c1a0d63f-5d34-4878-a70c-40e15913d007', 'Unlocking Insights: A Data Analyst''s Journey in Nelson', 'unlocking-insights-a-data-analysts-journey-in-nelson', 'A personal story about working as a data analyst in the Kootenay tech scene. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.', 'A personal story about working as a data analyst in the Kootenay tech scene.', 'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg', '2025-04-20', 'published', ARRAY['Data Analysis', 'Career', 'Nelson Tech'], 'f47ac10b-58cc-4372-a567-0e02b2c3d479', true),
('c1a0d63f-5d34-4878-a70c-40e15913d008', 'DevOps in the Mountains: CI/CD for Kootenay Tech Teams', 'devops-in-the-mountains-cicd-for-kootenay-tech-teams', 'Implementing efficient DevOps practices for software teams based in the Kootenays. Vitae congue eu consequat ac felis donec et odio.', 'Implementing efficient DevOps practices for software teams based in the Kootenays.', 'https://images.pexels.com/photos/4974914/pexels-photo-4974914.jpeg', '2025-04-15', 'published', ARRAY['DevOps', 'CI/CD', 'Software Development'], 'f47ac10b-58cc-4372-a567-0e02b2c3d479', false),
('c1a0d63f-5d34-4878-a70c-40e15913d009', 'User Research for Local Impact: A Kootenay Case Study', 'user-research-for-local-impact-a-kootenay-case-study', 'How understanding local user needs shaped a recent tech project in the region. Pellentesque habitant morbi tristique senectus et netus et malesuada.', 'How understanding local user needs shaped a recent tech project in the region.', 'https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg', '2025-04-10', 'published', ARRAY['UX Research', 'User Experience', 'Case Study'], 'f47ac10b-58cc-4372-a567-0e02b2c3d479', true),
('c1a0d63f-5d34-4878-a70c-40e15913d010', 'Crafting Native iOS Experiences for the Kootenay Market', 'crafting-native-ios-experiences-for-the-kootenay-market', 'Tips and tricks for developing iOS apps that resonate with users in the Kootenay region. Nisl rhoncus mattis rhoncus urna neque viverra justo nec.', 'Tips and tricks for developing iOS apps that resonate with users in the Kootenay region.', 'https://images.pexels.com/photos/39284/pexels-photo-39284.jpeg', '2025-04-05', 'published', ARRAY['iOS Development', 'Mobile Apps', 'App Design'], 'f47ac10b-58cc-4372-a567-0e02b2c3d479', false),
('c1a0d63f-5d34-4878-a70c-40e15913d011', 'The Art of Clear Technical Writing for Complex Kootenay Tech', 'the-art-of-clear-technical-writing-for-complex-kootenay-tech', 'Making complex technology understandable through effective technical documentation. Faucibus purus in massa tempor nec feugiat nisl pretium.', 'Making complex technology understandable through effective technical documentation.', 'https://images.pexels.com/photos/261662/pexels-photo-261662.jpeg', '2025-03-30', 'published', ARRAY['Technical Writing', 'Documentation', 'Communication'], 'f47ac10b-58cc-4372-a567-0e02b2c3d479', true),
('c1a0d63f-5d34-4878-a70c-40e15913d012', 'AI/ML Innovations Brewing in Rossland''s Tech Scene', 'aiml-innovations-brewing-in-rosslands-tech-scene', 'A look at exciting AI and Machine Learning projects emerging from Rossland, BC. Elementum curabitur vitae nunc sed velit dignissim sodales ut.', 'A look at exciting AI and Machine Learning projects emerging from Rossland, BC.', 'https://images.pexels.com/photos/546819/pexels-photo-546819.jpeg', '2025-03-25', 'published', ARRAY['AI', 'Machine Learning', 'Rossland Tech'], 'f47ac10b-58cc-4372-a567-0e02b2c3d479', false)
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
