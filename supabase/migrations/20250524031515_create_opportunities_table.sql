CREATE TABLE opportunities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    type TEXT, -- Consider an ENUM: 'full-time', 'part-time', 'contract', 'volunteer', 'internship'
    location TEXT,
    remote BOOLEAN DEFAULT false,
    compensation TEXT, 
    deadline TIMESTAMPTZ,
    contact_email TEXT,
    website TEXT,
    image TEXT, -- URL to an image
    status TEXT DEFAULT 'draft', -- Consider an ENUM: 'draft', 'published', 'archived', 'filled'
    featured BOOLEAN DEFAULT false,
    organization TEXT, -- This currently stores the company name.
    posted_by UUID, -- Should ideally be a foreign key to members/users
    requirements TEXT[],
    responsibilities TEXT[],
    benefits TEXT[],
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
    -- If you want to link 'organization' to the 'companies' table by its UUID id:
    -- organization_id UUID,
    -- CONSTRAINT fk_organization_id FOREIGN KEY (organization_id) REFERENCES companies(id) ON DELETE SET NULL,
    -- If you want to link 'posted_by' to the 'members' table by its UUID id:
    -- CONSTRAINT fk_posted_by FOREIGN KEY (posted_by) REFERENCES members(id) ON DELETE SET NULL
);

-- Trigger to update 'updated_at' timestamp
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_timestamp_opportunities
BEFORE UPDATE ON opportunities
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

-- Indexes
CREATE INDEX idx_opportunities_status ON opportunities(status);
CREATE INDEX idx_opportunities_type ON opportunities(type);
CREATE INDEX idx_opportunities_location ON opportunities(location);
CREATE INDEX idx_opportunities_featured ON opportunities(featured);