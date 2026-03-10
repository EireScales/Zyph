-- Mirror AI – Supabase schema
-- Run this in the SQL Editor or via Supabase CLI migrations

-- Enable UUID extension if not already
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ---------------------------------------------------------------------------
-- 1. profiles (extends auth.users)
-- ---------------------------------------------------------------------------
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  display_name TEXT,
  avatar_url TEXT,
  onboarding_complete BOOLEAN NOT NULL DEFAULT FALSE,
  primary_uses JSONB DEFAULT '[]'::jsonb,
  settings JSONB DEFAULT '{}'::jsonb
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can delete own profile"
  ON public.profiles FOR DELETE
  USING (auth.uid() = id);

-- ---------------------------------------------------------------------------
-- 2. observations
-- ---------------------------------------------------------------------------
CREATE TABLE public.observations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  captured_at TIMESTAMPTZ NOT NULL,
  screen_summary TEXT,
  app_name TEXT,
  category TEXT,
  raw_text TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_observations_user_id ON public.observations (user_id);
CREATE INDEX idx_observations_captured_at ON public.observations (captured_at);

ALTER TABLE public.observations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own observations"
  ON public.observations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own observations"
  ON public.observations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own observations"
  ON public.observations FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own observations"
  ON public.observations FOR DELETE
  USING (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- 3. user_profile_insights
-- ---------------------------------------------------------------------------
CREATE TABLE public.user_profile_insights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  insight_type TEXT NOT NULL,
  insight_value TEXT NOT NULL,
  confidence_score DOUBLE PRECISION NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_user_profile_insights_user_id ON public.user_profile_insights (user_id);
CREATE UNIQUE INDEX idx_user_profile_insights_user_type ON public.user_profile_insights (user_id, insight_type);

ALTER TABLE public.user_profile_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own insights"
  ON public.user_profile_insights FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own insights"
  ON public.user_profile_insights FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own insights"
  ON public.user_profile_insights FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own insights"
  ON public.user_profile_insights FOR DELETE
  USING (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- 4. conversations
-- ---------------------------------------------------------------------------
CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  messages JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_conversations_user_id ON public.conversations (user_id);

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own conversations"
  ON public.conversations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own conversations"
  ON public.conversations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own conversations"
  ON public.conversations FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own conversations"
  ON public.conversations FOR DELETE
  USING (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Trigger: auto-create profile on signup (optional but recommended)
-- Remove this block if you use Supabase Dashboard → Authentication → Triggers
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'full_name', ''),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
