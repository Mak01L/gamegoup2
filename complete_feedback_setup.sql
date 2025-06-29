-- COMPLETE FEEDBACK SYSTEM SETUP FOR GAMEGROUP
-- Execute this entire SQL in Supabase SQL Editor

-- Step 1: Create user_feedback table (main feedback table)
CREATE TABLE IF NOT EXISTS user_feedback (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    user_email TEXT,
    type TEXT NOT NULL CHECK (type IN ('bug', 'game', 'feature', 'improvement', 'other')),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: Create admin_notifications table
CREATE TABLE IF NOT EXISTS admin_notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data JSONB,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 3: Create email_queue table
CREATE TABLE IF NOT EXISTS email_queue (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    to_email TEXT NOT NULL,
    subject TEXT NOT NULL,
    body TEXT NOT NULL,
    feedback_data JSONB,
    sent BOOLEAN DEFAULT FALSE,
    attempts INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sent_at TIMESTAMP WITH TIME ZONE
);

-- Step 4: Configure RLS policies
ALTER TABLE user_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE email_queue DISABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated users to insert feedback
DROP POLICY IF EXISTS "Users can insert feedback" ON user_feedback;
CREATE POLICY "Users can insert feedback" ON user_feedback
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Policy: Users can view their own feedback
DROP POLICY IF EXISTS "Users can view own feedback" ON user_feedback;
CREATE POLICY "Users can view own feedback" ON user_feedback
    FOR SELECT USING (auth.uid() = user_id);

-- Step 5: Create comprehensive feedback handler function
CREATE OR REPLACE FUNCTION handle_new_feedback()
RETURNS TRIGGER AS $$
DECLARE
    email_subject TEXT;
    email_body TEXT;
    type_emoji TEXT;
    priority_emoji TEXT;
BEGIN
    -- Set emojis based on type and priority
    type_emoji := CASE 
        WHEN NEW.type = 'bug' THEN '🐛'
        WHEN NEW.type = 'game' THEN '🎮'
        WHEN NEW.type = 'feature' THEN '✨'
        WHEN NEW.type = 'improvement' THEN '🔧'
        ELSE '💬'
    END;
    
    priority_emoji := CASE 
        WHEN NEW.priority = 'critical' THEN '🚨'
        WHEN NEW.priority = 'high' THEN '⚠️'
        WHEN NEW.priority = 'medium' THEN '📋'
        ELSE '📝'
    END;
    
    -- Create admin notification
    INSERT INTO admin_notifications (type, title, message, data)
    VALUES (
        'new_feedback',
        'New ' || type_emoji || ' ' || 
        CASE 
            WHEN NEW.type = 'bug' THEN 'Bug Report'
            WHEN NEW.type = 'game' THEN 'Game Request'
            WHEN NEW.type = 'feature' THEN 'Feature Request'
            WHEN NEW.type = 'improvement' THEN 'Improvement'
            ELSE 'Feedback'
        END || ': ' || NEW.title,
        'Priority: ' || UPPER(NEW.priority) || E'\n' ||
        'User: ' || COALESCE(NEW.user_email, 'Anonymous') || E'\n' ||
        'Description: ' || LEFT(NEW.description, 200) || 
        CASE WHEN LENGTH(NEW.description) > 200 THEN '...' ELSE '' END,
        jsonb_build_object(
            'feedback_id', NEW.id,
            'type', NEW.type,
            'priority', NEW.priority,
            'user_email', NEW.user_email,
            'title', NEW.title,
            'description', NEW.description,
            'admin_email', 'mak01live@protonmail.com'
        )
    );
    
    -- Create email subject
    email_subject := '[GameGoUp] ' || type_emoji || ' ' || 
        CASE 
            WHEN NEW.type = 'bug' THEN 'Bug Report'
            WHEN NEW.type = 'game' THEN 'Game Request'
            WHEN NEW.type = 'feature' THEN 'Feature Request'
            WHEN NEW.type = 'improvement' THEN 'Improvement'
            ELSE 'Feedback'
        END || ' - ' || NEW.title;
    
    -- Create email body
    email_body := 'New feedback received on GameGoUp!' || E'\n\n' ||
        '📋 DETAILS:' || E'\n' ||
        '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' || E'\n' ||
        '🏷️  Type: ' || type_emoji || ' ' || UPPER(NEW.type) || E'\n' ||
        '⚡ Priority: ' || priority_emoji || ' ' || UPPER(NEW.priority) || E'\n' ||
        '👤 User: ' || COALESCE(NEW.user_email, 'Anonymous') || E'\n' ||
        '📅 Date: ' || TO_CHAR(NEW.created_at, 'YYYY-MM-DD HH24:MI:SS UTC') || E'\n' ||
        '🆔 ID: ' || NEW.id || E'\n\n' ||
        '📝 TITLE:' || E'\n' ||
        NEW.title || E'\n\n' ||
        '📄 DESCRIPTION:' || E'\n' ||
        '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' || E'\n' ||
        NEW.description || E'\n\n' ||
        '🔗 QUICK ACTIONS:' || E'\n' ||
        '• View in Supabase Dashboard' || E'\n' ||
        '• Check admin_notifications table' || E'\n\n' ||
        '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' || E'\n' ||
        'GameGoUp Feedback System 🎮';
    
    -- Queue the email
    INSERT INTO email_queue (to_email, subject, body, feedback_data)
    VALUES (
        'mak01live@protonmail.com',
        email_subject,
        email_body,
        jsonb_build_object(
            'feedback_id', NEW.id,
            'type', NEW.type,
            'priority', NEW.priority,
            'user_email', NEW.user_email,
            'title', NEW.title,
            'description', NEW.description,
            'created_at', NEW.created_at
        )
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 6: Create trigger
DROP TRIGGER IF EXISTS trigger_handle_new_feedback ON user_feedback;
CREATE TRIGGER trigger_handle_new_feedback
    AFTER INSERT ON user_feedback
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_feedback();

-- Step 7: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_feedback_user_id ON user_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_user_feedback_type ON user_feedback(type);
CREATE INDEX IF NOT EXISTS idx_user_feedback_status ON user_feedback(status);
CREATE INDEX IF NOT EXISTS idx_user_feedback_created_at ON user_feedback(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_created_at ON admin_notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_read ON admin_notifications(read);
CREATE INDEX IF NOT EXISTS idx_email_queue_sent ON email_queue(sent);
CREATE INDEX IF NOT EXISTS idx_email_queue_created_at ON email_queue(created_at DESC);

-- Step 8: Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Step 9: Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_user_feedback_updated_at ON user_feedback;
CREATE TRIGGER update_user_feedback_updated_at 
    BEFORE UPDATE ON user_feedback 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();