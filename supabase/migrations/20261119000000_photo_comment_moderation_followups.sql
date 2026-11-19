-- Follow-up to 20261118020000 for photo comments.
--
-- Moderation: comments stay post-moderated (they appear straight away and an
--   admin can reject them later), but the database now decides the status
--   instead of the client. A new comment is always 'approved' whatever the
--   app sends, and editing an approved comment sends it back to 'pending', so
--   an author can't swap in new text after it has been seen. Editing a
--   rejected or pending comment leaves its status alone. An author can still
--   delete a rejected comment and post it again; closing that needs
--   pre-moderation.
-- Replies: parent_comment_id wasn't checked. A reply must now be on the same
--   photo as the comment it answers, and the caller must be able to see that
--   comment. Only admins can move a comment to a different thread.
-- Counts: comment_count counted every comment, including pending and
--   rejected ones, so it didn't match what visitors see. It now counts
--   approved comments only and follows status changes. Both counts were also
--   out of step with the rows (sample data); they're recomputed here.
-- Checks are in supabase/tests/photo_comment_moderation_followups.sql.

BEGIN;

CREATE OR REPLACE FUNCTION public.guard_photo_comment_moderation()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
DECLARE
  v_parent_photo uuid;
BEGIN
  -- Runs as the caller, so a parent they can't see counts as missing.
  IF NEW.parent_comment_id IS NOT NULL
     AND (TG_OP = 'INSERT'
          OR NEW.parent_comment_id IS DISTINCT FROM OLD.parent_comment_id
          OR NEW.photo_id IS DISTINCT FROM OLD.photo_id) THEN
    SELECT c.photo_id INTO v_parent_photo
    FROM public.photo_comments c WHERE c.id = NEW.parent_comment_id;
    IF v_parent_photo IS DISTINCT FROM NEW.photo_id THEN
      RAISE EXCEPTION 'A reply must be on the same photo as the comment it answers'
        USING ERRCODE = '23514';
    END IF;
  END IF;

  -- Server-side writes (service role, migrations) have no auth.uid().
  IF auth.uid() IS NULL OR public.is_site_admin() THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    IF NEW.moderated_by IS NOT NULL OR NEW.moderated_at IS NOT NULL THEN
      RAISE EXCEPTION 'Only admins can moderate comments' USING ERRCODE = '42501';
    END IF;
    NEW.moderation_status := 'approved';
    RETURN NEW;
  END IF;

  IF NEW.moderation_status IS DISTINCT FROM OLD.moderation_status
     OR NEW.moderated_by IS DISTINCT FROM OLD.moderated_by
     OR NEW.moderated_at IS DISTINCT FROM OLD.moderated_at
     OR NEW.photo_id IS DISTINCT FROM OLD.photo_id
     OR NEW.parent_comment_id IS DISTINCT FROM OLD.parent_comment_id THEN
    RAISE EXCEPTION 'Only admins can change a comment''s moderation, photo or thread'
      USING ERRCODE = '42501';
  END IF;

  IF NEW.content IS DISTINCT FROM OLD.content AND OLD.moderation_status = 'approved' THEN
    NEW.moderation_status := 'pending';
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_photo_comment_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF TG_OP IN ('UPDATE', 'DELETE') AND OLD.moderation_status = 'approved' THEN
    UPDATE gallery_photos
    SET comment_count = comment_count - 1, updated_at = now()
    WHERE id = OLD.photo_id;
  END IF;

  IF TG_OP IN ('INSERT', 'UPDATE') AND NEW.moderation_status = 'approved' THEN
    UPDATE gallery_photos
    SET comment_count = comment_count + 1, updated_at = now()
    WHERE id = NEW.photo_id;
  END IF;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$;

-- Not UPDATE OF: that skips status changes made by the guard trigger, which
-- aren't in the statement's SET list.
DROP TRIGGER IF EXISTS photo_comment_count_update_trigger ON public.photo_comments;
CREATE TRIGGER photo_comment_count_update_trigger
  AFTER UPDATE ON public.photo_comments
  FOR EACH ROW
  WHEN (OLD.moderation_status IS DISTINCT FROM NEW.moderation_status
        OR OLD.photo_id IS DISTINCT FROM NEW.photo_id)
  EXECUTE FUNCTION public.update_photo_comment_count();

WITH actual AS (
  SELECT p.id,
         (SELECT count(*) FROM public.photo_comments c
          WHERE c.photo_id = p.id AND c.moderation_status = 'approved') AS comments,
         (SELECT count(*) FROM public.photo_likes l WHERE l.photo_id = p.id) AS likes
  FROM public.gallery_photos p
)
UPDATE public.gallery_photos p
SET comment_count = a.comments, like_count = a.likes
FROM actual a
WHERE a.id = p.id
  AND (p.comment_count IS DISTINCT FROM a.comments OR p.like_count IS DISTINCT FROM a.likes);

COMMIT;
