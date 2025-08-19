-- Test script to verify slug functionality
-- This script tests the slug generation functions and verifies the migration worked correctly

-- Test the slug generation function
DO $$
DECLARE
    test_slug TEXT;
BEGIN
    RAISE NOTICE 'Testing slug generation functions...';
    
    -- Test basic slug generation
    SELECT generate_slug_from_text('Hello World! This is a Test') INTO test_slug;
    ASSERT test_slug = 'hello-world-this-is-a-test', 'Basic slug generation failed: ' || test_slug;
    
    -- Test with special characters
    SELECT generate_slug_from_text('Test@#$%^&*()Title!!!') INTO test_slug;
    ASSERT test_slug = 'testtitle', 'Special character removal failed: ' || test_slug;
    
    -- Test with multiple spaces
    SELECT generate_slug_from_text('Multiple    Spaces   Test') INTO test_slug;
    ASSERT test_slug = 'multiple-spaces-test', 'Multiple spaces handling failed: ' || test_slug;
    
    -- Test with leading/trailing hyphens
    SELECT generate_slug_from_text('  -Leading and Trailing-  ') INTO test_slug;
    ASSERT test_slug = 'leading-and-trailing', 'Leading/trailing hyphen removal failed: ' || test_slug;
    
    -- Test empty/null input
    SELECT generate_slug_from_text('') INTO test_slug;
    ASSERT test_slug = '', 'Empty string handling failed: ' || test_slug;
    
    SELECT generate_slug_from_text(NULL) INTO test_slug;
    ASSERT test_slug = '', 'NULL handling failed: ' || test_slug;
    
    RAISE NOTICE 'All slug generation tests passed!';
END $$;

-- Test unique slug generation
DO $$
DECLARE
    unique_slug TEXT;
    table_exists BOOLEAN;
BEGIN
    RAISE NOTICE 'Testing unique slug generation...';
    
    -- Check if we have data to test with
    SELECT EXISTS(SELECT 1 FROM members LIMIT 1) INTO table_exists;
    
    IF table_exists THEN
        -- Test unique slug generation (this should work even if slug already exists)
        SELECT ensure_unique_slug('members', 'slug', 'test-member', NULL) INTO unique_slug;
        RAISE NOTICE 'Generated unique slug: %', unique_slug;
        
        -- Test with existing slug (should append number)
        IF EXISTS(SELECT 1 FROM members WHERE slug = 'test-member') THEN
            SELECT ensure_unique_slug('members', 'slug', 'test-member', NULL) INTO unique_slug;
            ASSERT unique_slug LIKE 'test-member-%', 'Unique slug generation failed: ' || unique_slug;
            RAISE NOTICE 'Unique slug with existing name: %', unique_slug;
        END IF;
    ELSE
        RAISE NOTICE 'No members data to test unique slug generation';
    END IF;
END $$;

-- Verify all tables have slug columns
DO $$
DECLARE
    missing_columns TEXT[] := ARRAY[]::TEXT[];
BEGIN
    RAISE NOTICE 'Verifying slug columns exist in all tables...';
    
    -- Check members table
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'members' AND column_name = 'slug'
    ) THEN
        missing_columns := array_append(missing_columns, 'members.slug');
    END IF;
    
    -- Check events table
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'events' AND column_name = 'slug'
    ) THEN
        missing_columns := array_append(missing_columns, 'events.slug');
    END IF;
    
    -- Check opportunities table
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'opportunities' AND column_name = 'slug'
    ) THEN
        missing_columns := array_append(missing_columns, 'opportunities.slug');
    END IF;
    
    -- Check groups table
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'groups' AND column_name = 'slug'
    ) THEN
        missing_columns := array_append(missing_columns, 'groups.slug');
    END IF;
    
    -- Check news table
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'news' AND column_name = 'slug'
    ) THEN
        missing_columns := array_append(missing_columns, 'news.slug');
    END IF;
    
    IF array_length(missing_columns, 1) > 0 THEN
        RAISE EXCEPTION 'Missing slug columns: %', array_to_string(missing_columns, ', ');
    ELSE
        RAISE NOTICE 'All required slug columns exist!';
    END IF;
END $$;

-- Verify indexes exist
DO $$
DECLARE
    missing_indexes TEXT[] := ARRAY[]::TEXT[];
BEGIN
    RAISE NOTICE 'Verifying slug indexes exist...';
    
    -- Check for slug indexes
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'members' AND indexname = 'idx_members_slug'
    ) THEN
        missing_indexes := array_append(missing_indexes, 'idx_members_slug');
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'events' AND indexname = 'idx_events_slug'
    ) THEN
        missing_indexes := array_append(missing_indexes, 'idx_events_slug');
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'opportunities' AND indexname = 'idx_opportunities_slug'
    ) THEN
        missing_indexes := array_append(missing_indexes, 'idx_opportunities_slug');
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'groups' AND indexname = 'idx_groups_slug'
    ) THEN
        missing_indexes := array_append(missing_indexes, 'idx_groups_slug');
    END IF;
    
    IF array_length(missing_indexes, 1) > 0 THEN
        RAISE WARNING 'Missing slug indexes: %', array_to_string(missing_indexes, ', ');
    ELSE
        RAISE NOTICE 'All slug indexes exist!';
    END IF;
END $$;

-- Test triggers exist
DO $$
DECLARE
    missing_triggers TEXT[] := ARRAY[]::TEXT[];
BEGIN
    RAISE NOTICE 'Verifying slug triggers exist...';
    
    -- Check for triggers
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE trigger_name = 'auto_generate_members_slug' AND event_object_table = 'members'
    ) THEN
        missing_triggers := array_append(missing_triggers, 'auto_generate_members_slug');
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE trigger_name = 'auto_generate_events_slug' AND event_object_table = 'events'
    ) THEN
        missing_triggers := array_append(missing_triggers, 'auto_generate_events_slug');
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE trigger_name = 'auto_generate_opportunities_slug' AND event_object_table = 'opportunities'
    ) THEN
        missing_triggers := array_append(missing_triggers, 'auto_generate_opportunities_slug');
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE trigger_name = 'auto_generate_groups_slug' AND event_object_table = 'groups'
    ) THEN
        missing_triggers := array_append(missing_triggers, 'auto_generate_groups_slug');
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE trigger_name = 'auto_generate_news_slug' AND event_object_table = 'news'
    ) THEN
        missing_triggers := array_append(missing_triggers, 'auto_generate_news_slug');
    END IF;
    
    IF array_length(missing_triggers, 1) > 0 THEN
        RAISE WARNING 'Missing slug triggers: %', array_to_string(missing_triggers, ', ');
    ELSE
        RAISE NOTICE 'All slug triggers exist!';
    END IF;
END $$;

-- Check for duplicate slugs
DO $$
DECLARE
    dup_record RECORD;
    has_duplicates BOOLEAN := FALSE;
BEGIN
    RAISE NOTICE 'Checking for duplicate slugs...';
    
    FOR dup_record IN SELECT * FROM check_duplicate_slugs() LOOP
        RAISE WARNING 'Duplicate slug found in % table: % (% occurrences)', 
                     dup_record.table_name, dup_record.slug, dup_record.count;
        has_duplicates := TRUE;
    END LOOP;
    
    IF NOT has_duplicates THEN
        RAISE NOTICE 'No duplicate slugs found!';
    END IF;
END $$;

-- Generate summary report
DO $$
DECLARE
    members_total INTEGER := 0;
    members_with_slugs INTEGER := 0;
    events_total INTEGER := 0;
    events_with_slugs INTEGER := 0;
    opportunities_total INTEGER := 0;
    opportunities_with_slugs INTEGER := 0;
    groups_total INTEGER := 0;
    groups_with_slugs INTEGER := 0;
    news_total INTEGER := 0;
    news_with_slugs INTEGER := 0;
BEGIN
    -- Get counts for each table
    SELECT COUNT(*) INTO members_total FROM members;
    SELECT COUNT(*) INTO members_with_slugs FROM members WHERE slug IS NOT NULL AND slug != '';
    
    SELECT COUNT(*) INTO events_total FROM events;
    SELECT COUNT(*) INTO events_with_slugs FROM events WHERE slug IS NOT NULL AND slug != '';
    
    SELECT COUNT(*) INTO opportunities_total FROM opportunities;
    SELECT COUNT(*) INTO opportunities_with_slugs FROM opportunities WHERE slug IS NOT NULL AND slug != '';
    
    SELECT COUNT(*) INTO groups_total FROM groups;
    SELECT COUNT(*) INTO groups_with_slugs FROM groups WHERE slug IS NOT NULL AND slug != '';
    
    SELECT COUNT(*) INTO news_total FROM news;
    SELECT COUNT(*) INTO news_with_slugs FROM news WHERE slug IS NOT NULL AND slug != '';
    
    RAISE NOTICE '================================================';
    RAISE NOTICE 'SLUG MIGRATION VERIFICATION REPORT';
    RAISE NOTICE '================================================';
    RAISE NOTICE 'Members: % of % have slugs (%.1f%%)', 
                 members_with_slugs, members_total, 
                 CASE WHEN members_total > 0 THEN (members_with_slugs::FLOAT / members_total * 100) ELSE 0 END;
    RAISE NOTICE 'Events: % of % have slugs (%.1f%%)', 
                 events_with_slugs, events_total,
                 CASE WHEN events_total > 0 THEN (events_with_slugs::FLOAT / events_total * 100) ELSE 0 END;
    RAISE NOTICE 'Opportunities: % of % have slugs (%.1f%%)', 
                 opportunities_with_slugs, opportunities_total,
                 CASE WHEN opportunities_total > 0 THEN (opportunities_with_slugs::FLOAT / opportunities_total * 100) ELSE 0 END;
    RAISE NOTICE 'Groups: % of % have slugs (%.1f%%)', 
                 groups_with_slugs, groups_total,
                 CASE WHEN groups_total > 0 THEN (groups_with_slugs::FLOAT / groups_total * 100) ELSE 0 END;
    RAISE NOTICE 'News: % of % have slugs (%.1f%%)', 
                 news_with_slugs, news_total,
                 CASE WHEN news_total > 0 THEN (news_with_slugs::FLOAT / news_total * 100) ELSE 0 END;
    RAISE NOTICE '================================================';
    
    -- Check if all tables have 100% slug coverage
    IF members_total = members_with_slugs AND 
       events_total = events_with_slugs AND 
       opportunities_total = opportunities_with_slugs AND 
       groups_total = groups_with_slugs AND 
       news_total = news_with_slugs THEN
        RAISE NOTICE 'SUCCESS: All content records have been assigned slugs!';
    ELSE
        RAISE NOTICE 'WARNING: Some records are missing slugs - check the migration';
    END IF;
    
    RAISE NOTICE '================================================';
END $$;