-- =====================================================
-- FIX GALLERY_TOPICS TABLE REFERENCE
-- =====================================================
-- This migration fixes the incorrect reference to 'galleries' table
-- and updates it to correctly reference 'user_galleries' table

BEGIN;

-- Drop the incorrectly defined gallery_topics table if it exists
DROP TABLE IF EXISTS gallery_topics CASCADE;

-- Recreate gallery_topics with correct reference to user_galleries
CREATE TABLE IF NOT EXISTS gallery_topics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    gallery_id UUID NOT NULL REFERENCES user_galleries(id) ON DELETE CASCADE,
    topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create unique constraint to prevent duplicate topic assignments
ALTER TABLE gallery_topics ADD CONSTRAINT gallery_topics_unique UNIQUE (gallery_id, topic_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_gallery_topics_gallery ON gallery_topics(gallery_id);
CREATE INDEX IF NOT EXISTS idx_gallery_topics_topic ON gallery_topics(topic_id);
CREATE INDEX IF NOT EXISTS idx_gallery_topics_created ON gallery_topics(created_at DESC);

-- Enable Row Level Security
ALTER TABLE gallery_topics ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view gallery topics" ON gallery_topics;
DROP POLICY IF EXISTS "Admins can manage gallery topics" ON gallery_topics;
DROP POLICY IF EXISTS "Gallery owners can manage topics" ON gallery_topics;

-- Create RLS policies

-- Anyone can view gallery topics for public galleries
CREATE POLICY "View public gallery topics" ON gallery_topics
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_galleries
            WHERE user_galleries.id = gallery_topics.gallery_id
            AND user_galleries.privacy_level = 'public'
            AND user_galleries.visibility = 'visible'
        )
    );

-- Authenticated users can view member-only gallery topics
CREATE POLICY "View member gallery topics" ON gallery_topics
    FOR SELECT USING (
        auth.uid() IS NOT NULL AND
        EXISTS (
            SELECT 1 FROM user_galleries
            WHERE user_galleries.id = gallery_topics.gallery_id
            AND user_galleries.privacy_level = 'members_only'
            AND user_galleries.visibility = 'visible'
        )
    );

-- Gallery owners can view their own gallery topics
CREATE POLICY "Gallery owners view topics" ON gallery_topics
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_galleries
            WHERE user_galleries.id = gallery_topics.gallery_id
            AND (
                (user_galleries.owner_type = 'user' AND user_galleries.owner_id = auth.uid())
                OR
                (user_galleries.user_id = auth.uid())
            )
        )
    );

-- Gallery owners can manage their own gallery topics
CREATE POLICY "Gallery owners manage topics" ON gallery_topics
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_galleries
            WHERE user_galleries.id = gallery_topics.gallery_id
            AND (
                (user_galleries.owner_type = 'user' AND user_galleries.owner_id = auth.uid())
                OR
                (user_galleries.user_id = auth.uid())
            )
        )
    );

-- Admins can manage all gallery topics
CREATE POLICY "Admins manage gallery topics" ON gallery_topics
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_id = auth.uid()
            AND role IN ('admin', 'superadmin')
        )
    );

-- Create function to get galleries by topic
CREATE OR REPLACE FUNCTION get_galleries_by_topic(topic_id_param UUID)
RETURNS TABLE (
    gallery_id UUID,
    title VARCHAR(255),
    description TEXT,
    privacy_level VARCHAR(20),
    photo_count INTEGER,
    created_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ug.id,
        ug.title,
        ug.description,
        ug.privacy_level,
        ug.photo_count,
        ug.created_at
    FROM user_galleries ug
    INNER JOIN gallery_topics gt ON ug.id = gt.gallery_id
    WHERE gt.topic_id = topic_id_param
    AND ug.visibility = 'visible'
    ORDER BY ug.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get topics for a gallery
CREATE OR REPLACE FUNCTION get_topics_for_gallery(gallery_id_param UUID)
RETURNS TABLE (
    topic_id UUID,
    name VARCHAR(100),
    slug VARCHAR(100),
    color VARCHAR(20)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.id,
        t.name,
        t.slug,
        t.color
    FROM topics t
    INNER JOIN gallery_topics gt ON t.id = gt.topic_id
    WHERE gt.gallery_id = gallery_id_param
    AND t.is_active = true
    ORDER BY t.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_galleries_by_topic TO authenticated;
GRANT EXECUTE ON FUNCTION get_topics_for_gallery TO authenticated;

-- Add comment for documentation
COMMENT ON TABLE gallery_topics IS 'Junction table linking user_galleries to topics for categorization';
COMMENT ON COLUMN gallery_topics.gallery_id IS 'References user_galleries table (not galleries - which does not exist)';

COMMIT;