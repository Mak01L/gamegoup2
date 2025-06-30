-- Supabase Auth Settings for Persistent Sessions
-- Execute these in Supabase Dashboard > Authentication > Settings

-- IMPORTANT: These settings need to be configured in Supabase Dashboard
-- Go to: Project Settings > Authentication > Settings

-- 1. JWT Settings:
-- JWT expiry: 3600 seconds (1 hour) - can be increased to 86400 (24 hours)
-- Refresh token expiry: 2592000 seconds (30 days) - can be increased to 7776000 (90 days)

-- 2. Security Settings:
-- Enable "Persistent sessions" if available
-- Enable "Auto refresh tokens"

-- 3. Advanced Settings:
-- Session timeout: 86400 seconds (24 hours)
-- Inactivity timeout: 604800 seconds (7 days)

-- Note: These settings are configured through the Supabase Dashboard UI
-- The actual SQL commands are not directly executable as they require admin access

-- Alternative: If you have direct database access, you can check current settings:
SELECT * FROM auth.config;