-- Auto-Profile Creation Trigger
-- This will automatically create profiles when users sign up

CREATE OR REPLACE FUNCTION auto_create_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, username, email, avatar_url, created_at)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'username', 
      SPLIT_PART(NEW.email, '@', 1),
      'user' || SUBSTRING(NEW.id::text, 1, 8)
    ),
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'avatar_url',
      '/default-avatar.png'
    ),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to auto-create profiles on user signup
CREATE TRIGGER auto_create_profile_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION auto_create_profile();

-- Create RLS policy to allow users to read their own profiles
CREATE POLICY "Users can read their own profile" ON profiles
  FOR SELECT USING (auth.uid() = user_id);

-- Create RLS policy to allow automatic profile creation
CREATE POLICY "Enable auto profile creation" ON profiles
  FOR INSERT WITH CHECK (true);
