-- Fix Row Level Security policies for friendships table
-- This script should be run in the Supabase SQL editor

-- First, check the current table structure
-- SELECT * FROM information_schema.columns WHERE table_name = 'friendships';

-- Drop existing policies for friendships table if they exist
DROP POLICY IF EXISTS "Users can view their own friendships" ON public.friendships;
DROP POLICY IF EXISTS "Users can create friendships" ON public.friendships;
DROP POLICY IF EXISTS "Users can update their own friendships" ON public.friendships;
DROP POLICY IF EXISTS "Users can delete their own friendships" ON public.friendships;

-- Enable RLS on friendships table
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;

-- Allow users to view friendships where they are either user1 or user2
CREATE POLICY "Users can view their own friendships" ON public.friendships
    FOR SELECT USING (
        auth.uid() = user1_id OR auth.uid() = user2_id
    );

-- Allow users to create friendships where they are either user1 or user2
CREATE POLICY "Users can create friendships" ON public.friendships
    FOR INSERT WITH CHECK (
        auth.uid() = user1_id OR auth.uid() = user2_id
    );

-- Allow users to update friendships where they are either user1 or user2
CREATE POLICY "Users can update their own friendships" ON public.friendships
    FOR UPDATE USING (
        auth.uid() = user1_id OR auth.uid() = user2_id
    ) WITH CHECK (
        auth.uid() = user1_id OR auth.uid() = user2_id
    );

-- Allow users to delete friendships where they are either user1 or user2
CREATE POLICY "Users can delete their own friendships" ON public.friendships
    FOR DELETE USING (
        auth.uid() = user1_id OR auth.uid() = user2_id
    );

-- Check if the policies were created successfully
-- SELECT * FROM pg_policies WHERE tablename = 'friendships';

-- Test the policies by trying to select from the table
-- SELECT * FROM public.friendships LIMIT 1;
