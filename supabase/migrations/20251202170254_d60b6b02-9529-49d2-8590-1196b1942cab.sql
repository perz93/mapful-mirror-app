-- Create enum for marketplace categories
CREATE TYPE public.marketplace_category AS ENUM (
  'location_espaces',
  'traiteurs',
  'animation_dj',
  'decoration',
  'autre'
);

-- Create marketplace listings table
CREATE TABLE public.marketplace_listings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category marketplace_category NOT NULL,
  price NUMERIC,
  price_type TEXT DEFAULT 'negotiable', -- 'fixed', 'hourly', 'daily', 'negotiable'
  image_url TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  location TEXT,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.marketplace_listings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view published listings"
ON public.marketplace_listings
FOR SELECT
USING (is_published = true);

CREATE POLICY "Users can view their own listings"
ON public.marketplace_listings
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create listings"
ON public.marketplace_listings
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own listings"
ON public.marketplace_listings
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own listings"
ON public.marketplace_listings
FOR DELETE
USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_marketplace_listings_updated_at
BEFORE UPDATE ON public.marketplace_listings
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();