-- Create marketplace_listings table
CREATE TABLE public.marketplace_listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL CHECK (type IN ('product', 'service', 'equipment', 'event')),
    price NUMERIC(10, 2),
    condition TEXT, -- e.g., 'new', 'used', 'refurbished'
    images TEXT[],
    seller_id UUID REFERENCES public.members(id) ON DELETE SET NULL,
    location TEXT,
    tags TEXT[],
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add comments to columns
COMMENT ON COLUMN public.marketplace_listings.type IS 'Type of listing: product, service, equipment, or event.';
COMMENT ON COLUMN public.marketplace_listings.condition IS 'Condition of the item, if applicable (e.g., new, used).';
COMMENT ON COLUMN public.marketplace_listings.seller_id IS 'The member who is selling/offering the item/service.';

-- Enable Row Level Security
ALTER TABLE public.marketplace_listings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Marketplace listings are viewable by everyone."
ON public.marketplace_listings FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can insert marketplace listings."
ON public.marketplace_listings FOR INSERT
TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM public.members WHERE members.id = seller_id AND members.user_id = auth.uid()));

CREATE POLICY "Users can update their own marketplace listings."
ON public.marketplace_listings FOR UPDATE
USING (EXISTS (SELECT 1 FROM public.members WHERE members.id = seller_id AND members.user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM public.members WHERE members.id = seller_id AND members.user_id = auth.uid()));

CREATE POLICY "Users can delete their own marketplace listings."
ON public.marketplace_listings FOR DELETE
USING (EXISTS (SELECT 1 FROM public.members WHERE members.id = seller_id AND members.user_id = auth.uid()));

-- Trigger for updated_at timestamp
CREATE TRIGGER handle_marketplace_listings_updated_at
BEFORE UPDATE ON public.marketplace_listings
FOR EACH ROW
EXECUTE FUNCTION moddatetime (updated_at);

-- Add indexes
CREATE INDEX idx_marketplace_listings_seller_id ON public.marketplace_listings(seller_id);
CREATE INDEX idx_marketplace_listings_type ON public.marketplace_listings(type);
CREATE INDEX idx_marketplace_listings_status ON public.marketplace_listings(status);
