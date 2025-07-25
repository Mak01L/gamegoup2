-- Create likes_dislikes table for the matching system
-- This replaces the direct friend request system with a swipe-like experience

-- Drop existing table if it exists
DROP TABLE IF EXISTS likes_dislikes;

-- Create the likes_dislikes table
CREATE TABLE likes_dislikes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    target_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    action TEXT NOT NULL CHECK (action IN ('like', 'dislike')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one user can only have one action per target user
    UNIQUE(user_id, target_user_id)
);

-- Create indexes for performance
CREATE INDEX idx_likes_dislikes_user_id ON likes_dislikes(user_id);
CREATE INDEX idx_likes_dislikes_target_user_id ON likes_dislikes(target_user_id);
CREATE INDEX idx_likes_dislikes_action ON likes_dislikes(action);

-- Enable RLS
ALTER TABLE likes_dislikes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for likes_dislikes
-- Users can view likes/dislikes they sent or received
CREATE POLICY "Users can view their own likes/dislikes" ON likes_dislikes
    FOR SELECT USING (user_id = auth.uid() OR target_user_id = auth.uid());

-- Users can insert their own likes/dislikes
CREATE POLICY "Users can insert their own likes/dislikes" ON likes_dislikes
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Users can update their own likes/dislikes (to change like to dislike or vice versa)
CREATE POLICY "Users can update their own likes/dislikes" ON likes_dislikes
    FOR UPDATE USING (user_id = auth.uid());

-- Users can delete their own likes/dislikes
CREATE POLICY "Users can delete their own likes/dislikes" ON likes_dislikes
    FOR DELETE USING (user_id = auth.uid());

-- Create a view to easily find matches (mutual likes)
CREATE OR REPLACE VIEW matches_view AS
SELECT DISTINCT
    CASE 
        WHEN l1.user_id < l2.user_id THEN l1.user_id 
        ELSE l2.user_id 
    END as user1_id,
    CASE 
        WHEN l1.user_id < l2.user_id THEN l2.user_id 
        ELSE l1.user_id 
    END as user2_id,
    GREATEST(l1.created_at, l2.created_at) as matched_at
FROM likes_dislikes l1
JOIN likes_dislikes l2 ON (
    l1.user_id = l2.target_user_id 
    AND l1.target_user_id = l2.user_id
    AND l1.action = 'like' 
    AND l2.action = 'like'
)
WHERE l1.user_id != l2.user_id;

-- Grant permissions
GRANT ALL ON likes_dislikes TO authenticated;
GRANT SELECT ON matches_view TO authenticated;

-- Create user_matches table for the messaging system
-- This will store confirmed matches to be displayed in the matches tab
CREATE TABLE user_matches (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user1_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    user2_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    matched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    chat_started BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Ensure one match per pair of users
    UNIQUE(user1_id, user2_id)
);

-- Create indexes for performance
CREATE INDEX idx_user_matches_user1_id ON user_matches(user1_id);
CREATE INDEX idx_user_matches_user2_id ON user_matches(user2_id);
CREATE INDEX idx_user_matches_is_active ON user_matches(is_active);

-- Enable RLS
ALTER TABLE user_matches ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_matches
-- Users can view matches they're part of
CREATE POLICY "Users can view their own matches" ON user_matches
    FOR SELECT USING (user1_id = auth.uid() OR user2_id = auth.uid());

-- Users can insert matches (through the application logic)
CREATE POLICY "Users can insert matches" ON user_matches
    FOR INSERT WITH CHECK (user1_id = auth.uid() OR user2_id = auth.uid());

-- Users can update matches they're part of (e.g., mark chat as started)
CREATE POLICY "Users can update their matches" ON user_matches
    FOR UPDATE USING (user1_id = auth.uid() OR user2_id = auth.uid());

-- Grant permissions
GRANT ALL ON user_matches TO authenticated;