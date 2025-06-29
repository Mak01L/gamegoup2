-- Enhanced email notification system for GameGoUp feedback
-- This will send emails to mak01live@protonmail.com when feedback is submitted

-- Create email queue table to store pending emails
CREATE TABLE email_queue (
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

-- Enable RLS for email queue
ALTER TABLE email_queue ENABLE ROW LEVEL SECURITY;

-- Policy: Only service role can manage emails
CREATE POLICY "Service role can manage emails" ON email_queue
    FOR ALL USING (auth.role() = 'service_role');

-- Enhanced function to queue email notifications
CREATE OR REPLACE FUNCTION queue_feedback_email()
RETURNS TRIGGER AS $$
DECLARE
    email_subject TEXT;
    email_body TEXT;
    priority_emoji TEXT;
    type_emoji TEXT;
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
        '• View in Supabase: https://supabase.com/dashboard/project/[your-project]/editor/[table-id]' || E'\n' ||
        '• Admin Panel: https://your-domain.com/admin' || E'\n\n' ||
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
    
    -- Also create admin notification for backup
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
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop old trigger and create new one
DROP TRIGGER IF EXISTS trigger_notify_admin_new_feedback ON user_feedback;
CREATE TRIGGER trigger_queue_feedback_email
    AFTER INSERT ON user_feedback
    FOR EACH ROW
    EXECUTE FUNCTION queue_feedback_email();

-- Create indexes for email queue
CREATE INDEX idx_email_queue_sent ON email_queue(sent);
CREATE INDEX idx_email_queue_created_at ON email_queue(created_at DESC);
CREATE INDEX idx_email_queue_to_email ON email_queue(to_email);

-- Function to get pending emails (for webhook processing)
CREATE OR REPLACE FUNCTION get_pending_emails()
RETURNS TABLE (
    id UUID,
    to_email TEXT,
    subject TEXT,
    body TEXT,
    feedback_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        eq.id,
        eq.to_email,
        eq.subject,
        eq.body,
        eq.feedback_data,
        eq.created_at
    FROM email_queue eq
    WHERE eq.sent = FALSE 
    AND eq.attempts < 3
    ORDER BY eq.created_at ASC
    LIMIT 10;
END;
$$ LANGUAGE plpgsql;

-- Function to mark email as sent
CREATE OR REPLACE FUNCTION mark_email_sent(email_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE email_queue 
    SET sent = TRUE, sent_at = NOW()
    WHERE id = email_id;
END;
$$ LANGUAGE plpgsql;

-- Function to increment email attempts
CREATE OR REPLACE FUNCTION increment_email_attempts(email_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE email_queue 
    SET attempts = attempts + 1
    WHERE id = email_id;
END;
$$ LANGUAGE plpgsql;