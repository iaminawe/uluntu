/*
  # Create news table and related tables

  1. New Tables
    - `news`
      - `id` (uuid, primary key)
      - `created_at` (timestamp)
      - `title` (text)
      - `slug` (text)
      - `content` (text)
      - `excerpt` (text)
      - `hero_image` (text)
      - `hero_image_alt` (text)
      - `publish_date` (date)
      - `status` (text)
      - `tags` (text[])
      - `author_id` (uuid, references members.id)
      - `featured` (boolean)
    - `news_associations`
      - `news_id` (uuid, references news.id)
      - `association_type` (text)
      - `association_id` (uuid)
  2. Security
    - Enable RLS on both tables
    - Add policies for different user roles
*/

-- Create news table
CREATE TABLE IF NOT EXISTS news (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL,
  excerpt TEXT,
  hero_image TEXT,
  hero_image_alt TEXT,
  publish_date DATE,
  status TEXT NOT NULL DEFAULT 'draft',
  tags TEXT[],
  author_id UUID REFERENCES members(id) ON DELETE SET NULL,
  featured BOOLEAN DEFAULT false
);

-- Create news_associations table
CREATE TABLE IF NOT EXISTS news_associations (
  news_id UUID REFERENCES news(id) ON DELETE CASCADE,
  association_type TEXT NOT NULL,
  association_id UUID NOT NULL,
  PRIMARY KEY (news_id, association_type, association_id)
);

-- Enable Row Level Security
ALTER TABLE news ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_associations ENABLE ROW LEVEL SECURITY;

-- Create policies for news table

-- Anyone can read published news
CREATE POLICY "Anyone can read published news"
  ON news
  FOR SELECT
  USING (status = 'published');

-- Authors can read, update, and delete their own news
CREATE POLICY "Authors can read their own news"
  ON news
  FOR SELECT
  USING (
    author_id IN (
      SELECT id FROM members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Authors can update their own news"
  ON news
  FOR UPDATE
  USING (
    author_id IN (
      SELECT id FROM members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Authors can delete their own news"
  ON news
  FOR DELETE
  USING (
    author_id IN (
      SELECT id FROM members WHERE user_id = auth.uid()
    )
  );

-- Authenticated users can create news
CREATE POLICY "Authenticated users can create news"
  ON news
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL AND
    author_id IN (
      SELECT id FROM members WHERE user_id = auth.uid()
    )
  );

-- Superadmins can do anything with news
CREATE POLICY "Superadmins can manage all news"
  ON news
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'superadmin'
    )
  );

-- Create policies for news_associations table

-- Anyone can read news associations for published news
CREATE POLICY "Anyone can read news associations for published news"
  ON news_associations
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM news
      WHERE news.id = news_associations.news_id
      AND news.status = 'published'
    )
  );

-- Authors can manage associations for their own news
CREATE POLICY "Authors can manage associations for their own news"
  ON news_associations
  USING (
    EXISTS (
      SELECT 1 FROM news
      WHERE news.id = news_associations.news_id
      AND news.author_id IN (
        SELECT id FROM members WHERE user_id = auth.uid()
      )
    )
  );

-- Superadmins can do anything with news associations
CREATE POLICY "Superadmins can manage all news associations"
  ON news_associations
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'superadmin'
    )
  );