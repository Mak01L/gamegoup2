-- Debug SQL to check profiles and users
-- Execute this in Supabase SQL Editor to see what's happening

-- 1. Check all profiles that exist
SELECT 
    user_id,
    username,
    email,
    avatar_url,
    bio,
    country,
    created_at
FROM profiles 
ORDER BY created_at DESC;

-- 2. Check users in rooms without profiles
SELECT DISTINCT
    ru.user_id,
    ru.room_id,
    p.username,
    p.email
FROM room_users ru
LEFT JOIN profiles p ON ru.user_id = p.user_id
WHERE p.user_id IS NULL;

-- 3. Check users in rooms WITH profiles
SELECT DISTINCT
    ru.user_id,
    ru.room_id,
    p.username,
    p.email,
    p.bio,
    p.country
FROM room_users ru
INNER JOIN profiles p ON ru.user_id = p.user_id
ORDER BY p.username;

-- 4. Count profiles vs room users
SELECT 
    'Total room users' as type,
    COUNT(DISTINCT user_id) as count
FROM room_users
UNION ALL
SELECT 
    'Users with profiles' as type,
    COUNT(*) as count
FROM profiles
WHERE username IS NOT NULL AND username != '';

-- 5. Check specific user profile (replace with actual user_id)
-- SELECT * FROM profiles WHERE user_id = 'your-user-id-here';