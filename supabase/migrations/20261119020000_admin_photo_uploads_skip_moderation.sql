-- Photos a site admin uploads skip moderation.
--
-- New gallery photos default to 'pending', so an admin's own uploads waited
-- in the moderation queue. When a site admin inserts a photo that is still
-- 'pending', it is now approved and recorded as reviewed by that admin. An
-- admin who sends another status explicitly (for example 'rejected') keeps
-- it. Members' uploads are unchanged, and server-side writes with no
-- auth.uid() are left alone.
-- Rest of the function as in 20261118020000.
-- Checks are in supabase/tests/admin_photo_uploads_skip_moderation.sql.

BEGIN;

CREATE OR REPLACE FUNCTION public.guard_gallery_photo_moderation()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Server-side writes (service role, migrations) have no auth.uid().
  IF auth.uid() IS NULL THEN
    RETURN NEW;
  END IF;

  IF public.is_site_admin() THEN
    IF TG_OP = 'INSERT' AND NEW.moderation_status = 'pending' THEN
      NEW.moderation_status := 'approved';
      NEW.reviewed_by := coalesce(NEW.reviewed_by, public.get_current_member_id());
      NEW.reviewed_at := coalesce(NEW.reviewed_at, now());
    END IF;
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    IF NEW.is_featured OR NEW.featured_at IS NOT NULL OR NEW.featured_by IS NOT NULL
       OR NEW.reviewed_by IS NOT NULL OR NEW.reviewed_at IS NOT NULL
       OR NEW.moderation_notes IS NOT NULL THEN
      RAISE EXCEPTION 'Only admins can feature or review photos' USING ERRCODE = '42501';
    END IF;
  ELSIF NEW.moderation_status IS DISTINCT FROM OLD.moderation_status
     OR NEW.is_featured IS DISTINCT FROM OLD.is_featured
     OR NEW.featured_at IS DISTINCT FROM OLD.featured_at
     OR NEW.featured_by IS DISTINCT FROM OLD.featured_by
     OR NEW.reviewed_by IS DISTINCT FROM OLD.reviewed_by
     OR NEW.reviewed_at IS DISTINCT FROM OLD.reviewed_at
     OR NEW.moderation_notes IS DISTINCT FROM OLD.moderation_notes THEN
    RAISE EXCEPTION 'Only admins can change moderation or featured status' USING ERRCODE = '42501';
  END IF;

  RETURN NEW;
END;
$$;

COMMIT;
