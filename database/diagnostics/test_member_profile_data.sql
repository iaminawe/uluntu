-- Test script to check member profile data
-- Replace the user_id with your actual user ID

-- Check what columns exist in the members table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'members' 
ORDER BY ordinal_position;

-- Check your specific member record
SELECT 
  id,
  name,
  title,
  company,
  location,
  bio,
  image,
  website,
  social,
  user_id,
  status,
  created_at
FROM members 
WHERE user_id = '54fd6d34-5d30-4ad0-9c53-fc24aa0412b8';

-- Check skills for your member
SELECT m.name, ms.skill
FROM members m
LEFT JOIN member_skills ms ON m.id = ms.member_id
WHERE m.user_id = '54fd6d34-5d30-4ad0-9c53-fc24aa0412b8';