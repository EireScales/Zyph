-- Add primary_uses for onboarding step 2 (Work, Creative, Learning, Communication)
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS primary_uses JSONB DEFAULT '[]'::jsonb;
