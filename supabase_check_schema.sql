-- =====================================================
-- CHECK EXISTING TABLE SCHEMAS
-- Run this first to see what tables and columns exist
-- =====================================================

-- Check what tables exist in the public schema
SELECT 
    'Existing tables in public schema:' as info,
    table_name
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- Check columns in user_roles table (if it exists)
SELECT 
    'user_roles table columns:' as info,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'user_roles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check columns in auth.users table
SELECT 
    'auth.users table columns:' as info,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'users' 
AND table_schema = 'auth'
ORDER BY ordinal_position;

-- Check if members table exists and its columns
SELECT 
    'members table columns:' as info,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'members' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check existing functions
SELECT 
    'Existing functions:' as info,
    routine_name,
    routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public'
ORDER BY routine_name;

-- Check existing foreign key constraints
SELECT
    'Foreign key constraints:' as info,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.column_name;