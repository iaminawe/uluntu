-- Test script to verify member profile updates work correctly

-- 1. First, check the current structure
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'members' 
  AND column_name IN ('company', 'social', 'website', 'image', 'title', 'bio', 'location')
ORDER BY column_name;

-- 2. Check if member_skills table exists and its structure
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'member_skills'
ORDER BY column_name;

-- 3. Test inserting a member with all fields
DO $$
DECLARE
    test_user_id uuid := gen_random_uuid();
    test_member_id uuid;
BEGIN
    -- Insert a test member
    INSERT INTO public.members (
        name, 
        title, 
        company, 
        location, 
        bio, 
        image, 
        website,
        social,
        user_id,
        status
    ) VALUES (
        'Test User',
        'Software Developer',
        'Test Company Inc',
        'Nelson, BC',
        'This is a test bio',
        'https://example.com/avatar.jpg',
        'https://example.com',
        '{"linkedin": "https://linkedin.com/in/testuser", "github": "https://github.com/testuser", "twitter": "https://twitter.com/testuser"}'::jsonb,
        test_user_id,
        'published'
    ) RETURNING id INTO test_member_id;
    
    -- Insert skills for the test member
    INSERT INTO public.member_skills (member_id, skill) VALUES
        (test_member_id, 'JavaScript'),
        (test_member_id, 'TypeScript'),
        (test_member_id, 'React');
    
    -- Display the created member with skills
    RAISE NOTICE 'Test member created successfully!';
    
    -- Show the member data
    PERFORM pg_sleep(0.1); -- Small delay to ensure data is committed
    
    -- Clean up test data
    DELETE FROM public.members WHERE id = test_member_id;
    
    RAISE NOTICE 'Test data cleaned up successfully!';
END $$;

-- 4. Check existing members and their social data
SELECT 
    id,
    name,
    company,
    website,
    social,
    (SELECT COUNT(*) FROM public.member_skills WHERE member_id = members.id) as skill_count
FROM public.members
LIMIT 5;

-- 5. Verify RLS policies on member_skills
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE tablename = 'member_skills';