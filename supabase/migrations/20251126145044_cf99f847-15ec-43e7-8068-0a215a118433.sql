-- Add notification preferences to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS notification_email boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS notification_events boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS notification_friends boolean DEFAULT true;