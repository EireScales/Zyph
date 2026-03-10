-- Add settings JSONB for capture preferences, data retention, etc.
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}'::jsonb;
