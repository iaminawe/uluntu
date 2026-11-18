-- gallery_photos policies, following 20261113000000 for user_galleries.
--
-- Owners: user_id references members(id), but the owner policies compared it
--   with auth.uid(), so they never matched. Owners couldn't see their own
--   unapproved photos, or edit, delete or upload any. They now compare with
--   the caller's member id, and an upload must go into a gallery the caller
--   owns.
-- Admins: there was no admin policy, so the moderation screens could only
--   see approved photos in public galleries and couldn't change any. Site
--   admins can now manage all photos.
-- Members: approved photos in members_only galleries were hidden from other
--   members, so the members-only galleries opened up in 20261113000000
--   showed up empty. Signed-in members can now see them.
-- Moderation: now that owners can write, a trigger stops non-admins from
--   changing moderation_status or the featured fields on an existing photo,
--   or featuring a photo when uploading. Uploads keep whatever
--   moderation_status the app sends (it auto-approves today). visibility
--   stays owner-controlled (owners hide and unhide their own photos); admins
--   take a photo down by rejecting or flagging it, which owners can't undo.
-- Checks are in supabase/tests/gallery_photo_policies.sql.

BEGIN;

DROP POLICY IF EXISTS "Users can view their own photos" ON public.gallery_photos;
CREATE POLICY "Users can view their own photos" ON public.gallery_photos
  FOR SELECT TO authenticated
  USING (user_id = (select public.get_current_member_id()));

DROP POLICY IF EXISTS "Users can upload photos to their galleries" ON public.gallery_photos;
CREATE POLICY "Users can upload photos to their galleries" ON public.gallery_photos
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = (select public.get_current_member_id())
    AND EXISTS (
      SELECT 1 FROM public.user_galleries g
      WHERE g.id = gallery_photos.gallery_id
        AND g.user_id = (select public.get_current_member_id())
    )
  );

-- The gallery check stops an owner moving a photo into someone else's gallery.
DROP POLICY IF EXISTS "Users can update their own photos" ON public.gallery_photos;
CREATE POLICY "Users can update their own photos" ON public.gallery_photos
  FOR UPDATE TO authenticated
  USING (user_id = (select public.get_current_member_id()))
  WITH CHECK (
    user_id = (select public.get_current_member_id())
    AND EXISTS (
      SELECT 1 FROM public.user_galleries g
      WHERE g.id = gallery_photos.gallery_id
        AND g.user_id = (select public.get_current_member_id())
    )
  );

DROP POLICY IF EXISTS "Users can delete their own photos" ON public.gallery_photos;
CREATE POLICY "Users can delete their own photos" ON public.gallery_photos
  FOR DELETE TO authenticated
  USING (user_id = (select public.get_current_member_id()));

DROP POLICY IF EXISTS "Site admins can manage all photos" ON public.gallery_photos;
CREATE POLICY "Site admins can manage all photos" ON public.gallery_photos
  FOR ALL TO authenticated
  USING ((select public.is_site_admin()))
  WITH CHECK ((select public.is_site_admin()));

DROP POLICY IF EXISTS "Members can view members-only gallery photos" ON public.gallery_photos;
CREATE POLICY "Members can view members-only gallery photos" ON public.gallery_photos
  FOR SELECT TO authenticated
  USING (
    visibility = 'visible'
    AND moderation_status = 'approved'
    AND EXISTS (
      SELECT 1 FROM public.user_galleries g
      WHERE g.id = gallery_photos.gallery_id
        AND g.privacy_level = 'members_only'
        AND g.visibility = 'visible'
    )
  );

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
    IF NEW.is_featured OR NEW.featured_at IS NOT NULL OR NEW.featured_by IS NOT NULL THEN
      RAISE EXCEPTION 'Only admins can feature photos' USING ERRCODE = '42501';
    END IF;
  ELSIF NEW.moderation_status IS DISTINCT FROM OLD.moderation_status
     OR NEW.is_featured IS DISTINCT FROM OLD.is_featured
     OR NEW.featured_at IS DISTINCT FROM OLD.featured_at
     OR NEW.featured_by IS DISTINCT FROM OLD.featured_by THEN
    RAISE EXCEPTION 'Only admins can change moderation or featured status' USING ERRCODE = '42501';
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.guard_gallery_photo_moderation() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS guard_gallery_photo_moderation ON public.gallery_photos;
CREATE TRIGGER guard_gallery_photo_moderation
  BEFORE INSERT OR UPDATE ON public.gallery_photos
  FOR EACH ROW EXECUTE FUNCTION public.guard_gallery_photo_moderation();

COMMIT;
