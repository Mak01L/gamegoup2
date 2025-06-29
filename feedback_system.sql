-- Create user_feedback table for collecting user feedback, bug reports, and feature requests
CREATE TABLE user_feedback (
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

-- Enable RLS
ALTER TABLE user_feedback ENABLE ROW LEVEL SECURITY;

-- Policy: Users can insert their own feedback
CREATE POLICY "Users can insert feedback" ON user_feedback
    FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.uid() IS NOT NULL);

-- Policy: Users can view their own feedback
CREATE POLICY "Users can view own feedback" ON user_feedback
    FOR SELECT USING (auth.uid() = user_id);

-- Policy: Admins can view and update all feedback (you'll need to set up admin roles)
-- For now, we'll allow the app to insert feedback from any authenticated user

-- Create index for better performance
CREATE INDEX idx_user_feedback_user_id ON user_feedback(user_id);
CREATE INDEX idx_user_feedback_type ON user_feedback(type);
CREATE INDEX idx_user_feedback_status ON user_feedback(status);
CREATE INDEX idx_user_feedback_created_at ON user_feedback(created_at DESC);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_user_feedback_updated_at 
    BEFORE UPDATE ON user_feedback 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();