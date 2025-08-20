-- Check the actual structure of menu_items table
-- This will show us what columns exist

-- Show all columns in the menu_items table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'menu_items'
ORDER BY ordinal_position;

-- Show a sample of the data
SELECT * FROM public.menu_items LIMIT 5;

-- Check if there are any enum types that might be related
SELECT 
    t.typname as enum_name,
    array_agg(e.enumlabel ORDER BY e.enumsortorder) as enum_values
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
WHERE t.typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
GROUP BY t.typname;

-- Check constraints on the table
SELECT 
    con.conname as constraint_name,
    con.contype as constraint_type,
    pg_get_constraintdef(con.oid) as definition
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
WHERE rel.relname = 'menu_items'
AND rel.relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');