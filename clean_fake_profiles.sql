-- Clean fake profiles and encourage real profile creation
-- Execute this in Supabase SQL Editor

-- Delete profiles that are clearly fake/auto-generated
DELETE FROM profiles 
WHERE username LIKE 'User_%' 
   OR username = 'User'
   OR (bio IS NULL AND birthdate IS NULL AND country IS NULL AND game_tags IS NULL);

-- Update any remaining generic usernames to encourage profile completion
UPDATE profiles 
SET username = CONCAT('User_', SUBSTRING(user_id::text, 1, 8))
WHERE username = 'User' OR username IS NULL;

-- Optional: Add a notification to encourage profile completion
-- You can check this table to see who needs to complete their profile
CREATE TABLE IF NOT EXISTS profile_completion_reminders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    reminder_sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert reminders for users without complete profiles
INSERT INTO profile_completion_reminders (user_id)
SELECT DISTINCT ru.user_id
FROM room_users ru
LEFT JOIN profiles p ON ru.user_id = p.user_id
WHERE p.user_id IS NULL 
   OR p.username IS NULL 
   OR p.username LIKE 'User_%'
ON CONFLICT (user_id) DO NOTHING;