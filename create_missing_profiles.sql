-- Verify and create missing profiles
-- This script should be executed in Supabase SQL Editor

-- First, verify which users have profiles
SELECT 
  au.id as user_id,
  au.email,
  p.username,
  p.avatar_url,
  CASE WHEN p.user_id IS NULL THEN 'NO PROFILE' ELSE 'HAS PROFILE' END as profile_status
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.user_id
ORDER BY au.created_at DESC
LIMIT 10;

-- Create profiles for users who don't have them
INSERT INTO public.profiles (user_id, username, email, avatar_url, created_at)
SELECT 
  au.id,
  COALESCE(
    SPLIT_PART(au.email, '@', 1),  -- Use email prefix as username
    'user' || SUBSTRING(au.id::text, 1, 8)  -- Fallback to user + ID prefix
  ) as username,
  au.email,
  '/default-avatar.png' as avatar_url,
  NOW() as created_at
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.user_id
WHERE p.user_id IS NULL
  AND au.email IS NOT NULL;

-- Verify the result
SELECT COUNT(*) as total_profiles FROM public.profiles;
SELECT COUNT(*) as total_users FROM auth.users;
