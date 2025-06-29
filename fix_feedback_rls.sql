-- Fix RLS policies for feedback system
-- This will allow users to submit feedback without RLS errors

-- Fix user_feedback table policies
DROP POLICY IF EXISTS "Users can insert feedback" ON user_feedback;
DROP POLICY IF EXISTS "Users can view own feedback" ON user_feedback;

-- Allow any authenticated user to insert feedback
CREATE POLICY "Allow authenticated users to insert feedback" ON user_feedback
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Allow users to view their own feedback
CREATE POLICY "Users can view own feedback" ON user_feedback
    FOR SELECT USING (auth.uid() = user_id);

-- Fix email_queue table policies
DROP POLICY IF EXISTS "Service role can manage emails" ON email_queue;

-- Allow the trigger function to insert emails (bypass RLS for triggers)
ALTER TABLE email_queue DISABLE ROW LEVEL SECURITY;

-- Or if you want to keep RLS enabled, use this policy instead:
-- CREATE POLICY "Allow trigger inserts" ON email_queue
--     FOR INSERT WITH CHECK (true);

-- Fix admin_notifications table policies  
DROP POLICY IF EXISTS "Service role can manage notifications" ON admin_notifications;

-- Allow the trigger function to insert notifications
ALTER TABLE admin_notifications DISABLE ROW LEVEL SECURITY;

-- Or if you want to keep RLS enabled, use this policy instead:
-- CREATE POLICY "Allow trigger inserts" ON admin_notifications
--     FOR INSERT WITH CHECK (true);