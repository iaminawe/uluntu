-- =====================================================
-- SEED FILE VALIDATION SCRIPT
-- Tests the structure and relationships of seed data
-- =====================================================

-- Test basic table existence and constraints
\echo 'Testing seed data validation...'

-- Check if all required tables exist
SELECT 
    table_name,
    CASE 
        WHEN table_name IN (
            'members', 'companies', 'company_members', 'member_skills',
            'events', 'event_registrations', 'groups', 'group_members',
            'marketplace_listings', 'news', 'resources', 'opportunities'
        ) THEN 'EXISTS'
        ELSE 'MISSING'
    END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_name IN (
        'members', 'companies', 'company_members', 'member_skills',
        'events', 'event_registrations', 'groups', 'group_members',
        'marketplace_listings', 'news', 'resources', 'opportunities'
    )
ORDER BY table_name;

-- Validate seed data counts
\echo 'Checking seed data counts...'

SELECT 'members' as table_name, COUNT(*) as record_count FROM members
UNION ALL
SELECT 'companies' as table_name, COUNT(*) as record_count FROM companies
UNION ALL
SELECT 'member_skills' as table_name, COUNT(*) as record_count FROM member_skills
UNION ALL
SELECT 'company_members' as table_name, COUNT(*) as record_count FROM company_members
UNION ALL
SELECT 'events' as table_name, COUNT(*) as record_count FROM events
UNION ALL
SELECT 'groups' as table_name, COUNT(*) as record_count FROM groups
UNION ALL
SELECT 'group_members' as table_name, COUNT(*) as record_count FROM group_members
UNION ALL
SELECT 'marketplace_listings' as table_name, COUNT(*) as record_count FROM marketplace_listings
UNION ALL
SELECT 'news' as table_name, COUNT(*) as record_count FROM news
UNION ALL
SELECT 'resources' as table_name, COUNT(*) as record_count FROM resources
UNION ALL
SELECT 'opportunities' as table_name, COUNT(*) as record_count FROM opportunities
ORDER BY table_name;

-- Test foreign key relationships
\echo 'Testing foreign key relationships...'

-- Check company_members relationships
SELECT 
    'company_members' as table_name,
    COUNT(*) as total_records,
    COUNT(DISTINCT company_id) as unique_companies,
    COUNT(DISTINCT member_id) as unique_members
FROM company_members;

-- Check member_skills relationships
SELECT 
    'member_skills' as table_name,
    COUNT(*) as total_records,
    COUNT(DISTINCT member_id) as unique_members,
    COUNT(DISTINCT skill) as unique_skills
FROM member_skills;

-- Check group_members relationships
SELECT 
    'group_members' as table_name,
    COUNT(*) as total_records,
    COUNT(DISTINCT group_id) as unique_groups,
    COUNT(DISTINCT member_id) as unique_members
FROM group_members;

-- Test data quality
\echo 'Testing data quality...'

-- Check for orphaned records
SELECT 'Orphaned company_members' as issue, COUNT(*) as count
FROM company_members cm
LEFT JOIN companies c ON cm.company_id = c.id
LEFT JOIN members m ON cm.member_id = m.id
WHERE c.id IS NULL OR m.id IS NULL

UNION ALL

SELECT 'Orphaned member_skills' as issue, COUNT(*) as count
FROM member_skills ms
LEFT JOIN members m ON ms.member_id = m.id
WHERE m.id IS NULL

UNION ALL

SELECT 'Orphaned group_members' as issue, COUNT(*) as count
FROM group_members gm
LEFT JOIN groups g ON gm.group_id = g.id
LEFT JOIN members m ON gm.member_id = m.id
WHERE g.id IS NULL OR m.id IS NULL;

-- Check for required fields
\echo 'Checking required fields...'

SELECT 'Members without names' as issue, COUNT(*) as count
FROM members WHERE name IS NULL OR name = ''

UNION ALL

SELECT 'Members without status' as issue, COUNT(*) as count
FROM members WHERE status IS NULL

UNION ALL

SELECT 'Companies without names' as issue, COUNT(*) as count
FROM companies WHERE name IS NULL OR name = ''

UNION ALL

SELECT 'Events without titles' as issue, COUNT(*) as count
FROM events WHERE title IS NULL OR title = '';

-- Check UUID format validity
\echo 'Checking UUID formats...'

SELECT 'Invalid member UUIDs' as issue, COUNT(*) as count
FROM members WHERE id::text !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'

UNION ALL

SELECT 'Invalid company UUIDs' as issue, COUNT(*) as count
FROM companies WHERE id::text !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';

\echo 'Validation complete!'