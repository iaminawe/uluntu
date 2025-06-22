-- Create pages table for content management with Novel editor
CREATE TABLE IF NOT EXISTS pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  content TEXT,
  excerpt TEXT,
  hero_image TEXT,
  author_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  meta_title VARCHAR(255),
  meta_description TEXT,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX idx_pages_slug ON pages(slug);
CREATE INDEX idx_pages_author_id ON pages(author_id);
CREATE INDEX idx_pages_status ON pages(status);
CREATE INDEX idx_pages_is_featured ON pages(is_featured);
CREATE INDEX idx_pages_published_at ON pages(published_at);
CREATE INDEX idx_pages_created_at ON pages(created_at);
CREATE INDEX idx_pages_updated_at ON pages(updated_at);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_pages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER pages_updated_at_trigger
  BEFORE UPDATE ON pages
  FOR EACH ROW
  EXECUTE FUNCTION update_pages_updated_at();

-- Row Level Security (RLS) policies
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;

-- Public can read published pages
CREATE POLICY "Public can read published pages" ON pages
  FOR SELECT USING (status = 'published');

-- Authors can view their own pages regardless of status
CREATE POLICY "Authors can view their own pages" ON pages
  FOR SELECT USING (
    auth.uid() = author_id
  );

-- Admins and superadmins can view all pages
CREATE POLICY "Admins can view all pages" ON pages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'superadmin')
    )
  );

-- Authors can create pages
CREATE POLICY "Authors can create pages" ON pages
  FOR INSERT WITH CHECK (
    auth.uid() = author_id AND
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('authenticated', 'group_member', 'admin', 'superadmin')
    )
  );

-- Authors can update their own pages
CREATE POLICY "Authors can update their own pages" ON pages
  FOR UPDATE USING (
    auth.uid() = author_id
  ) WITH CHECK (
    auth.uid() = author_id
  );

-- Admins can update any page
CREATE POLICY "Admins can update any page" ON pages
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'superadmin')
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'superadmin')
    )
  );

-- Authors can delete their own pages
CREATE POLICY "Authors can delete their own pages" ON pages
  FOR DELETE USING (
    auth.uid() = author_id
  );

-- Admins can delete any page
CREATE POLICY "Admins can delete any page" ON pages
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'superadmin')
    )
  );

-- Add some sample pages (optional)
INSERT INTO pages (title, slug, content, excerpt, author_id, status, is_featured, published_at)
SELECT 
  'Welcome to Nelson Tech Community',
  'welcome',
  '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Welcome to the Nelson Tech Community platform! This is a place where technology professionals, entrepreneurs, and enthusiasts in the Nelson area can connect, share knowledge, and collaborate on exciting projects."}]},{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"What We Offer"}]},{"type":"bulletList","content":[{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Professional networking opportunities"}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Regular meetups and events"}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Job and volunteer opportunities"}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Knowledge sharing and mentorship"}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Access to local tech resources"}]}]}]},{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"Getting Started"}]},{"type":"paragraph","content":[{"type":"text","text":"To get the most out of our community, we recommend:"}]},{"type":"orderedList","content":[{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Complete your profile with your skills and interests"}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Join relevant groups based on your expertise"}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Attend our upcoming events"}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","text":"Connect with other members in your field"}]}]}]},{"type":"paragraph","content":[{"type":"text","text":"We''re excited to have you as part of our growing tech community!"}]}]}',
  'Welcome to the Nelson Tech Community platform! Connect, share knowledge, and collaborate with technology professionals in the Nelson area.',
  (SELECT id FROM members WHERE email = 'admin@nelsontech.ca' LIMIT 1),
  'published',
  true,
  now()
WHERE EXISTS (SELECT 1 FROM members WHERE email = 'admin@nelsontech.ca');

INSERT INTO pages (title, slug, content, excerpt, author_id, status, published_at)
SELECT 
  'About Us',
  'about',
  '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"The Nelson Tech Community was founded in 2024 with a mission to bring together technology professionals and enthusiasts in the beautiful Kootenay region of British Columbia."}]},{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"Our Mission"}]},{"type":"paragraph","content":[{"type":"text","text":"We strive to create an inclusive environment where people can learn, grow, and collaborate on innovative projects that benefit our local community and beyond."}]},{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"Our Values"}]},{"type":"bulletList","content":[{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","marks":[{"type":"bold"}],"text":"Collaboration:"},{"type":"text","text":" We believe in the power of working together"}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","marks":[{"type":"bold"}],"text":"Innovation:"},{"type":"text","text":" We encourage creative problem-solving and new ideas"}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","marks":[{"type":"bold"}],"text":"Inclusivity:"},{"type":"text","text":" Everyone is welcome regardless of background or experience level"}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"text","marks":[{"type":"bold"}],"text":"Growth:"},{"type":"text","text":" We support continuous learning and professional development"}]}]}]},{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"Get Involved"}]},{"type":"paragraph","content":[{"type":"text","text":"Whether you''re a seasoned developer, a startup founder, a student, or simply curious about technology, there''s a place for you in our community. Join us today and be part of something amazing!"}]}]}',
  'Learn about the Nelson Tech Community, our mission, values, and how you can get involved in our growing technology ecosystem.',
  (SELECT id FROM members WHERE email = 'admin@nelsontech.ca' LIMIT 1),
  'published',
  now()
WHERE EXISTS (SELECT 1 FROM members WHERE email = 'admin@nelsontech.ca');