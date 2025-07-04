-- Add sexual orientation field to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS sexual_orientation VARCHAR(30);

-- Add index to improve search performance
CREATE INDEX IF NOT EXISTS idx_profiles_sexual_orientation ON profiles(sexual_orientation);

-- Update user_search_filters table to include sexual orientations
ALTER TABLE user_search_filters 
ADD COLUMN IF NOT EXISTS sexual_orientation_preferences TEXT[];