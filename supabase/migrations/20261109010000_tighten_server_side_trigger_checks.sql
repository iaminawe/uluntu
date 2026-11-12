-- The column-protection triggers from 20261108010000 and 20261109000000 let a
-- write through when auth.uid() IS NULL, meaning "server-side, no end-user
-- JWT". A signed-out request made with the publishable key also has no
-- auth.uid(), but its role is 'anon'. No anon write policy reaches these
-- tables today, so this is defence in depth: treat anon like any member.

CREATE OR REPLACE FUNCTION public.protect_member_featured()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Server-side contexts (secret key or SQL) and site admins may set it freely.
  IF (auth.uid() IS NULL AND coalesce(auth.role(), '') <> 'anon') OR public.is_site_admin() THEN
    RETURN NEW;
  END IF;
  IF TG_OP = 'INSERT' THEN
    NEW.featured := false;
  ELSE
    NEW.featured := OLD.featured;
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.protect_member_nostr_pubkey()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF (auth.uid() IS NULL AND coalesce(auth.role(), '') <> 'anon') OR public.is_site_admin() THEN
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

CREATE OR REPLACE FUNCTION public.protect_conversation_participant()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF (auth.uid() IS NULL AND coalesce(auth.role(), '') <> 'anon') OR public.is_site_admin() THEN
    RETURN NEW;
  END IF;

  IF NEW.conversation_id IS DISTINCT FROM OLD.conversation_id
     OR NEW.user_id IS DISTINCT FROM OLD.user_id THEN
    RAISE EXCEPTION 'Cannot move a conversation participant'
      USING ERRCODE = '42501';
  END IF;

  IF NEW.role IS DISTINCT FROM OLD.role AND NOT EXISTS (
    SELECT 1
    FROM public.conversation_participants cp
    JOIN public.members m ON m.id = cp.user_id
    WHERE cp.conversation_id = OLD.conversation_id
      AND m.user_id = auth.uid()
      AND cp.role = 'admin'
      AND cp.left_at IS NULL
  ) THEN
    RAISE EXCEPTION 'Only conversation admins can change roles'
      USING ERRCODE = '42501';
  END IF;

  RETURN NEW;
END;
$$;
