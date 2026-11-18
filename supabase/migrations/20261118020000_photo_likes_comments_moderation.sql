-- Follow-up to 20261118010000 for the rest of the photo feature.
--
-- photo_likes / photo_comments: user_id references members(id), but the
--   policies compared it with auth.uid(), so nobody could like, comment,
--   edit or delete. They now compare with the caller's member id. Likes and
--   comments are only visible, and can only be added, on photos the caller
--   can see; before, every like and every approved comment was readable by
--   anyone, including on private photos.
-- photo_comments moderation: there was no admin policy. Site admins can now
--   manage all comments, and a trigger stops commenters changing a comment's
--   moderation fields (so a rejected comment can't be re-approved by its
--   author).
-- Count triggers: update_photo_like_count and update_photo_comment_count ran
--   as the caller, so liking or commenting on someone else's photo couldn't
--   update its counts under RLS. They now run as their owner.
-- gallery_photos: the moderation queue records who reviewed a photo, when,
--   and why, but those columns didn't exist. Add them, and extend the
--   moderation guard from 20261118010000 to cover them.
-- Checks are in supabase/tests/photo_likes_comments_moderation.sql.

BEGIN;

-- Likes -------------------------------------------------------------------------

DROP POLICY IF EXISTS "Anyone can view photo likes" ON public.photo_likes;
DROP POLICY IF EXISTS "Likes are visible on visible photos" ON public.photo_likes;
CREATE POLICY "Likes are visible on visible photos" ON public.photo_likes
  FOR SELECT TO anon, authenticated
  USING (EXISTS (SELECT 1 FROM public.gallery_photos p WHERE p.id = photo_likes.photo_id));

DROP POLICY IF EXISTS "Authenticated users can like photos" ON public.photo_likes;
CREATE POLICY "Authenticated users can like photos" ON public.photo_likes
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = (select public.get_current_member_id())
    AND EXISTS (SELECT 1 FROM public.gallery_photos p WHERE p.id = photo_likes.photo_id)
  );

DROP POLICY IF EXISTS "Users can remove their own likes" ON public.photo_likes;
CREATE POLICY "Users can remove their own likes" ON public.photo_likes
  FOR DELETE TO authenticated
  USING (user_id = (select public.get_current_member_id()));

-- Comments ----------------------------------------------------------------------

DROP POLICY IF EXISTS "Anyone can view approved comments" ON public.photo_comments;
CREATE POLICY "Anyone can view approved comments" ON public.photo_comments
  FOR SELECT TO anon, authenticated
  USING (
    moderation_status = 'approved'
    AND EXISTS (SELECT 1 FROM public.gallery_photos p WHERE p.id = photo_comments.photo_id)
  );

DROP POLICY IF EXISTS "Users can view their own comments" ON public.photo_comments;
CREATE POLICY "Users can view their own comments" ON public.photo_comments
  FOR SELECT TO authenticated
  USING (user_id = (select public.get_current_member_id()));

DROP POLICY IF EXISTS "Authenticated users can comment" ON public.photo_comments;
CREATE POLICY "Authenticated users can comment" ON public.photo_comments
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = (select public.get_current_member_id())
    AND EXISTS (SELECT 1 FROM public.gallery_photos p WHERE p.id = photo_comments.photo_id)
  );

DROP POLICY IF EXISTS "Users can update their own comments" ON public.photo_comments;
CREATE POLICY "Users can update their own comments" ON public.photo_comments
  FOR UPDATE TO authenticated
  USING (user_id = (select public.get_current_member_id()))
  WITH CHECK (user_id = (select public.get_current_member_id()));

DROP POLICY IF EXISTS "Users can delete their own comments" ON public.photo_comments;
CREATE POLICY "Users can delete their own comments" ON public.photo_comments
  FOR DELETE TO authenticated
  USING (user_id = (select public.get_current_member_id()));

DROP POLICY IF EXISTS "Site admins can manage all comments" ON public.photo_comments;
CREATE POLICY "Site admins can manage all comments" ON public.photo_comments
  FOR ALL TO authenticated
  USING ((select public.is_site_admin()))
  WITH CHECK ((select public.is_site_admin()));

CREATE OR REPLACE FUNCTION public.guard_photo_comment_moderation()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Server-side writes (service role, migrations) have no auth.uid().
  IF auth.uid() IS NULL OR public.is_site_admin() THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    IF NEW.moderated_by IS NOT NULL OR NEW.moderated_at IS NOT NULL THEN
      RAISE EXCEPTION 'Only admins can moderate comments' USING ERRCODE = '42501';
    END IF;
  ELSIF NEW.moderation_status IS DISTINCT FROM OLD.moderation_status
     OR NEW.moderated_by IS DISTINCT FROM OLD.moderated_by
     OR NEW.moderated_at IS DISTINCT FROM OLD.moderated_at
     OR NEW.photo_id IS DISTINCT FROM OLD.photo_id THEN
    RAISE EXCEPTION 'Only admins can change a comment''s moderation or photo' USING ERRCODE = '42501';
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.guard_photo_comment_moderation() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS guard_photo_comment_moderation ON public.photo_comments;
CREATE TRIGGER guard_photo_comment_moderation
  BEFORE INSERT OR UPDATE ON public.photo_comments
  FOR EACH ROW EXECUTE FUNCTION public.guard_photo_comment_moderation();

-- Count triggers ------------------------------------------------------------------

ALTER FUNCTION public.update_photo_like_count() SECURITY DEFINER;
ALTER FUNCTION public.update_photo_like_count() SET search_path = public, pg_temp;
REVOKE ALL ON FUNCTION public.update_photo_like_count() FROM PUBLIC, anon, authenticated;

ALTER FUNCTION public.update_photo_comment_count() SECURITY DEFINER;
ALTER FUNCTION public.update_photo_comment_count() SET search_path = public, pg_temp;
REVOKE ALL ON FUNCTION public.update_photo_comment_count() FROM PUBLIC, anon, authenticated;

-- Photo moderation record ---------------------------------------------------------

ALTER TABLE public.gallery_photos
  ADD COLUMN IF NOT EXISTS reviewed_by uuid REFERENCES public.members(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS reviewed_at timestamptz,
  ADD COLUMN IF NOT EXISTS moderation_notes text;

CREATE OR REPLACE FUNCTION public.guard_gallery_photo_moderation()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Server-side writes (service role, migrations) have no auth.uid().
  IF auth.uid() IS NULL OR public.is_site_admin() THEN
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
