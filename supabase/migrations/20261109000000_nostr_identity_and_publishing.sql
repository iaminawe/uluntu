-- Nostr stages 1 and 2 (docs/research/nostr-federation.md):
--   1. members can link a Nostr key, served as <slug>@<domain> via NIP-05.
--   2. the site publishes public events, news and opportunities to Nostr
--      relays, signed with the instance key; nostr_publications tracks what
--      was sent so unchanged rows are skipped and removed rows get a NIP-09
--      deletion request.
-- Depends on public.is_site_admin() from 20261108000000.

-- ---------------------------------------------------------------------------
-- 1. members.nostr_pubkey (lowercase hex, as NIP-05 requires).
-- ---------------------------------------------------------------------------
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS nostr_pubkey text;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'members_nostr_pubkey_format'
  ) THEN
    ALTER TABLE public.members
      ADD CONSTRAINT members_nostr_pubkey_format CHECK (nostr_pubkey ~ '^[0-9a-f]{64}$');
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS members_nostr_pubkey_key
  ON public.members (nostr_pubkey)
  WHERE nostr_pubkey IS NOT NULL;

-- Members can update their own row through several policies with no column
-- restrictions. A key is only linked after /api/nostr/link verifies a
-- signature, which writes with the secret key (no end-user JWT), so block
-- direct client writes. Members unlink through the same endpoint.
CREATE OR REPLACE FUNCTION public.protect_member_nostr_pubkey()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF auth.uid() IS NULL OR public.is_site_admin() THEN
    RETURN NEW;
  END IF;
  IF TG_OP = 'INSERT' THEN
    NEW.nostr_pubkey := NULL;
  ELSE
    NEW.nostr_pubkey := OLD.nostr_pubkey;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_member_nostr_pubkey ON public.members;
CREATE TRIGGER protect_member_nostr_pubkey
  BEFORE INSERT OR UPDATE OF nostr_pubkey ON public.members
  FOR EACH ROW EXECUTE FUNCTION public.protect_member_nostr_pubkey();

-- ---------------------------------------------------------------------------
-- 2. nostr_publications: one row per published source row. Written only by
--    /api/nostr/publish with the secret key; admins can read it.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.nostr_publications (
  source_table text NOT NULL,
  source_id text NOT NULL,
  kind integer NOT NULL,
  d_tag text NOT NULL,
  event_id text NOT NULL,
  content_hash text NOT NULL,
  published_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  PRIMARY KEY (source_table, source_id)
);

ALTER TABLE public.nostr_publications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can read nostr publications" ON public.nostr_publications;
CREATE POLICY "Admins can read nostr publications"
  ON public.nostr_publications
  FOR SELECT
  TO authenticated
  USING (public.is_site_admin());

REVOKE ALL ON public.nostr_publications FROM anon;
