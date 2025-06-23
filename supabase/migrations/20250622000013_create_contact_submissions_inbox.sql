-- Create contact submissions inbox system
-- This migration creates tables and policies for managing contact form submissions

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create contact_submissions table
CREATE TABLE IF NOT EXISTS contact_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'read', 'in_progress', 'resolved', 'archived')),
    priority VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    assigned_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    tags TEXT[] DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    referrer TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

-- Create contact_submission_notes table for internal notes
CREATE TABLE IF NOT EXISTS contact_submission_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    submission_id UUID NOT NULL REFERENCES contact_submissions(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    author_name VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    is_internal BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_contact_submissions_status ON contact_submissions(status);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_priority ON contact_submissions(priority);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_assigned_to ON contact_submissions(assigned_to);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_created_at ON contact_submissions(created_at);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_email ON contact_submissions(email);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_tags ON contact_submissions USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_contact_submission_notes_submission_id ON contact_submission_notes(submission_id);
CREATE INDEX IF NOT EXISTS idx_contact_submission_notes_author_id ON contact_submission_notes(author_id);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_contact_submissions_updated_at
    BEFORE UPDATE ON contact_submissions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contact_submission_notes_updated_at
    BEFORE UPDATE ON contact_submission_notes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies

-- Enable RLS
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_submission_notes ENABLE ROW LEVEL SECURITY;

-- Contact submissions policies
-- Allow anonymous users to insert (for public contact form)
CREATE POLICY "Anyone can create contact submissions"
    ON contact_submissions
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- Only admins can read contact submissions
CREATE POLICY "Admins can read contact submissions"
    ON contact_submissions
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_roles ur
            WHERE ur.user_id = auth.uid()
            AND ur.role IN ('admin', 'superadmin')
        )
    );

-- Only admins can update contact submissions
CREATE POLICY "Admins can update contact submissions"
    ON contact_submissions
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_roles ur
            WHERE ur.user_id = auth.uid()
            AND ur.role IN ('admin', 'superadmin')
        )
    );

-- Only superadmins can delete contact submissions
CREATE POLICY "Superadmins can delete contact submissions"
    ON contact_submissions
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_roles ur
            WHERE ur.user_id = auth.uid()
            AND ur.role = 'superadmin'
        )
    );

-- Contact submission notes policies
-- Only admins can read notes
CREATE POLICY "Admins can read contact submission notes"
    ON contact_submission_notes
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_roles ur
            WHERE ur.user_id = auth.uid()
            AND ur.role IN ('admin', 'superadmin')
        )
    );

-- Only admins can create notes
CREATE POLICY "Admins can create contact submission notes"
    ON contact_submission_notes
    FOR INSERT
    TO authenticated
    WITH CHECK (
        author_id = auth.uid()
        AND EXISTS (
            SELECT 1 FROM user_roles ur
            WHERE ur.user_id = auth.uid()
            AND ur.role IN ('admin', 'superadmin')
        )
    );

-- Only note authors and superadmins can update notes
CREATE POLICY "Note authors and superadmins can update notes"
    ON contact_submission_notes
    FOR UPDATE
    TO authenticated
    USING (
        author_id = auth.uid()
        OR
        EXISTS (
            SELECT 1 FROM user_roles ur
            WHERE ur.user_id = auth.uid()
            AND ur.role = 'superadmin'
        )
    );

-- Only superadmins can delete notes
CREATE POLICY "Superadmins can delete contact submission notes"
    ON contact_submission_notes
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_roles ur
            WHERE ur.user_id = auth.uid()
            AND ur.role = 'superadmin'
        )
    );

-- Create a function to get contact submission statistics
CREATE OR REPLACE FUNCTION get_contact_submission_stats()
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    -- Check if user has admin privileges
    IF NOT EXISTS (
        SELECT 1 FROM user_roles ur
        WHERE ur.user_id = auth.uid()
        AND ur.role IN ('admin', 'superadmin')
    ) THEN
        RAISE EXCEPTION 'Access denied';
    END IF;

    SELECT json_build_object(
        'total', (SELECT COUNT(*) FROM contact_submissions),
        'new', (SELECT COUNT(*) FROM contact_submissions WHERE status = 'new'),
        'in_progress', (SELECT COUNT(*) FROM contact_submissions WHERE status = 'in_progress'),
        'resolved', (SELECT COUNT(*) FROM contact_submissions WHERE status = 'resolved'),
        'high_priority', (SELECT COUNT(*) FROM contact_submissions WHERE priority = 'high'),
        'urgent', (SELECT COUNT(*) FROM contact_submissions WHERE priority = 'urgent'),
        'today', (SELECT COUNT(*) FROM contact_submissions WHERE DATE(created_at) = CURRENT_DATE),
        'this_week', (SELECT COUNT(*) FROM contact_submissions WHERE created_at >= DATE_TRUNC('week', NOW())),
        'this_month', (SELECT COUNT(*) FROM contact_submissions WHERE created_at >= DATE_TRUNC('month', NOW()))
    ) INTO result;

    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the stats function
GRANT EXECUTE ON FUNCTION get_contact_submission_stats() TO authenticated;

-- Add helpful comments
COMMENT ON TABLE contact_submissions IS 'Stores contact form submissions from website visitors';
COMMENT ON TABLE contact_submission_notes IS 'Internal notes added by administrators for contact submissions';
COMMENT ON COLUMN contact_submissions.status IS 'Workflow status: new -> read -> in_progress -> resolved/archived';
COMMENT ON COLUMN contact_submissions.priority IS 'Priority level for handling: low, medium, high, urgent';
COMMENT ON COLUMN contact_submissions.tags IS 'Flexible tagging system for categorizing submissions';
COMMENT ON COLUMN contact_submissions.ip_address IS 'Client IP address for security and rate limiting';
COMMENT ON COLUMN contact_submissions.user_agent IS 'Client user agent for analytics and security';
COMMENT ON COLUMN contact_submissions.referrer IS 'Page referrer for tracking submission sources';