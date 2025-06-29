-- Create function to send email notifications when feedback is submitted
-- This uses Supabase Edge Functions (you'll need to set this up)

-- First, let's create a simple notification system using database triggers
-- This will log notifications that you can check

-- Create notifications table for admin alerts
CREATE TABLE admin_notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data JSONB,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for admin notifications
ALTER TABLE admin_notifications ENABLE ROW LEVEL SECURITY;

-- Policy: Only allow service role to access (for now)
CREATE POLICY "Service role can manage notifications" ON admin_notifications
    FOR ALL USING (auth.role() = 'service_role');

-- Function to create admin notification when feedback is submitted
CREATE OR REPLACE FUNCTION notify_admin_new_feedback()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO admin_notifications (type, title, message, data)
    VALUES (
        'new_feedback',
        'New ' || CASE 
            WHEN NEW.type = 'bug' THEN '🐛 Bug Report'
            WHEN NEW.type = 'game' THEN '🎮 Game Request'
            WHEN NEW.type = 'feature' THEN '✨ Feature Request'
            WHEN NEW.type = 'improvement' THEN '🔧 Improvement'
            ELSE '💬 Feedback'
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
            'description', NEW.description
        )
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to notify admin when new feedback is submitted
CREATE TRIGGER trigger_notify_admin_new_feedback
    AFTER INSERT ON user_feedback
    FOR EACH ROW
    EXECUTE FUNCTION notify_admin_new_feedback();

-- Create index for notifications
CREATE INDEX idx_admin_notifications_created_at ON admin_notifications(created_at DESC);
CREATE INDEX idx_admin_notifications_read ON admin_notifications(read);
CREATE INDEX idx_admin_notifications_type ON admin_notifications(type);