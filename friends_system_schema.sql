-- Friends system tables

-- Friend requests table
CREATE TABLE IF NOT EXISTS friend_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(sender_id, receiver_id)
);

-- Friendships table
CREATE TABLE IF NOT EXISTS friendships (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    friend_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'accepted' CHECK (status IN ('accepted', 'blocked')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, friend_id)
);

-- Private conversations table (for future messaging)
CREATE TABLE IF NOT EXISTS private_conversations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user1_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    user2_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user1_id, user2_id)
);

-- Private messages table (for future messaging)
CREATE TABLE IF NOT EXISTS private_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_id UUID NOT NULL REFERENCES private_conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file')),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (Row Level Security)
ALTER TABLE friend_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE private_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE private_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for friend_requests
CREATE POLICY "Users can view their own friend requests" ON friend_requests
    FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send friend requests" ON friend_requests
    FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update their received requests" ON friend_requests
    FOR UPDATE USING (auth.uid() = receiver_id);

-- RLS Policies for friendships
CREATE POLICY "Users can view their friendships" ON friendships
    FOR SELECT USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "Users can create friendships" ON friendships
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their friendships" ON friendships
    FOR DELETE USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- RLS Policies for private_conversations
CREATE POLICY "Users can view their conversations" ON private_conversations
    FOR SELECT USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can create conversations" ON private_conversations
    FOR INSERT WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);

-- RLS Policies for private_messages
CREATE POLICY "Users can view messages in their conversations" ON private_messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM private_conversations 
            WHERE id = conversation_id 
            AND (user1_id = auth.uid() OR user2_id = auth.uid())
        )
    );

CREATE POLICY "Users can send messages in their conversations" ON private_messages
    FOR INSERT WITH CHECK (
        auth.uid() = sender_id AND
        EXISTS (
            SELECT 1 FROM private_conversations 
            WHERE id = conversation_id 
            AND (user1_id = auth.uid() OR user2_id = auth.uid())
        )
    );

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_friend_requests_receiver ON friend_requests(receiver_id);
CREATE INDEX IF NOT EXISTS idx_friend_requests_sender ON friend_requests(sender_id);
CREATE INDEX IF NOT EXISTS idx_friendships_user ON friendships(user_id);
CREATE INDEX IF NOT EXISTS idx_friendships_friend ON friendships(friend_id);
CREATE INDEX IF NOT EXISTS idx_private_messages_conversation ON private_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_private_messages_created_at ON private_messages(created_at);