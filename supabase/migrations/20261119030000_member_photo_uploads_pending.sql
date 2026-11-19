-- Photos members upload always start as pending.
--
-- Until now an upload kept whatever moderation_status the client sent
-- (20261118010000), so a member calling the API directly could publish their
-- own photo without review. The moderation guard now sets 'pending' on every
-- photo a non-admin inserts. Site admins' uploads are still approved
-- (20261119020000), and server-side writes with no auth.uid() are left alone.
-- Rest of the function as in 20261119020000.
-- Checks are in supabase/tests/member_photo_uploads_pending.sql.

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
    NEW.moderation_status := 'pending';
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
