-- Add contact information and key points columns to events table
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS contact_phone TEXT,
ADD COLUMN IF NOT EXISTS contact_instagram TEXT,
ADD COLUMN IF NOT EXISTS contact_facebook TEXT,
ADD COLUMN IF NOT EXISTS contact_twitter TEXT,
ADD COLUMN IF NOT EXISTS contact_whatsapp TEXT,
ADD COLUMN IF NOT EXISTS key_points TEXT[];