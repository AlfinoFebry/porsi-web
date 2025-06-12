-- Add achievements table
CREATE TABLE IF NOT EXISTS achievements (
  id UUID DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  title TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  PRIMARY KEY (id)
);

-- Add organizations table
CREATE TABLE IF NOT EXISTS organizations (
  id UUID DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  name TEXT NOT NULL,
  year TEXT,
  position TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  PRIMARY KEY (id)
);

-- Add new columns to profiles table
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS hobby TEXT,
  ADD COLUMN IF NOT EXISTS desired_major TEXT;

-- Enable RLS
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- Policies for achievements
CREATE POLICY "Users can view own achievements" ON achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own achievements" ON achievements FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own achievements" ON achievements FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own achievements" ON achievements FOR DELETE USING (auth.uid() = user_id);

-- Policies for organizations
CREATE POLICY "Users can view own organizations" ON organizations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own organizations" ON organizations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own organizations" ON organizations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own organizations" ON organizations FOR DELETE USING (auth.uid() = user_id); 