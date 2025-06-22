

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."create_member_profile"("name" "text" DEFAULT NULL::"text") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  name_to_set text;
BEGIN
  -- Get the name from parameter or user metadata
  name_to_set := COALESCE(
    name, 
    auth.jwt() ->> 'user_metadata' ->> 'name',
    'New Member'
  );
  
  -- Insert member profile with draft status for privacy
  INSERT INTO members (user_id, name, status)
  VALUES (auth.uid(), name_to_set, 'draft'::text)
  ON CONFLICT (user_id) DO NOTHING;
END;
$$;


ALTER FUNCTION "public"."create_member_profile"("name" "text") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."create_member_profile"("name" "text") IS 'Creates member profiles with draft status by default. Users can update their privacy settings during onboarding or in profile settings.';



CREATE OR REPLACE FUNCTION "public"."generate_tag_slug"("tag_name" "text") RETURNS "text"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    RETURN lower(regexp_replace(regexp_replace(trim(tag_name), '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g'));
END;
$$;


ALTER FUNCTION "public"."generate_tag_slug"("tag_name" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'authenticated');
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user_profile"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  BEGIN
    INSERT INTO public.members (user_id,
   name, status)
    VALUES (NEW.id, 'New Member',
  'draft')
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
  END;
  $$;


ALTER FUNCTION "public"."handle_new_user_profile"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."handle_new_user_profile"() IS 'Creates member profiles with draft status by default for privacy-first onboarding. Users must explicitly choose to make their profile public.';



CREATE OR REPLACE FUNCTION "public"."is_admin_of_group"("p_user_id" "uuid", "p_group_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.group_members gm
    JOIN public.members m ON m.id = gm.member_id
    WHERE gm.group_id = p_group_id AND m.user_id = p_user_id AND gm.role = 'admin'
  );
END;
$$;


ALTER FUNCTION "public"."is_admin_of_group"("p_user_id" "uuid", "p_group_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_member_of_group"("p_user_id" "uuid", "p_group_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.group_members gm
    JOIN public.members m ON m.id = gm.member_id
    WHERE gm.group_id = p_group_id AND m.user_id = p_user_id
  );
END;
$$;


ALTER FUNCTION "public"."is_member_of_group"("p_user_id" "uuid", "p_group_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_superadmin_direct"("check_user_id" "uuid") RETURNS boolean
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.user_roles 
    WHERE user_id = check_user_id 
    AND role::text = 'superadmin'
  );
$$;


ALTER FUNCTION "public"."is_superadmin_direct"("check_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."log_admin_action"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  INSERT INTO admin_audit_log (
    admin_id,
    action,
    entity_type,
    entity_id,
    changes
  ) VALUES (
    auth.uid(),
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    jsonb_build_object(
      'old', row_to_json(OLD),
      'new', row_to_json(NEW)
    )
  );
  RETURN COALESCE(NEW, OLD);
END;
$$;


ALTER FUNCTION "public"."log_admin_action"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_event_attendee_count"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE events SET current_attendees = current_attendees + 1 WHERE id = NEW.event_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE events SET current_attendees = current_attendees - 1 WHERE id = OLD.event_id;
  END IF;
  RETURN NULL;
END;
$$;


ALTER FUNCTION "public"."update_event_attendee_count"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_group_member_count"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE groups SET member_count = member_count + 1 WHERE id = NEW.group_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE groups SET member_count = member_count - 1 WHERE id = OLD.group_id;
  END IF;
  RETURN NULL;
END;
$$;


ALTER FUNCTION "public"."update_group_member_count"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_tag_usage_count"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE tags SET usage_count = usage_count + 1 WHERE id = NEW.tag_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE tags SET usage_count = usage_count - 1 WHERE id = OLD.tag_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$;


ALTER FUNCTION "public"."update_tag_usage_count"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."admin_audit_log" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "admin_id" "uuid" NOT NULL,
    "action" "text" NOT NULL,
    "entity_type" "text" NOT NULL,
    "entity_id" "uuid",
    "changes" "jsonb" DEFAULT '{}'::"jsonb",
    "ip_address" "inet",
    "user_agent" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."admin_audit_log" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."admin_feature_translations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "feature_id" "uuid",
    "language_code" character varying(10) NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."admin_feature_translations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."admin_features" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "feature_key" "text" NOT NULL,
    "enabled" boolean DEFAULT false,
    "config" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."admin_features" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."companies" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "name" "text" NOT NULL,
    "description" "text" NOT NULL,
    "logo" "text" NOT NULL,
    "cover_image" "text",
    "industry" "text"[] NOT NULL,
    "size" "text" NOT NULL,
    "founded" "text" NOT NULL,
    "location" "text" NOT NULL,
    "website" "text",
    "status" "text" DEFAULT 'published'::"text" NOT NULL,
    "featured" boolean DEFAULT false
);


ALTER TABLE "public"."companies" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."company_members" (
    "company_id" "uuid" NOT NULL,
    "member_id" "uuid" NOT NULL,
    "role" "text",
    "joined_date" "date"
);


ALTER TABLE "public"."company_members" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."company_tags" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "company_id" "uuid" NOT NULL,
    "tag_id" "uuid" NOT NULL
);


ALTER TABLE "public"."company_tags" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."custom_roles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "permissions" "jsonb" DEFAULT '[]'::"jsonb",
    "is_system" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."custom_roles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."event_attendees" (
    "event_id" "uuid" NOT NULL,
    "member_id" "uuid" NOT NULL,
    "registered_at" timestamp with time zone DEFAULT "now"(),
    "status" "text" DEFAULT 'registered'::"text" NOT NULL
);


ALTER TABLE "public"."event_attendees" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."event_presenters" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "session_id" "uuid" NOT NULL,
    "member_id" "uuid",
    "name" "text",
    "image" "text",
    "bio" "text",
    "title" "text",
    "company" "text",
    "website" "text"
);


ALTER TABLE "public"."event_presenters" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."event_resources" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "session_id" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "url" "text" NOT NULL,
    "type" "text" NOT NULL,
    CONSTRAINT "event_resources_type_check" CHECK (("type" = ANY (ARRAY['slides'::"text", 'document'::"text", 'code'::"text", 'website'::"text", 'other'::"text"])))
);


ALTER TABLE "public"."event_resources" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."event_sessions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "event_id" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "description" "text" NOT NULL,
    "start_time" timestamp with time zone NOT NULL,
    "end_time" timestamp with time zone NOT NULL,
    "video_url" "text"
);


ALTER TABLE "public"."event_sessions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."event_tags" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "event_id" "uuid" NOT NULL,
    "tag_id" "uuid" NOT NULL
);


ALTER TABLE "public"."event_tags" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."events" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "title" "text" NOT NULL,
    "description" "text" NOT NULL,
    "date" timestamp with time zone NOT NULL,
    "end_date" timestamp with time zone,
    "location" "text" NOT NULL,
    "address" "text",
    "latitude" numeric,
    "longitude" numeric,
    "image" "text" NOT NULL,
    "type" "text" NOT NULL,
    "url" "text",
    "status" "text" DEFAULT 'published'::"text" NOT NULL,
    "featured" boolean DEFAULT false,
    "organizer_id" "uuid" NOT NULL,
    "max_attendees" integer,
    "current_attendees" integer DEFAULT 0,
    "group_id" "uuid",
    CONSTRAINT "events_type_check" CHECK (("type" = ANY (ARRAY['in-person'::"text", 'online'::"text", 'hybrid'::"text"])))
);


ALTER TABLE "public"."events" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."group_members" (
    "group_id" "uuid" NOT NULL,
    "member_id" "uuid" NOT NULL,
    "role" "text" NOT NULL,
    "joined_date" "date" DEFAULT CURRENT_DATE NOT NULL,
    CONSTRAINT "group_members_role_check" CHECK (("role" = ANY (ARRAY['admin'::"text", 'member'::"text"])))
);

ALTER TABLE ONLY "public"."group_members" FORCE ROW LEVEL SECURITY;


ALTER TABLE "public"."group_members" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."group_tags" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "group_id" "uuid" NOT NULL,
    "tag_id" "uuid" NOT NULL
);


ALTER TABLE "public"."group_tags" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."groups" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "name" "text" NOT NULL,
    "description" "text" NOT NULL,
    "long_description" "text",
    "hero_image" "text" NOT NULL,
    "cover_image" "text",
    "visibility" "text" NOT NULL,
    "member_count" integer DEFAULT 0,
    "status" "text" DEFAULT 'published'::"text" NOT NULL,
    "featured" boolean DEFAULT false,
    CONSTRAINT "groups_visibility_check" CHECK (("visibility" = ANY (ARRAY['open'::"text", 'closed'::"text", 'secret'::"text"])))
);


ALTER TABLE "public"."groups" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."marketplace_listings" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "title" "text" NOT NULL,
    "description" "text" NOT NULL,
    "type" "text" NOT NULL,
    "price" numeric,
    "condition" "text",
    "images" "text"[],
    "seller_id" "uuid" NOT NULL,
    "location" "text" NOT NULL,
    "tags" "text"[],
    "status" "text" DEFAULT 'published'::"text" NOT NULL,
    "featured" boolean DEFAULT false,
    "contact_info" "jsonb"
);


ALTER TABLE "public"."marketplace_listings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."marketplace_tags" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "listing_id" "uuid" NOT NULL,
    "tag_id" "uuid" NOT NULL
);


ALTER TABLE "public"."marketplace_tags" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."member_interests" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "member_id" "uuid" NOT NULL,
    "interest" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."member_interests" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."member_skills" (
    "member_id" "uuid" NOT NULL,
    "skill" "text" NOT NULL
);


ALTER TABLE "public"."member_skills" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."member_tags" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "member_id" "uuid" NOT NULL,
    "tag_id" "uuid" NOT NULL,
    "skill_level" "text",
    "years_experience" integer,
    CONSTRAINT "member_tags_skill_level_check" CHECK (("skill_level" = ANY (ARRAY['beginner'::"text", 'intermediate'::"text", 'advanced'::"text", 'expert'::"text"])))
);


ALTER TABLE "public"."member_tags" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."members" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "name" "text" NOT NULL,
    "title" "text",
    "bio" "text",
    "location" "text",
    "image" "text",
    "website" "text",
    "employment_status" "text",
    "open_to_volunteering" boolean,
    "arrived_in_nelson" "date",
    "user_id" "uuid",
    "status" "text" DEFAULT 'published'::"text" NOT NULL,
    "featured" boolean DEFAULT false,
    "social" "jsonb",
    "company" "text"
);


ALTER TABLE "public"."members" OWNER TO "postgres";


COMMENT ON COLUMN "public"."members"."social" IS 'JSON structure for social media links: {linkedin, twitter, github, website}';



CREATE TABLE IF NOT EXISTS "public"."moderation_queue" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "item_id" "uuid" NOT NULL,
    "item_type" "text" NOT NULL,
    "item_data" "jsonb" NOT NULL,
    "status" "text" DEFAULT 'pending'::"text",
    "submitted_by" "uuid" NOT NULL,
    "submitted_at" timestamp with time zone DEFAULT "now"(),
    "reviewed_by" "uuid",
    "reviewed_at" timestamp with time zone,
    "review_notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "moderation_queue_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'approved'::"text", 'rejected'::"text", 'escalated'::"text"])))
);


ALTER TABLE "public"."moderation_queue" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."news" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "title" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "content" "text" NOT NULL,
    "excerpt" "text",
    "hero_image" "text",
    "hero_image_alt" "text",
    "publish_date" "date",
    "status" "text" DEFAULT 'draft'::"text" NOT NULL,
    "tags" "text"[],
    "author_id" "uuid",
    "featured" boolean DEFAULT false
);


ALTER TABLE "public"."news" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."news_associations" (
    "news_id" "uuid" NOT NULL,
    "association_type" "text" NOT NULL,
    "association_id" "uuid" NOT NULL
);


ALTER TABLE "public"."news_associations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."news_tags" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "news_id" "uuid" NOT NULL,
    "tag_id" "uuid" NOT NULL
);


ALTER TABLE "public"."news_tags" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."newsletter_analytics" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "campaign_id" "uuid",
    "subscription_id" "uuid",
    "event_type" character varying,
    "event_data" "jsonb" DEFAULT '{}'::"jsonb",
    "postmark_message_id" character varying,
    "occurred_at" timestamp with time zone DEFAULT "now"(),
    "ip_address" "inet",
    "user_agent" "text",
    CONSTRAINT "newsletter_analytics_event_type_check" CHECK ((("event_type")::"text" = ANY ((ARRAY['sent'::character varying, 'delivered'::character varying, 'bounced'::character varying, 'opened'::character varying, 'clicked'::character varying, 'unsubscribed'::character varying, 'complained'::character varying])::"text"[])))
);


ALTER TABLE "public"."newsletter_analytics" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."newsletter_campaigns" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" character varying NOT NULL,
    "subject" character varying NOT NULL,
    "template_id" "uuid",
    "template_data" "jsonb" DEFAULT '{}'::"jsonb",
    "content" "jsonb" DEFAULT '{}'::"jsonb",
    "custom_message" "text",
    "branding" "jsonb" DEFAULT '{"logo_url": "", "footer_text": "Kootenay Tech Community", "header_image": "", "social_links": [], "primary_color": "#3B82F6", "secondary_color": "#64748B"}'::"jsonb",
    "status" character varying DEFAULT 'draft'::character varying,
    "send_type" character varying DEFAULT 'manual'::character varying,
    "scheduled_at" timestamp with time zone,
    "sent_at" timestamp with time zone,
    "recipient_count" integer DEFAULT 0,
    "delivery_stats" "jsonb" DEFAULT '{"sent": 0, "opened": 0, "bounced": 0, "clicked": 0, "delivered": 0}'::"jsonb",
    "created_by" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "newsletter_campaigns_send_type_check" CHECK ((("send_type")::"text" = ANY ((ARRAY['manual'::character varying, 'scheduled'::character varying, 'automated'::character varying])::"text"[]))),
    CONSTRAINT "newsletter_campaigns_status_check" CHECK ((("status")::"text" = ANY ((ARRAY['draft'::character varying, 'scheduled'::character varying, 'sending'::character varying, 'sent'::character varying, 'cancelled'::character varying])::"text"[])))
);


ALTER TABLE "public"."newsletter_campaigns" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."newsletter_content_cache" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "content_type" character varying NOT NULL,
    "date_range_start" "date" NOT NULL,
    "date_range_end" "date" NOT NULL,
    "content" "jsonb" NOT NULL,
    "generated_at" timestamp with time zone DEFAULT "now"(),
    "expires_at" timestamp with time zone DEFAULT ("now"() + '24:00:00'::interval)
);


ALTER TABLE "public"."newsletter_content_cache" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."newsletter_content_rules" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" character varying NOT NULL,
    "description" "text",
    "content_type" character varying,
    "selection_criteria" "jsonb" DEFAULT '{}'::"jsonb",
    "max_items" integer DEFAULT 5,
    "priority" integer DEFAULT 0,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "newsletter_content_rules_content_type_check" CHECK ((("content_type")::"text" = ANY ((ARRAY['events'::character varying, 'news'::character varying, 'opportunities'::character varying, 'marketplace'::character varying, 'members'::character varying, 'companies'::character varying])::"text"[])))
);


ALTER TABLE "public"."newsletter_content_rules" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."newsletter_subscriptions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "email" character varying NOT NULL,
    "member_id" "uuid",
    "status" character varying DEFAULT 'pending'::character varying,
    "preferences" "jsonb" DEFAULT '{"format": "digest", "language": "en", "frequency": "weekly", "content_types": ["events", "news", "opportunities", "marketplace"], "location_filter": true}'::"jsonb",
    "subscription_token" character varying DEFAULT "encode"("extensions"."gen_random_bytes"(32), 'hex'::"text") NOT NULL,
    "confirmation_token" character varying DEFAULT "encode"("extensions"."gen_random_bytes"(32), 'hex'::"text"),
    "confirmed_at" timestamp with time zone,
    "subscribed_at" timestamp with time zone DEFAULT "now"(),
    "unsubscribed_at" timestamp with time zone,
    "last_sent_at" timestamp with time zone,
    "bounce_count" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "newsletter_subscriptions_status_check" CHECK ((("status")::"text" = ANY ((ARRAY['pending'::character varying, 'active'::character varying, 'unsubscribed'::character varying, 'bounced'::character varying])::"text"[])))
);


ALTER TABLE "public"."newsletter_subscriptions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."newsletter_templates" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" character varying NOT NULL,
    "description" "text",
    "type" character varying DEFAULT 'mjml'::character varying,
    "template_content" "text" NOT NULL,
    "default_settings" "jsonb" DEFAULT '{}'::"jsonb",
    "preview_image" character varying,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "newsletter_templates_type_check" CHECK ((("type")::"text" = ANY ((ARRAY['mjml'::character varying, 'react-email'::character varying])::"text"[])))
);


ALTER TABLE "public"."newsletter_templates" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."opportunities" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "title" "text" NOT NULL,
    "description" "text" NOT NULL,
    "type" "text" NOT NULL,
    "location" "text" NOT NULL,
    "remote" boolean DEFAULT false NOT NULL,
    "compensation" "text",
    "deadline" "date",
    "contact_email" "text" NOT NULL,
    "website" "text",
    "image" "text",
    "status" "text" DEFAULT 'published'::"text" NOT NULL,
    "featured" boolean DEFAULT false,
    "organization" "text" NOT NULL,
    "posted_by" "uuid" NOT NULL,
    "requirements" "text"[],
    "responsibilities" "text"[],
    "benefits" "text"[]
);


ALTER TABLE "public"."opportunities" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."opportunity_tags" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "opportunity_id" "uuid" NOT NULL,
    "tag_id" "uuid" NOT NULL
);


ALTER TABLE "public"."opportunity_tags" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."resource_tags" (
    "resource_id" "uuid" NOT NULL,
    "tag" "text" NOT NULL
);


ALTER TABLE "public"."resource_tags" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."resources" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "title" "text" NOT NULL,
    "description" "text" NOT NULL,
    "type" "text" NOT NULL,
    "url" "text" NOT NULL,
    "image" "text",
    "status" "text" DEFAULT 'published'::"text" NOT NULL,
    "featured" boolean DEFAULT false,
    "contributor_id" "uuid" NOT NULL,
    "group_id" "uuid",
    "tags" "text"[]
);


ALTER TABLE "public"."resources" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."tags" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "name" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "description" "text",
    "color" "text" DEFAULT '#3B82F6'::"text",
    "icon" "text",
    "category" "text",
    "usage_count" integer DEFAULT 0,
    "status" "text" DEFAULT 'active'::"text",
    "created_by" "uuid",
    CONSTRAINT "tags_status_check" CHECK (("status" = ANY (ARRAY['active'::"text", 'inactive'::"text", 'deprecated'::"text"])))
);


ALTER TABLE "public"."tags" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_roles" (
    "user_id" "uuid" NOT NULL,
    "role" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."user_roles" OWNER TO "postgres";


ALTER TABLE ONLY "public"."admin_audit_log"
    ADD CONSTRAINT "admin_audit_log_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."admin_feature_translations"
    ADD CONSTRAINT "admin_feature_translations_feature_id_language_code_key" UNIQUE ("feature_id", "language_code");



ALTER TABLE ONLY "public"."admin_feature_translations"
    ADD CONSTRAINT "admin_feature_translations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."admin_features"
    ADD CONSTRAINT "admin_features_feature_key_key" UNIQUE ("feature_key");



ALTER TABLE ONLY "public"."admin_features"
    ADD CONSTRAINT "admin_features_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."companies"
    ADD CONSTRAINT "companies_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."company_members"
    ADD CONSTRAINT "company_members_pkey" PRIMARY KEY ("company_id", "member_id");



ALTER TABLE ONLY "public"."company_tags"
    ADD CONSTRAINT "company_tags_company_id_tag_id_key" UNIQUE ("company_id", "tag_id");



ALTER TABLE ONLY "public"."company_tags"
    ADD CONSTRAINT "company_tags_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."custom_roles"
    ADD CONSTRAINT "custom_roles_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."custom_roles"
    ADD CONSTRAINT "custom_roles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."event_attendees"
    ADD CONSTRAINT "event_attendees_pkey" PRIMARY KEY ("event_id", "member_id");



ALTER TABLE ONLY "public"."event_presenters"
    ADD CONSTRAINT "event_presenters_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."event_resources"
    ADD CONSTRAINT "event_resources_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."event_sessions"
    ADD CONSTRAINT "event_sessions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."event_tags"
    ADD CONSTRAINT "event_tags_event_id_tag_id_key" UNIQUE ("event_id", "tag_id");



ALTER TABLE ONLY "public"."event_tags"
    ADD CONSTRAINT "event_tags_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."events"
    ADD CONSTRAINT "events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."group_members"
    ADD CONSTRAINT "group_members_pkey" PRIMARY KEY ("group_id", "member_id");



ALTER TABLE ONLY "public"."group_tags"
    ADD CONSTRAINT "group_tags_group_id_tag_id_key" UNIQUE ("group_id", "tag_id");



ALTER TABLE ONLY "public"."group_tags"
    ADD CONSTRAINT "group_tags_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."groups"
    ADD CONSTRAINT "groups_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."marketplace_listings"
    ADD CONSTRAINT "marketplace_listings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."marketplace_tags"
    ADD CONSTRAINT "marketplace_tags_listing_id_tag_id_key" UNIQUE ("listing_id", "tag_id");



ALTER TABLE ONLY "public"."marketplace_tags"
    ADD CONSTRAINT "marketplace_tags_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."member_interests"
    ADD CONSTRAINT "member_interests_member_id_interest_key" UNIQUE ("member_id", "interest");



ALTER TABLE ONLY "public"."member_interests"
    ADD CONSTRAINT "member_interests_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."member_skills"
    ADD CONSTRAINT "member_skills_pkey" PRIMARY KEY ("member_id", "skill");



ALTER TABLE ONLY "public"."member_tags"
    ADD CONSTRAINT "member_tags_member_id_tag_id_key" UNIQUE ("member_id", "tag_id");



ALTER TABLE ONLY "public"."member_tags"
    ADD CONSTRAINT "member_tags_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."members"
    ADD CONSTRAINT "members_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."moderation_queue"
    ADD CONSTRAINT "moderation_queue_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."news_associations"
    ADD CONSTRAINT "news_associations_pkey" PRIMARY KEY ("news_id", "association_type", "association_id");



ALTER TABLE ONLY "public"."news"
    ADD CONSTRAINT "news_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."news"
    ADD CONSTRAINT "news_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."news_tags"
    ADD CONSTRAINT "news_tags_news_id_tag_id_key" UNIQUE ("news_id", "tag_id");



ALTER TABLE ONLY "public"."news_tags"
    ADD CONSTRAINT "news_tags_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."newsletter_analytics"
    ADD CONSTRAINT "newsletter_analytics_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."newsletter_campaigns"
    ADD CONSTRAINT "newsletter_campaigns_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."newsletter_content_cache"
    ADD CONSTRAINT "newsletter_content_cache_content_type_date_range_start_date_key" UNIQUE ("content_type", "date_range_start", "date_range_end");



ALTER TABLE ONLY "public"."newsletter_content_cache"
    ADD CONSTRAINT "newsletter_content_cache_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."newsletter_content_rules"
    ADD CONSTRAINT "newsletter_content_rules_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."newsletter_subscriptions"
    ADD CONSTRAINT "newsletter_subscriptions_confirmation_token_key" UNIQUE ("confirmation_token");



ALTER TABLE ONLY "public"."newsletter_subscriptions"
    ADD CONSTRAINT "newsletter_subscriptions_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."newsletter_subscriptions"
    ADD CONSTRAINT "newsletter_subscriptions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."newsletter_subscriptions"
    ADD CONSTRAINT "newsletter_subscriptions_subscription_token_key" UNIQUE ("subscription_token");



ALTER TABLE ONLY "public"."newsletter_templates"
    ADD CONSTRAINT "newsletter_templates_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."opportunities"
    ADD CONSTRAINT "opportunities_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."opportunity_tags"
    ADD CONSTRAINT "opportunity_tags_opportunity_id_tag_id_key" UNIQUE ("opportunity_id", "tag_id");



ALTER TABLE ONLY "public"."opportunity_tags"
    ADD CONSTRAINT "opportunity_tags_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."resource_tags"
    ADD CONSTRAINT "resource_tags_pkey" PRIMARY KEY ("resource_id", "tag");



ALTER TABLE ONLY "public"."resources"
    ADD CONSTRAINT "resources_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."tags"
    ADD CONSTRAINT "tags_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."tags"
    ADD CONSTRAINT "tags_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."tags"
    ADD CONSTRAINT "tags_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_pkey" PRIMARY KEY ("user_id", "role");



CREATE INDEX "idx_admin_audit_log_admin_id" ON "public"."admin_audit_log" USING "btree" ("admin_id");



CREATE INDEX "idx_admin_audit_log_created_at" ON "public"."admin_audit_log" USING "btree" ("created_at");



CREATE INDEX "idx_admin_audit_log_entity" ON "public"."admin_audit_log" USING "btree" ("entity_type", "entity_id");



CREATE INDEX "idx_admin_features_enabled" ON "public"."admin_features" USING "btree" ("enabled");



CREATE INDEX "idx_admin_features_feature_key" ON "public"."admin_features" USING "btree" ("feature_key");



CREATE INDEX "idx_company_tags_company_id" ON "public"."company_tags" USING "btree" ("company_id");



CREATE INDEX "idx_company_tags_tag_id" ON "public"."company_tags" USING "btree" ("tag_id");



CREATE INDEX "idx_event_tags_event_id" ON "public"."event_tags" USING "btree" ("event_id");



CREATE INDEX "idx_event_tags_tag_id" ON "public"."event_tags" USING "btree" ("tag_id");



CREATE INDEX "idx_group_tags_group_id" ON "public"."group_tags" USING "btree" ("group_id");



CREATE INDEX "idx_group_tags_tag_id" ON "public"."group_tags" USING "btree" ("tag_id");



CREATE INDEX "idx_marketplace_listings_featured" ON "public"."marketplace_listings" USING "btree" ("featured") WHERE ("featured" = true);



CREATE INDEX "idx_marketplace_tags_listing_id" ON "public"."marketplace_tags" USING "btree" ("listing_id");



CREATE INDEX "idx_marketplace_tags_tag_id" ON "public"."marketplace_tags" USING "btree" ("tag_id");



CREATE INDEX "idx_member_interests_interest" ON "public"."member_interests" USING "btree" ("interest");



CREATE INDEX "idx_member_interests_member_id" ON "public"."member_interests" USING "btree" ("member_id");



CREATE INDEX "idx_member_tags_member_id" ON "public"."member_tags" USING "btree" ("member_id");



CREATE INDEX "idx_member_tags_tag_id" ON "public"."member_tags" USING "btree" ("tag_id");



CREATE INDEX "idx_members_company" ON "public"."members" USING "btree" ("company");



CREATE INDEX "idx_members_featured" ON "public"."members" USING "btree" ("featured") WHERE ("featured" = true);



CREATE INDEX "idx_members_social" ON "public"."members" USING "gin" ("social");



CREATE INDEX "idx_members_user_id" ON "public"."members" USING "btree" ("user_id");



CREATE INDEX "idx_moderation_queue_item_type" ON "public"."moderation_queue" USING "btree" ("item_type");



CREATE INDEX "idx_moderation_queue_status" ON "public"."moderation_queue" USING "btree" ("status");



CREATE INDEX "idx_news_tags_news_id" ON "public"."news_tags" USING "btree" ("news_id");



CREATE INDEX "idx_news_tags_tag_id" ON "public"."news_tags" USING "btree" ("tag_id");



CREATE INDEX "idx_newsletter_analytics_campaign_id" ON "public"."newsletter_analytics" USING "btree" ("campaign_id");



CREATE INDEX "idx_newsletter_campaigns_status" ON "public"."newsletter_campaigns" USING "btree" ("status");



CREATE INDEX "idx_newsletter_subscriptions_email" ON "public"."newsletter_subscriptions" USING "btree" ("email");



CREATE INDEX "idx_newsletter_subscriptions_status" ON "public"."newsletter_subscriptions" USING "btree" ("status");



CREATE INDEX "idx_opportunities_featured" ON "public"."opportunities" USING "btree" ("featured") WHERE ("featured" = true);



CREATE INDEX "idx_opportunity_tags_opportunity_id" ON "public"."opportunity_tags" USING "btree" ("opportunity_id");



CREATE INDEX "idx_opportunity_tags_tag_id" ON "public"."opportunity_tags" USING "btree" ("tag_id");



CREATE INDEX "idx_tags_category" ON "public"."tags" USING "btree" ("category");



CREATE INDEX "idx_tags_name" ON "public"."tags" USING "btree" ("name");



CREATE INDEX "idx_tags_slug" ON "public"."tags" USING "btree" ("slug");



CREATE INDEX "idx_tags_status" ON "public"."tags" USING "btree" ("status");



CREATE OR REPLACE TRIGGER "audit_admin_features" AFTER INSERT OR DELETE OR UPDATE ON "public"."admin_features" FOR EACH ROW EXECUTE FUNCTION "public"."log_admin_action"();



CREATE OR REPLACE TRIGGER "audit_custom_roles" AFTER INSERT OR DELETE OR UPDATE ON "public"."custom_roles" FOR EACH ROW EXECUTE FUNCTION "public"."log_admin_action"();



CREATE OR REPLACE TRIGGER "audit_moderation_queue" AFTER UPDATE ON "public"."moderation_queue" FOR EACH ROW WHEN (("old"."status" IS DISTINCT FROM "new"."status")) EXECUTE FUNCTION "public"."log_admin_action"();



CREATE OR REPLACE TRIGGER "trigger_update_tag_usage_company_tags" AFTER INSERT OR DELETE ON "public"."company_tags" FOR EACH ROW EXECUTE FUNCTION "public"."update_tag_usage_count"();



CREATE OR REPLACE TRIGGER "trigger_update_tag_usage_event_tags" AFTER INSERT OR DELETE ON "public"."event_tags" FOR EACH ROW EXECUTE FUNCTION "public"."update_tag_usage_count"();



CREATE OR REPLACE TRIGGER "trigger_update_tag_usage_group_tags" AFTER INSERT OR DELETE ON "public"."group_tags" FOR EACH ROW EXECUTE FUNCTION "public"."update_tag_usage_count"();



CREATE OR REPLACE TRIGGER "trigger_update_tag_usage_marketplace_tags" AFTER INSERT OR DELETE ON "public"."marketplace_tags" FOR EACH ROW EXECUTE FUNCTION "public"."update_tag_usage_count"();



CREATE OR REPLACE TRIGGER "trigger_update_tag_usage_member_tags" AFTER INSERT OR DELETE ON "public"."member_tags" FOR EACH ROW EXECUTE FUNCTION "public"."update_tag_usage_count"();



CREATE OR REPLACE TRIGGER "trigger_update_tag_usage_news_tags" AFTER INSERT OR DELETE ON "public"."news_tags" FOR EACH ROW EXECUTE FUNCTION "public"."update_tag_usage_count"();



CREATE OR REPLACE TRIGGER "trigger_update_tag_usage_opportunity_tags" AFTER INSERT OR DELETE ON "public"."opportunity_tags" FOR EACH ROW EXECUTE FUNCTION "public"."update_tag_usage_count"();



CREATE OR REPLACE TRIGGER "update_admin_feature_translations_updated_at" BEFORE UPDATE ON "public"."admin_feature_translations" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at"();



CREATE OR REPLACE TRIGGER "update_admin_features_updated_at" BEFORE UPDATE ON "public"."admin_features" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at"();



CREATE OR REPLACE TRIGGER "update_custom_roles_updated_at" BEFORE UPDATE ON "public"."custom_roles" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at"();



CREATE OR REPLACE TRIGGER "update_event_attendee_count_trigger" AFTER INSERT OR DELETE ON "public"."event_attendees" FOR EACH ROW EXECUTE FUNCTION "public"."update_event_attendee_count"();



CREATE OR REPLACE TRIGGER "update_group_member_count_trigger" AFTER INSERT OR DELETE ON "public"."group_members" FOR EACH ROW EXECUTE FUNCTION "public"."update_group_member_count"();



CREATE OR REPLACE TRIGGER "update_moderation_queue_updated_at" BEFORE UPDATE ON "public"."moderation_queue" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at"();



ALTER TABLE ONLY "public"."admin_feature_translations"
    ADD CONSTRAINT "admin_feature_translations_feature_id_fkey" FOREIGN KEY ("feature_id") REFERENCES "public"."admin_features"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."company_members"
    ADD CONSTRAINT "company_members_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."company_members"
    ADD CONSTRAINT "company_members_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."company_tags"
    ADD CONSTRAINT "company_tags_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."company_tags"
    ADD CONSTRAINT "company_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."event_attendees"
    ADD CONSTRAINT "event_attendees_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."event_attendees"
    ADD CONSTRAINT "event_attendees_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."event_presenters"
    ADD CONSTRAINT "event_presenters_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."event_presenters"
    ADD CONSTRAINT "event_presenters_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "public"."event_sessions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."event_resources"
    ADD CONSTRAINT "event_resources_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "public"."event_sessions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."event_sessions"
    ADD CONSTRAINT "event_sessions_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."event_tags"
    ADD CONSTRAINT "event_tags_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."event_tags"
    ADD CONSTRAINT "event_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."events"
    ADD CONSTRAINT "events_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."events"
    ADD CONSTRAINT "events_organizer_id_fkey" FOREIGN KEY ("organizer_id") REFERENCES "public"."members"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."group_members"
    ADD CONSTRAINT "group_members_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."group_members"
    ADD CONSTRAINT "group_members_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."group_tags"
    ADD CONSTRAINT "group_tags_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."group_tags"
    ADD CONSTRAINT "group_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."marketplace_listings"
    ADD CONSTRAINT "marketplace_listings_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "public"."members"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."marketplace_tags"
    ADD CONSTRAINT "marketplace_tags_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "public"."marketplace_listings"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."marketplace_tags"
    ADD CONSTRAINT "marketplace_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."member_interests"
    ADD CONSTRAINT "member_interests_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."member_skills"
    ADD CONSTRAINT "member_skills_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."member_tags"
    ADD CONSTRAINT "member_tags_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."member_tags"
    ADD CONSTRAINT "member_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."members"
    ADD CONSTRAINT "members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."news_associations"
    ADD CONSTRAINT "news_associations_news_id_fkey" FOREIGN KEY ("news_id") REFERENCES "public"."news"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."news"
    ADD CONSTRAINT "news_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "public"."members"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."news_tags"
    ADD CONSTRAINT "news_tags_news_id_fkey" FOREIGN KEY ("news_id") REFERENCES "public"."news"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."news_tags"
    ADD CONSTRAINT "news_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."newsletter_analytics"
    ADD CONSTRAINT "newsletter_analytics_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "public"."newsletter_campaigns"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."newsletter_analytics"
    ADD CONSTRAINT "newsletter_analytics_subscription_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "public"."newsletter_subscriptions"("id");



ALTER TABLE ONLY "public"."newsletter_campaigns"
    ADD CONSTRAINT "newsletter_campaigns_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "public"."newsletter_templates"("id");



ALTER TABLE ONLY "public"."newsletter_subscriptions"
    ADD CONSTRAINT "newsletter_subscriptions_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id");



ALTER TABLE ONLY "public"."opportunities"
    ADD CONSTRAINT "opportunities_posted_by_fkey" FOREIGN KEY ("posted_by") REFERENCES "public"."members"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."opportunity_tags"
    ADD CONSTRAINT "opportunity_tags_opportunity_id_fkey" FOREIGN KEY ("opportunity_id") REFERENCES "public"."opportunities"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."opportunity_tags"
    ADD CONSTRAINT "opportunity_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."resource_tags"
    ADD CONSTRAINT "resource_tags_resource_id_fkey" FOREIGN KEY ("resource_id") REFERENCES "public"."resources"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."resources"
    ADD CONSTRAINT "resources_contributor_id_fkey" FOREIGN KEY ("contributor_id") REFERENCES "public"."members"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."resources"
    ADD CONSTRAINT "resources_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."tags"
    ADD CONSTRAINT "tags_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."members"("id");



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



CREATE POLICY "Admins can view audit log" ON "public"."admin_audit_log" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."user_roles" "ur"
  WHERE (("ur"."user_id" = "auth"."uid"()) AND ("ur"."role" = ANY (ARRAY['superadmin'::"text", 'admin'::"text"]))))));



CREATE POLICY "Admins can view custom roles" ON "public"."custom_roles" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."user_roles" "ur"
  WHERE (("ur"."user_id" = "auth"."uid"()) AND ("ur"."role" = ANY (ARRAY['superadmin'::"text", 'admin'::"text"]))))));



CREATE POLICY "Anyone can read company members" ON "public"."company_members" FOR SELECT USING (true);



CREATE POLICY "Anyone can read event presenters for published events" ON "public"."event_presenters" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM ("public"."event_sessions"
     JOIN "public"."events" ON (("event_sessions"."event_id" = "events"."id")))
  WHERE (("event_sessions"."id" = "event_presenters"."session_id") AND ("events"."status" = 'published'::"text")))));



CREATE POLICY "Anyone can read event sessions for published events" ON "public"."event_sessions" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."events"
  WHERE (("events"."id" = "event_sessions"."event_id") AND ("events"."status" = 'published'::"text")))));



CREATE POLICY "Anyone can read member skills" ON "public"."member_skills" FOR SELECT USING (true);



CREATE POLICY "Anyone can read news associations for published news" ON "public"."news_associations" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."news"
  WHERE (("news"."id" = "news_associations"."news_id") AND ("news"."status" = 'published'::"text")))));



CREATE POLICY "Anyone can read published marketplace listings" ON "public"."marketplace_listings" FOR SELECT USING (("status" = 'published'::"text"));



CREATE POLICY "Anyone can read published members" ON "public"."members" FOR SELECT USING (("status" = 'published'::"text"));



CREATE POLICY "Anyone can read published news" ON "public"."news" FOR SELECT USING (("status" = 'published'::"text"));



CREATE POLICY "Anyone can read published opportunities" ON "public"."opportunities" FOR SELECT USING (("status" = 'published'::"text"));



CREATE POLICY "Anyone can read resource tags" ON "public"."resource_tags" FOR SELECT USING (true);



CREATE POLICY "Anyone can subscribe" ON "public"."newsletter_subscriptions" FOR INSERT WITH CHECK (true);



CREATE POLICY "Authenticated users can create marketplace listings" ON "public"."marketplace_listings" FOR INSERT WITH CHECK ((("auth"."uid"() IS NOT NULL) AND ("seller_id" IN ( SELECT "members"."id"
   FROM "public"."members"
  WHERE ("members"."user_id" = "auth"."uid"())))));



CREATE POLICY "Authenticated users can create member profiles" ON "public"."members" FOR INSERT WITH CHECK (("auth"."uid"() IS NOT NULL));



CREATE POLICY "Authenticated users can create news" ON "public"."news" FOR INSERT WITH CHECK ((("auth"."uid"() IS NOT NULL) AND ("author_id" IN ( SELECT "members"."id"
   FROM "public"."members"
  WHERE ("members"."user_id" = "auth"."uid"())))));



CREATE POLICY "Authenticated users can create opportunities" ON "public"."opportunities" FOR INSERT WITH CHECK ((("auth"."uid"() IS NOT NULL) AND ("posted_by" IN ( SELECT "members"."id"
   FROM "public"."members"
  WHERE ("members"."user_id" = "auth"."uid"())))));



CREATE POLICY "Authenticated users can create resources" ON "public"."resources" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Authors can delete their own news" ON "public"."news" FOR DELETE USING (("author_id" IN ( SELECT "members"."id"
   FROM "public"."members"
  WHERE ("members"."user_id" = "auth"."uid"()))));



CREATE POLICY "Authors can manage associations for their own news" ON "public"."news_associations" USING ((EXISTS ( SELECT 1
   FROM "public"."news"
  WHERE (("news"."id" = "news_associations"."news_id") AND ("news"."author_id" IN ( SELECT "members"."id"
           FROM "public"."members"
          WHERE ("members"."user_id" = "auth"."uid"())))))));



CREATE POLICY "Authors can read their own news" ON "public"."news" FOR SELECT USING (("author_id" IN ( SELECT "members"."id"
   FROM "public"."members"
  WHERE ("members"."user_id" = "auth"."uid"()))));



CREATE POLICY "Authors can update their own news" ON "public"."news" FOR UPDATE USING (("author_id" IN ( SELECT "members"."id"
   FROM "public"."members"
  WHERE ("members"."user_id" = "auth"."uid"()))));



CREATE POLICY "Company members can manage their company's members" ON "public"."company_members" USING ((EXISTS ( SELECT 1
   FROM "public"."company_members" "cm"
  WHERE (("cm"."company_id" = "company_members"."company_id") AND ("cm"."member_id" IN ( SELECT "members"."id"
           FROM "public"."members"
          WHERE ("members"."user_id" = "auth"."uid"())))))));



CREATE POLICY "Company members can manage their own company memberships" ON "public"."company_members" USING (("member_id" IN ( SELECT "members"."id"
   FROM "public"."members"
  WHERE ("members"."user_id" = "auth"."uid"()))));



CREATE POLICY "Contributors can delete their own resources" ON "public"."resources" FOR DELETE TO "authenticated" USING (("contributor_id" IN ( SELECT "members"."id"
   FROM "public"."members"
  WHERE (("members"."user_id")::"text" = ("auth"."uid"())::"text"))));



CREATE POLICY "Contributors can manage tags for their own resources" ON "public"."resource_tags" USING ((EXISTS ( SELECT 1
   FROM "public"."resources"
  WHERE (("resources"."id" = "resource_tags"."resource_id") AND ("resources"."contributor_id" IN ( SELECT "members"."id"
           FROM "public"."members"
          WHERE ("members"."user_id" = "auth"."uid"())))))));



CREATE POLICY "Contributors can update their own resources" ON "public"."resources" FOR UPDATE TO "authenticated" USING (("contributor_id" IN ( SELECT "members"."id"
   FROM "public"."members"
  WHERE (("members"."user_id")::"text" = ("auth"."uid"())::"text"))));



CREATE POLICY "Event organizers can manage their event presenters" ON "public"."event_presenters" USING ((EXISTS ( SELECT 1
   FROM ("public"."event_sessions"
     JOIN "public"."events" ON (("event_sessions"."event_id" = "events"."id")))
  WHERE (("event_sessions"."id" = "event_presenters"."session_id") AND ("events"."organizer_id" IN ( SELECT "members"."id"
           FROM "public"."members"
          WHERE ("members"."user_id" = "auth"."uid"())))))));



CREATE POLICY "Event organizers can manage their event sessions" ON "public"."event_sessions" USING ((EXISTS ( SELECT 1
   FROM "public"."events"
  WHERE (("events"."id" = "event_sessions"."event_id") AND ("events"."organizer_id" IN ( SELECT "members"."id"
           FROM "public"."members"
          WHERE ("members"."user_id" = "auth"."uid"())))))));



CREATE POLICY "Group admins can manage group event sessions" ON "public"."event_sessions" USING ((EXISTS ( SELECT 1
   FROM ("public"."events"
     JOIN "public"."group_members" ON (("events"."group_id" = "group_members"."group_id")))
  WHERE (("events"."id" = "event_sessions"."event_id") AND ("group_members"."role" = 'admin'::"text") AND ("group_members"."member_id" IN ( SELECT "members"."id"
           FROM "public"."members"
          WHERE ("members"."user_id" = "auth"."uid"())))))));



CREATE POLICY "Members can read resources for their groups" ON "public"."resources" FOR SELECT TO "authenticated" USING ((("status" = 'published'::"text") AND ("group_id" IS NOT NULL) AND (EXISTS ( SELECT 1
   FROM "public"."group_members" "gm"
  WHERE (("gm"."group_id" = "resources"."group_id") AND (("gm"."member_id")::"text" = ("auth"."uid"())::"text"))))));



CREATE POLICY "Moderators can update moderation queue" ON "public"."moderation_queue" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."user_roles" "ur"
  WHERE (("ur"."user_id" = "auth"."uid"()) AND ("ur"."role" = ANY (ARRAY['superadmin'::"text", 'admin'::"text"]))))));



CREATE POLICY "Moderators can view moderation queue" ON "public"."moderation_queue" FOR SELECT USING (((EXISTS ( SELECT 1
   FROM "public"."user_roles" "ur"
  WHERE (("ur"."user_id" = "auth"."uid"()) AND ("ur"."role" = ANY (ARRAY['superadmin'::"text", 'admin'::"text"]))))) OR ("submitted_by" = "auth"."uid"())));



CREATE POLICY "Posters can delete their own opportunities" ON "public"."opportunities" FOR DELETE USING (("posted_by" IN ( SELECT "members"."id"
   FROM "public"."members"
  WHERE ("members"."user_id" = "auth"."uid"()))));



CREATE POLICY "Posters can read their own opportunities" ON "public"."opportunities" FOR SELECT USING (("posted_by" IN ( SELECT "members"."id"
   FROM "public"."members"
  WHERE ("members"."user_id" = "auth"."uid"()))));



CREATE POLICY "Posters can update their own opportunities" ON "public"."opportunities" FOR UPDATE USING (("posted_by" IN ( SELECT "members"."id"
   FROM "public"."members"
  WHERE ("members"."user_id" = "auth"."uid"()))));



CREATE POLICY "Public can read
  published members" ON "public"."members" FOR SELECT TO "authenticated", "anon" USING (("status" = 'published'::"text"));



CREATE POLICY "Public can read event
  sessions" ON "public"."event_sessions" FOR SELECT TO "authenticated", "anon" USING ((EXISTS ( SELECT 1
   FROM "public"."events"
  WHERE (("events"."id" = "event_sessions"."event_id") AND ("events"."status" = 'published'::"text")))));



CREATE POLICY "Public can read published resources" ON "public"."resources" FOR SELECT USING (("status" = 'published'::"text"));



CREATE POLICY "Sellers can delete their own marketplace listings" ON "public"."marketplace_listings" FOR DELETE USING (("seller_id" IN ( SELECT "members"."id"
   FROM "public"."members"
  WHERE ("members"."user_id" = "auth"."uid"()))));



CREATE POLICY "Sellers can read their own marketplace listings" ON "public"."marketplace_listings" FOR SELECT USING (("seller_id" IN ( SELECT "members"."id"
   FROM "public"."members"
  WHERE ("members"."user_id" = "auth"."uid"()))));



CREATE POLICY "Sellers can update their own marketplace listings" ON "public"."marketplace_listings" FOR UPDATE USING (("seller_id" IN ( SELECT "members"."id"
   FROM "public"."members"
  WHERE ("members"."user_id" = "auth"."uid"()))));



CREATE POLICY "Service role bypass" ON "public"."user_roles" USING ((("auth"."jwt"() ->> 'role'::"text") = 'service_role'::"text"));



CREATE POLICY "Service role can manage
   user roles" ON "public"."user_roles" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Superadmins can manage admin features" ON "public"."admin_features" USING ((EXISTS ( SELECT 1
   FROM "public"."user_roles" "ur"
  WHERE (("ur"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'superadmin'::"text")))));



CREATE POLICY "Superadmins can manage all company members" ON "public"."company_members" USING ((EXISTS ( SELECT 1
   FROM "public"."user_roles"
  WHERE (("user_roles"."user_id" = "auth"."uid"()) AND ("user_roles"."role" = 'superadmin'::"text")))));



CREATE POLICY "Superadmins can manage all event presenters" ON "public"."event_presenters" USING ((EXISTS ( SELECT 1
   FROM "public"."user_roles"
  WHERE (("user_roles"."user_id" = "auth"."uid"()) AND ("user_roles"."role" = 'superadmin'::"text")))));



CREATE POLICY "Superadmins can manage all event sessions" ON "public"."event_sessions" USING ((EXISTS ( SELECT 1
   FROM "public"."user_roles"
  WHERE (("user_roles"."user_id" = "auth"."uid"()) AND ("user_roles"."role" = 'superadmin'::"text")))));



CREATE POLICY "Superadmins can manage all marketplace listings" ON "public"."marketplace_listings" USING ((EXISTS ( SELECT 1
   FROM "public"."user_roles"
  WHERE (("user_roles"."user_id" = "auth"."uid"()) AND ("user_roles"."role" = 'superadmin'::"text")))));



CREATE POLICY "Superadmins can manage all member skills" ON "public"."member_skills" USING ((EXISTS ( SELECT 1
   FROM "public"."user_roles"
  WHERE (("user_roles"."user_id" = "auth"."uid"()) AND ("user_roles"."role" = 'superadmin'::"text")))));



CREATE POLICY "Superadmins can manage all members" ON "public"."members" USING ("public"."is_superadmin_direct"("auth"."uid"()));



CREATE POLICY "Superadmins can manage all news" ON "public"."news" USING ("public"."is_superadmin_direct"("auth"."uid"()));



CREATE POLICY "Superadmins can manage all news associations" ON "public"."news_associations" USING ((EXISTS ( SELECT 1
   FROM "public"."user_roles"
  WHERE (("user_roles"."user_id" = "auth"."uid"()) AND ("user_roles"."role" = 'superadmin'::"text")))));



CREATE POLICY "Superadmins can manage all opportunities" ON "public"."opportunities" USING ((EXISTS ( SELECT 1
   FROM "public"."user_roles"
  WHERE (("user_roles"."user_id" = "auth"."uid"()) AND ("user_roles"."role" = 'superadmin'::"text")))));



CREATE POLICY "Superadmins can manage all resource tags" ON "public"."resource_tags" USING ((EXISTS ( SELECT 1
   FROM "public"."user_roles"
  WHERE (("user_roles"."user_id" = "auth"."uid"()) AND ("user_roles"."role" = 'superadmin'::"text")))));



CREATE POLICY "Superadmins can manage all resources" ON "public"."resources" USING ("public"."is_superadmin_direct"("auth"."uid"()));



CREATE POLICY "Superadmins can manage campaigns" ON "public"."newsletter_campaigns" USING ("public"."is_superadmin_direct"("auth"."uid"()));



CREATE POLICY "Superadmins can manage custom roles" ON "public"."custom_roles" USING ((EXISTS ( SELECT 1
   FROM "public"."user_roles" "ur"
  WHERE (("ur"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'superadmin'::"text")))));



CREATE POLICY "Superadmins can manage feature translations" ON "public"."admin_feature_translations" USING ((EXISTS ( SELECT 1
   FROM "public"."user_roles" "ur"
  WHERE (("ur"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'superadmin'::"text")))));



CREATE POLICY "Superadmins can manage newsletters" ON "public"."newsletter_subscriptions" USING ("public"."is_superadmin_direct"("auth"."uid"()));



CREATE POLICY "Superadmins can manage rules" ON "public"."newsletter_content_rules" USING ("public"."is_superadmin_direct"("auth"."uid"()));



CREATE POLICY "Superadmins can manage templates" ON "public"."newsletter_templates" USING ("public"."is_superadmin_direct"("auth"."uid"()));



CREATE POLICY "Superadmins can view admin features" ON "public"."admin_features" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."user_roles" "ur"
  WHERE (("ur"."user_id" = "auth"."uid"()) AND ("ur"."role" = 'superadmin'::"text")))));



CREATE POLICY "Superadmins can view analytics" ON "public"."newsletter_analytics" FOR SELECT USING ("public"."is_superadmin_direct"("auth"."uid"()));



CREATE POLICY "System can manage cache" ON "public"."newsletter_content_cache" USING (("auth"."uid"() IS NOT NULL));



CREATE POLICY "Users can add themselves to companies" ON "public"."company_members" FOR INSERT WITH CHECK (("member_id" IN ( SELECT "members"."id"
   FROM "public"."members"
  WHERE ("members"."user_id" = "auth"."uid"()))));



CREATE POLICY "Users can delete their own profiles" ON "public"."members" FOR DELETE USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can insert their own member profile" ON "public"."members" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage their own member interests" ON "public"."member_interests" USING ((EXISTS ( SELECT 1
   FROM "public"."members"
  WHERE (("members"."id" = "member_interests"."member_id") AND ("members"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can manage their own member skills" ON "public"."member_skills" USING ((EXISTS ( SELECT 1
   FROM "public"."members"
  WHERE (("members"."id" = "member_skills"."member_id") AND ("members"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can manage their own skills" ON "public"."member_skills" USING ((EXISTS ( SELECT 1
   FROM "public"."members"
  WHERE (("members"."id" = "member_skills"."member_id") AND ("members"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can read own
  roles" ON "public"."user_roles" FOR SELECT TO "authenticated" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can read their own member profile" ON "public"."members" FOR SELECT USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can read their own profiles" ON "public"."members" FOR SELECT USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can submit to moderation queue" ON "public"."moderation_queue" FOR INSERT WITH CHECK (("submitted_by" = "auth"."uid"()));



CREATE POLICY "Users can update their own member profile" ON "public"."members" FOR UPDATE USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own profiles" ON "public"."members" FOR UPDATE USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can view member interests" ON "public"."member_interests" FOR SELECT USING (true);



CREATE POLICY "Users can view member skills" ON "public"."member_skills" FOR SELECT USING (true);



CREATE POLICY "Users can view own user_roles" ON "public"."user_roles" FOR SELECT USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can view published members" ON "public"."members" FOR SELECT USING ((("status" = 'published'::"text") OR ("auth"."uid"() = "user_id")));



CREATE POLICY "Users can view their own roles" ON "public"."user_roles" FOR SELECT USING (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."admin_audit_log" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."admin_feature_translations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."admin_features" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "anyone_can_read_companies" ON "public"."companies" FOR SELECT USING (true);



CREATE POLICY "authenticated_can_create_tags" ON "public"."tags" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() IS NOT NULL));



CREATE POLICY "authenticated_can_manage_company_tags" ON "public"."company_tags" TO "authenticated" USING (true);



CREATE POLICY "authenticated_can_manage_event_tags" ON "public"."event_tags" TO "authenticated" USING (true);



CREATE POLICY "authenticated_can_manage_group_tags" ON "public"."group_tags" TO "authenticated" USING (true);



CREATE POLICY "authenticated_can_manage_marketplace_tags" ON "public"."marketplace_tags" TO "authenticated" USING (true);



CREATE POLICY "authenticated_can_manage_member_tags" ON "public"."member_tags" TO "authenticated" USING (true);



CREATE POLICY "authenticated_can_manage_news_tags" ON "public"."news_tags" TO "authenticated" USING (true);



CREATE POLICY "authenticated_can_manage_opportunity_tags" ON "public"."opportunity_tags" TO "authenticated" USING (true);



CREATE POLICY "authenticated_can_read_all_groups" ON "public"."groups" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "authenticated_can_read_all_listings" ON "public"."marketplace_listings" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "authenticated_can_read_all_members" ON "public"."members" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "authenticated_can_read_all_news" ON "public"."news" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "authenticated_can_read_all_opportunities" ON "public"."opportunities" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "authenticated_can_read_all_resources" ON "public"."resources" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "authenticated_can_read_all_tags" ON "public"."tags" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "authenticated_users_can_read_all_companies" ON "public"."companies" FOR SELECT TO "authenticated" USING (true);



ALTER TABLE "public"."companies" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."company_members" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."company_tags" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."custom_roles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."event_attendees" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."event_presenters" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."event_resources" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."event_sessions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."event_tags" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."events" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."group_members" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."group_tags" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."groups" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."marketplace_listings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."marketplace_tags" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."member_interests" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."member_skills" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."member_tags" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."members" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."moderation_queue" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."news" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."news_associations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."news_tags" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."newsletter_analytics" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."newsletter_campaigns" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."newsletter_content_cache" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."newsletter_content_rules" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."newsletter_subscriptions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."newsletter_templates" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."opportunities" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."opportunity_tags" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "public_can_read_active_opportunities" ON "public"."opportunities" FOR SELECT TO "anon" USING (("status" = 'active'::"text"));



CREATE POLICY "public_can_read_active_tags" ON "public"."tags" FOR SELECT USING (("status" = 'active'::"text"));



CREATE POLICY "public_can_read_company_tags" ON "public"."company_tags" FOR SELECT USING (true);



CREATE POLICY "public_can_read_event_tags" ON "public"."event_tags" FOR SELECT USING (true);



CREATE POLICY "public_can_read_group_members" ON "public"."group_members" FOR SELECT USING (true);



CREATE POLICY "public_can_read_group_tags" ON "public"."group_tags" FOR SELECT USING (true);



CREATE POLICY "public_can_read_marketplace_tags" ON "public"."marketplace_tags" FOR SELECT USING (true);



CREATE POLICY "public_can_read_member_tags" ON "public"."member_tags" FOR SELECT USING (true);



CREATE POLICY "public_can_read_news_tags" ON "public"."news_tags" FOR SELECT USING (true);



CREATE POLICY "public_can_read_opportunity_tags" ON "public"."opportunity_tags" FOR SELECT USING (true);



CREATE POLICY "public_can_read_published_groups" ON "public"."groups" FOR SELECT TO "anon" USING ((("status" = 'published'::"text") AND ("visibility" = ANY (ARRAY['open'::"text", 'closed'::"text"]))));



CREATE POLICY "public_can_read_published_listings" ON "public"."marketplace_listings" FOR SELECT TO "anon" USING (("status" = 'published'::"text"));



CREATE POLICY "public_can_read_published_members" ON "public"."members" FOR SELECT TO "anon" USING (("status" = 'published'::"text"));



CREATE POLICY "public_can_read_published_news" ON "public"."news" FOR SELECT TO "anon" USING (("status" = 'published'::"text"));



CREATE POLICY "public_can_read_published_resources" ON "public"."resources" FOR SELECT TO "anon" USING (("status" = 'published'::"text"));



CREATE POLICY "public_read_event_sessions" ON "public"."event_sessions" FOR SELECT USING (true);



CREATE POLICY "public_read_published_events" ON "public"."events" FOR SELECT USING (("status" = 'published'::"text"));



ALTER TABLE "public"."resource_tags" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."resources" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."tags" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_roles" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

























































































































































GRANT ALL ON FUNCTION "public"."create_member_profile"("name" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."create_member_profile"("name" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_member_profile"("name" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_tag_slug"("tag_name" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."generate_tag_slug"("tag_name" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_tag_slug"("tag_name" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user_profile"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user_profile"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user_profile"() TO "service_role";



GRANT ALL ON FUNCTION "public"."is_admin_of_group"("p_user_id" "uuid", "p_group_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."is_admin_of_group"("p_user_id" "uuid", "p_group_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_admin_of_group"("p_user_id" "uuid", "p_group_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_member_of_group"("p_user_id" "uuid", "p_group_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."is_member_of_group"("p_user_id" "uuid", "p_group_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_member_of_group"("p_user_id" "uuid", "p_group_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_superadmin_direct"("check_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."is_superadmin_direct"("check_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_superadmin_direct"("check_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."log_admin_action"() TO "anon";
GRANT ALL ON FUNCTION "public"."log_admin_action"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."log_admin_action"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_event_attendee_count"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_event_attendee_count"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_event_attendee_count"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_group_member_count"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_group_member_count"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_group_member_count"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_tag_usage_count"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_tag_usage_count"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_tag_usage_count"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at"() TO "service_role";


















GRANT ALL ON TABLE "public"."admin_audit_log" TO "anon";
GRANT ALL ON TABLE "public"."admin_audit_log" TO "authenticated";
GRANT ALL ON TABLE "public"."admin_audit_log" TO "service_role";



GRANT ALL ON TABLE "public"."admin_feature_translations" TO "anon";
GRANT ALL ON TABLE "public"."admin_feature_translations" TO "authenticated";
GRANT ALL ON TABLE "public"."admin_feature_translations" TO "service_role";



GRANT ALL ON TABLE "public"."admin_features" TO "anon";
GRANT ALL ON TABLE "public"."admin_features" TO "authenticated";
GRANT ALL ON TABLE "public"."admin_features" TO "service_role";



GRANT ALL ON TABLE "public"."companies" TO "anon";
GRANT ALL ON TABLE "public"."companies" TO "authenticated";
GRANT ALL ON TABLE "public"."companies" TO "service_role";



GRANT ALL ON TABLE "public"."company_members" TO "anon";
GRANT ALL ON TABLE "public"."company_members" TO "authenticated";
GRANT ALL ON TABLE "public"."company_members" TO "service_role";



GRANT ALL ON TABLE "public"."company_tags" TO "anon";
GRANT ALL ON TABLE "public"."company_tags" TO "authenticated";
GRANT ALL ON TABLE "public"."company_tags" TO "service_role";



GRANT ALL ON TABLE "public"."custom_roles" TO "anon";
GRANT ALL ON TABLE "public"."custom_roles" TO "authenticated";
GRANT ALL ON TABLE "public"."custom_roles" TO "service_role";



GRANT ALL ON TABLE "public"."event_attendees" TO "anon";
GRANT ALL ON TABLE "public"."event_attendees" TO "authenticated";
GRANT ALL ON TABLE "public"."event_attendees" TO "service_role";



GRANT ALL ON TABLE "public"."event_presenters" TO "anon";
GRANT ALL ON TABLE "public"."event_presenters" TO "authenticated";
GRANT ALL ON TABLE "public"."event_presenters" TO "service_role";



GRANT ALL ON TABLE "public"."event_resources" TO "anon";
GRANT ALL ON TABLE "public"."event_resources" TO "authenticated";
GRANT ALL ON TABLE "public"."event_resources" TO "service_role";



GRANT ALL ON TABLE "public"."event_sessions" TO "anon";
GRANT ALL ON TABLE "public"."event_sessions" TO "authenticated";
GRANT ALL ON TABLE "public"."event_sessions" TO "service_role";



GRANT ALL ON TABLE "public"."event_tags" TO "anon";
GRANT ALL ON TABLE "public"."event_tags" TO "authenticated";
GRANT ALL ON TABLE "public"."event_tags" TO "service_role";



GRANT ALL ON TABLE "public"."events" TO "anon";
GRANT ALL ON TABLE "public"."events" TO "authenticated";
GRANT ALL ON TABLE "public"."events" TO "service_role";



GRANT ALL ON TABLE "public"."group_members" TO "anon";
GRANT ALL ON TABLE "public"."group_members" TO "authenticated";
GRANT ALL ON TABLE "public"."group_members" TO "service_role";



GRANT ALL ON TABLE "public"."group_tags" TO "anon";
GRANT ALL ON TABLE "public"."group_tags" TO "authenticated";
GRANT ALL ON TABLE "public"."group_tags" TO "service_role";



GRANT ALL ON TABLE "public"."groups" TO "anon";
GRANT ALL ON TABLE "public"."groups" TO "authenticated";
GRANT ALL ON TABLE "public"."groups" TO "service_role";



GRANT ALL ON TABLE "public"."marketplace_listings" TO "anon";
GRANT ALL ON TABLE "public"."marketplace_listings" TO "authenticated";
GRANT ALL ON TABLE "public"."marketplace_listings" TO "service_role";



GRANT ALL ON TABLE "public"."marketplace_tags" TO "anon";
GRANT ALL ON TABLE "public"."marketplace_tags" TO "authenticated";
GRANT ALL ON TABLE "public"."marketplace_tags" TO "service_role";



GRANT ALL ON TABLE "public"."member_interests" TO "anon";
GRANT ALL ON TABLE "public"."member_interests" TO "authenticated";
GRANT ALL ON TABLE "public"."member_interests" TO "service_role";



GRANT ALL ON TABLE "public"."member_skills" TO "anon";
GRANT ALL ON TABLE "public"."member_skills" TO "authenticated";
GRANT ALL ON TABLE "public"."member_skills" TO "service_role";



GRANT ALL ON TABLE "public"."member_tags" TO "anon";
GRANT ALL ON TABLE "public"."member_tags" TO "authenticated";
GRANT ALL ON TABLE "public"."member_tags" TO "service_role";



GRANT ALL ON TABLE "public"."members" TO "anon";
GRANT ALL ON TABLE "public"."members" TO "authenticated";
GRANT ALL ON TABLE "public"."members" TO "service_role";



GRANT ALL ON TABLE "public"."moderation_queue" TO "anon";
GRANT ALL ON TABLE "public"."moderation_queue" TO "authenticated";
GRANT ALL ON TABLE "public"."moderation_queue" TO "service_role";



GRANT ALL ON TABLE "public"."news" TO "anon";
GRANT ALL ON TABLE "public"."news" TO "authenticated";
GRANT ALL ON TABLE "public"."news" TO "service_role";



GRANT ALL ON TABLE "public"."news_associations" TO "anon";
GRANT ALL ON TABLE "public"."news_associations" TO "authenticated";
GRANT ALL ON TABLE "public"."news_associations" TO "service_role";



GRANT ALL ON TABLE "public"."news_tags" TO "anon";
GRANT ALL ON TABLE "public"."news_tags" TO "authenticated";
GRANT ALL ON TABLE "public"."news_tags" TO "service_role";



GRANT ALL ON TABLE "public"."newsletter_analytics" TO "anon";
GRANT ALL ON TABLE "public"."newsletter_analytics" TO "authenticated";
GRANT ALL ON TABLE "public"."newsletter_analytics" TO "service_role";



GRANT ALL ON TABLE "public"."newsletter_campaigns" TO "anon";
GRANT ALL ON TABLE "public"."newsletter_campaigns" TO "authenticated";
GRANT ALL ON TABLE "public"."newsletter_campaigns" TO "service_role";



GRANT ALL ON TABLE "public"."newsletter_content_cache" TO "anon";
GRANT ALL ON TABLE "public"."newsletter_content_cache" TO "authenticated";
GRANT ALL ON TABLE "public"."newsletter_content_cache" TO "service_role";



GRANT ALL ON TABLE "public"."newsletter_content_rules" TO "anon";
GRANT ALL ON TABLE "public"."newsletter_content_rules" TO "authenticated";
GRANT ALL ON TABLE "public"."newsletter_content_rules" TO "service_role";



GRANT ALL ON TABLE "public"."newsletter_subscriptions" TO "anon";
GRANT ALL ON TABLE "public"."newsletter_subscriptions" TO "authenticated";
GRANT ALL ON TABLE "public"."newsletter_subscriptions" TO "service_role";



GRANT ALL ON TABLE "public"."newsletter_templates" TO "anon";
GRANT ALL ON TABLE "public"."newsletter_templates" TO "authenticated";
GRANT ALL ON TABLE "public"."newsletter_templates" TO "service_role";



GRANT ALL ON TABLE "public"."opportunities" TO "anon";
GRANT ALL ON TABLE "public"."opportunities" TO "authenticated";
GRANT ALL ON TABLE "public"."opportunities" TO "service_role";



GRANT ALL ON TABLE "public"."opportunity_tags" TO "anon";
GRANT ALL ON TABLE "public"."opportunity_tags" TO "authenticated";
GRANT ALL ON TABLE "public"."opportunity_tags" TO "service_role";



GRANT ALL ON TABLE "public"."resource_tags" TO "anon";
GRANT ALL ON TABLE "public"."resource_tags" TO "authenticated";
GRANT ALL ON TABLE "public"."resource_tags" TO "service_role";



GRANT ALL ON TABLE "public"."resources" TO "anon";
GRANT ALL ON TABLE "public"."resources" TO "authenticated";
GRANT ALL ON TABLE "public"."resources" TO "service_role";



GRANT ALL ON TABLE "public"."tags" TO "anon";
GRANT ALL ON TABLE "public"."tags" TO "authenticated";
GRANT ALL ON TABLE "public"."tags" TO "service_role";



GRANT ALL ON TABLE "public"."user_roles" TO "anon";
GRANT ALL ON TABLE "public"."user_roles" TO "authenticated";
GRANT ALL ON TABLE "public"."user_roles" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";






























RESET ALL;
