-- Security follow-up to 20261108000000: tighten write access that any signed-in
-- member (and in two cases anonymous visitors) had to other people's data.
-- Written against the production policy set as of 2026-11-08 and idempotent.
-- Depends on public.is_site_admin() from 20261108000000.

-- ---------------------------------------------------------------------------
-- 1. resources: "Authenticated users can manage resources" was FOR ALL with
--    USING (auth.uid() IS NOT NULL), so any member could edit or delete any
--    resource. Contributors keep their own update/delete policies; site admins
--    get an explicit policy (previously only superadmins had one).
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Authenticated users can manage resources" ON public.resources;
DROP POLICY IF EXISTS "Site admins can manage resources" ON public.resources;
CREATE POLICY "Site admins can manage resources"
  ON public.resources
  FOR ALL
  TO authenticated
  USING (public.is_site_admin())
  WITH CHECK (public.is_site_admin());

-- ---------------------------------------------------------------------------
-- 2. resource_photos: any member could attach or detach photos on any resource.
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "authenticated_can_manage_resource_photos" ON public.resource_photos;
DROP POLICY IF EXISTS "Contributors and admins manage resource photos" ON public.resource_photos;
CREATE POLICY "Contributors and admins manage resource photos"
  ON public.resource_photos
  FOR ALL
  TO authenticated
  USING (
    public.is_site_admin()
    OR EXISTS (
      SELECT 1
      FROM public.resources r
      JOIN public.members m ON m.id = r.contributor_id
      WHERE r.id = resource_photos.resource_id AND m.user_id = auth.uid()
    )
  )
  WITH CHECK (
    public.is_site_admin()
    OR EXISTS (
      SELECT 1
      FROM public.resources r
      JOIN public.members m ON m.id = r.contributor_id
      WHERE r.id = resource_photos.resource_id AND m.user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- 3. members: a permissive INSERT policy only checked auth.uid() IS NOT NULL,
--    so members could create profiles under someone else's user_id. The
--    stricter "Users can insert their own member profile" policy remains.
--    Members also shouldn't be able to feature themselves in the directory.
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Authenticated users can create member profiles" ON public.members;

CREATE OR REPLACE FUNCTION public.protect_member_featured()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Server-side contexts (no end-user JWT) and site admins may set it freely.
  IF auth.uid() IS NULL OR public.is_site_admin() THEN
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

DROP TRIGGER IF EXISTS protect_member_featured ON public.members;
CREATE TRIGGER protect_member_featured
  BEFORE INSERT OR UPDATE OF featured ON public.members
  FOR EACH ROW EXECUTE FUNCTION public.protect_member_featured();

-- ---------------------------------------------------------------------------
-- 4. conversation_participants: "participants_update_own" lets members update
--    their own row with no column restrictions, so they could change their
--    role or move the row into another conversation. Members may still update
--    their own read/leave state; role and membership changes need a
--    conversation admin or a site admin.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.protect_conversation_participant()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF auth.uid() IS NULL OR public.is_site_admin() THEN
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

DROP TRIGGER IF EXISTS protect_conversation_participant ON public.conversation_participants;
CREATE TRIGGER protect_conversation_participant
  BEFORE UPDATE ON public.conversation_participants
  FOR EACH ROW EXECUTE FUNCTION public.protect_conversation_participant();

-- ---------------------------------------------------------------------------
-- 5. Log and cache tables that accepted forged rows.
-- ---------------------------------------------------------------------------

-- group_activities: members may only log activity as themselves.
DROP POLICY IF EXISTS "System can create activities" ON public.group_activities;
DROP POLICY IF EXISTS "Members can log their own activity" ON public.group_activities;
CREATE POLICY "Members can log their own activity"
  ON public.group_activities
  FOR INSERT
  TO authenticated
  WITH CHECK (actor_id IN (SELECT id FROM public.members WHERE user_id = auth.uid()));

-- settings_history: was writable by anyone, including signed-out visitors.
-- History rows are written when admins change settings.
DROP POLICY IF EXISTS "System can write settings history" ON public.settings_history;
DROP POLICY IF EXISTS "Admins can write settings history" ON public.settings_history;
CREATE POLICY "Admins can write settings history"
  ON public.settings_history
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_site_admin());

-- newsletter_content_cache: any member could overwrite cached newsletter
-- content. Only the admin newsletter tools write it; reads stay public.
DROP POLICY IF EXISTS "System can manage cache" ON public.newsletter_content_cache;
DROP POLICY IF EXISTS "Admins can manage newsletter cache" ON public.newsletter_content_cache;
CREATE POLICY "Admins can manage newsletter cache"
  ON public.newsletter_content_cache
  FOR ALL
  TO authenticated
  USING (public.is_site_admin())
  WITH CHECK (public.is_site_admin());

-- ---------------------------------------------------------------------------
-- 6. Storage.
-- ---------------------------------------------------------------------------

-- group-images: any member could overwrite or delete anyone's group images.
DROP POLICY IF EXISTS "Users can update their own group images" ON storage.objects;
CREATE POLICY "Users can update their own group images"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'group-images' AND (owner_id = auth.uid()::text OR public.is_site_admin()))
  WITH CHECK (bucket_id = 'group-images' AND (owner_id = auth.uid()::text OR public.is_site_admin()));

DROP POLICY IF EXISTS "Users can delete their own group images" ON storage.objects;
CREATE POLICY "Users can delete their own group images"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'group-images' AND (owner_id = auth.uid()::text OR public.is_site_admin()));

-- message-attachments is a private bucket, but its read policy allowed anyone,
-- including signed-out visitors, to read any file. Limit reads to the
-- uploader's own folder, matching the existing upload and delete policies.
DROP POLICY IF EXISTS "Users can view message attachments" ON storage.objects;
CREATE POLICY "Users can view message attachments"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'message-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ---------------------------------------------------------------------------
-- 7. Pin search_path on every SECURITY DEFINER function in public that doesn't
--    set one, so a caller can't shadow tables or functions they reference.
--    public, extensions matches what PostgREST callers already resolve.
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  fn record;
BEGIN
  FOR fn IN
    SELECT p.oid::regprocedure AS sig
    FROM pg_proc p
    WHERE p.pronamespace = 'public'::regnamespace
      AND p.prosecdef
      AND NOT EXISTS (
        SELECT 1 FROM unnest(coalesce(p.proconfig, '{}')) c WHERE c LIKE 'search_path=%'
      )
      AND NOT EXISTS (
        SELECT 1 FROM pg_depend d WHERE d.objid = p.oid AND d.deptype = 'e'
      )
  LOOP
    EXECUTE format('ALTER FUNCTION %s SET search_path = public, extensions, pg_temp', fn.sig);
  END LOOP;
END $$;
