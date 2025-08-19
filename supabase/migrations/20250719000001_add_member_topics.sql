-- Create member_topics junction table for tracking user interests
CREATE TABLE IF NOT EXISTS member_topics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
  
  -- Ensure unique combination of member and topic
  UNIQUE(member_id, topic_id)
);

-- Add indexes for better query performance
CREATE INDEX idx_member_topics_member_id ON member_topics(member_id);
CREATE INDEX idx_member_topics_topic_id ON member_topics(topic_id);

-- Enable RLS (Row Level Security)
ALTER TABLE member_topics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Allow users to view all member-topic relationships (for browsing interests)
CREATE POLICY "Anyone can view member topics" ON member_topics
  FOR SELECT USING (true);

-- Allow users to manage their own member's topics
CREATE POLICY "Users can manage their own member topics" ON member_topics
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM members 
      WHERE members.id = member_topics.member_id 
      AND members.user_id = auth.uid()
    )
  );

-- Create function to get topics for a member
CREATE OR REPLACE FUNCTION get_member_topics(p_member_id UUID)
RETURNS TABLE (
  id UUID,
  name TEXT,
  slug TEXT,
  description TEXT,
  icon TEXT,
  color TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id,
    t.name,
    t.slug,
    t.description,
    t.icon,
    t.color
  FROM topics t
  INNER JOIN member_topics mt ON mt.topic_id = t.id
  WHERE mt.member_id = p_member_id
  AND t.is_active = true
  ORDER BY t.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to set topics for a member (replace all existing)
CREATE OR REPLACE FUNCTION set_member_topics(
  p_member_id UUID,
  p_topic_ids UUID[]
) RETURNS VOID AS $$
BEGIN
  -- Check if user owns this member profile
  IF NOT EXISTS (
    SELECT 1 FROM members 
    WHERE id = p_member_id 
    AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Unauthorized: You can only manage topics for your own profile';
  END IF;

  -- Delete existing topics
  DELETE FROM member_topics WHERE member_id = p_member_id;
  
  -- Insert new topics
  IF p_topic_ids IS NOT NULL AND array_length(p_topic_ids, 1) > 0 THEN
    INSERT INTO member_topics (member_id, topic_id)
    SELECT p_member_id, unnest(p_topic_ids);
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add member_topics to the topic_analytics view
DROP VIEW IF EXISTS topic_analytics;
CREATE VIEW topic_analytics AS
SELECT 
  t.id,
  t.name,
  t.slug,
  t.icon,
  t.color,
  (
    COALESCE((SELECT COUNT(*) FROM event_topics WHERE topic_id = t.id), 0) +
    COALESCE((SELECT COUNT(*) FROM news_topics WHERE topic_id = t.id), 0) +
    COALESCE((SELECT COUNT(*) FROM resource_topics WHERE topic_id = t.id), 0) +
    COALESCE((SELECT COUNT(*) FROM marketplace_topics WHERE topic_id = t.id), 0) +
    COALESCE((SELECT COUNT(*) FROM opportunity_topics WHERE topic_id = t.id), 0) +
    COALESCE((SELECT COUNT(*) FROM group_topics WHERE topic_id = t.id), 0) +
    COALESCE((SELECT COUNT(*) FROM company_topics WHERE topic_id = t.id), 0) +
    COALESCE((SELECT COUNT(*) FROM member_topics WHERE topic_id = t.id), 0)
  ) AS total_content_count,
  (SELECT COUNT(*) FROM event_topics WHERE topic_id = t.id) AS event_count,
  (SELECT COUNT(*) FROM news_topics WHERE topic_id = t.id) AS news_count,
  (SELECT COUNT(*) FROM resource_topics WHERE topic_id = t.id) AS resource_count,
  (SELECT COUNT(*) FROM marketplace_topics WHERE topic_id = t.id) AS marketplace_count,
  (SELECT COUNT(*) FROM opportunity_topics WHERE topic_id = t.id) AS opportunity_count,
  (SELECT COUNT(*) FROM group_topics WHERE topic_id = t.id) AS group_count,
  (SELECT COUNT(*) FROM company_topics WHERE topic_id = t.id) AS company_count,
  (SELECT COUNT(*) FROM member_topics WHERE topic_id = t.id) AS member_count,
  CASE 
    WHEN (
      SELECT SUM(
        COALESCE((SELECT COUNT(*) FROM event_topics), 0) +
        COALESCE((SELECT COUNT(*) FROM news_topics), 0) +
        COALESCE((SELECT COUNT(*) FROM resource_topics), 0) +
        COALESCE((SELECT COUNT(*) FROM marketplace_topics), 0) +
        COALESCE((SELECT COUNT(*) FROM opportunity_topics), 0) +
        COALESCE((SELECT COUNT(*) FROM group_topics), 0) +
        COALESCE((SELECT COUNT(*) FROM company_topics), 0) +
        COALESCE((SELECT COUNT(*) FROM member_topics), 0)
      )
    ) > 0 THEN
      ROUND(
        (
          COALESCE((SELECT COUNT(*) FROM event_topics WHERE topic_id = t.id), 0) +
          COALESCE((SELECT COUNT(*) FROM news_topics WHERE topic_id = t.id), 0) +
          COALESCE((SELECT COUNT(*) FROM resource_topics WHERE topic_id = t.id), 0) +
          COALESCE((SELECT COUNT(*) FROM marketplace_topics WHERE topic_id = t.id), 0) +
          COALESCE((SELECT COUNT(*) FROM opportunity_topics WHERE topic_id = t.id), 0) +
          COALESCE((SELECT COUNT(*) FROM group_topics WHERE topic_id = t.id), 0) +
          COALESCE((SELECT COUNT(*) FROM company_topics WHERE topic_id = t.id), 0) +
          COALESCE((SELECT COUNT(*) FROM member_topics WHERE topic_id = t.id), 0)
        )::NUMERIC * 100 / (
          SELECT SUM(
            COALESCE((SELECT COUNT(*) FROM event_topics), 0) +
            COALESCE((SELECT COUNT(*) FROM news_topics), 0) +
            COALESCE((SELECT COUNT(*) FROM resource_topics), 0) +
            COALESCE((SELECT COUNT(*) FROM marketplace_topics), 0) +
            COALESCE((SELECT COUNT(*) FROM opportunity_topics), 0) +
            COALESCE((SELECT COUNT(*) FROM group_topics), 0) +
            COALESCE((SELECT COUNT(*) FROM company_topics), 0) +
            COALESCE((SELECT COUNT(*) FROM member_topics), 0)
          )
        ), 2
      )
    ELSE 0
  END AS popularity_percentage
FROM topics t
WHERE t.is_active = true;

-- Grant access to the view
GRANT SELECT ON topic_analytics TO authenticated;
GRANT SELECT ON topic_analytics TO anon;