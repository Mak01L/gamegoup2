-- Fix profile visibility - allow users to see other users' profiles
-- Execute this in Supabase SQL Editor

-- Drop existing restrictive policy
DROP POLICY IF EXISTS "Users can view own feedback" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;

-- Create new policy that allows users to view ALL profiles (public profiles)
CREATE POLICY "Allow users to view all profiles" ON profiles
    FOR SELECT USING (true);

-- Keep the insert/update policies for profile owners only
DROP POLICY IF EXISTS "Users can insert feedback" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = user_id);