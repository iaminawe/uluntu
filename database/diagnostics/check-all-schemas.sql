-- Check the actual schema of all main tables

-- Companies table columns
SELECT 
    'COMPANIES TABLE' as table_info,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'companies'
ORDER BY ordinal_position;

-- Groups table columns
SELECT 
    'GROUPS TABLE' as table_info,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'groups'
ORDER BY ordinal_position;

-- Events table columns
SELECT 
    'EVENTS TABLE' as table_info,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'events'
ORDER BY ordinal_position;

-- Members table columns
SELECT 
    'MEMBERS TABLE' as table_info,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'members'
ORDER BY ordinal_position;

-- News table columns
SELECT 
    'NEWS TABLE' as table_info,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'news'
ORDER BY ordinal_position;