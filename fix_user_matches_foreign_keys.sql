-- Fix foreign keys for user_matches table
-- This will allow Supabase to properly join with profiles table

-- First, let's check if the foreign keys exist
DO $$
BEGIN
    -- Drop existing constraints if they exist
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
               WHERE constraint_name = 'user_matches_user1_id_fkey') THEN
        ALTER TABLE user_matches DROP CONSTRAINT user_matches_user1_id_fkey;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
               WHERE constraint_name = 'user_matches_user2_id_fkey') THEN
        ALTER TABLE user_matches DROP CONSTRAINT user_matches_user2_id_fkey;
    END IF;
END $$;

-- Create proper foreign key constraints
ALTER TABLE user_matches 
ADD CONSTRAINT user_matches_user1_id_fkey 
FOREIGN KEY (user1_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE user_matches 
ADD CONSTRAINT user_matches_user2_id_fkey 
FOREIGN KEY (user2_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Also create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_matches_user1_id ON user_matches(user1_id);
CREATE INDEX IF NOT EXISTS idx_user_matches_user2_id ON user_matches(user2_id);
CREATE INDEX IF NOT EXISTS idx_user_matches_active ON user_matches(is_active) WHERE is_active = true;

-- Verify the foreign keys were created
SELECT 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name='user_matches';
