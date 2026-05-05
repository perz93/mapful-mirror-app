-- ============================================
-- MAPFUL / WAZAA — Full Schema Migration
-- Coller dans Supabase → SQL Editor → Run
-- ============================================

-- 1. ENUM
CREATE TYPE public.marketplace_category AS ENUM (
  'location_espaces',
  'traiteurs',
  'animation_dj',
  'decoration',
  'autre'
);

-- 2. TABLE: profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  notification_email BOOLEAN DEFAULT true,
  notification_events BOOLEAN DEFAULT true,
  notification_friends BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 3. TABLE: events
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  venue TEXT NOT NULL,
  address TEXT,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  capacity INTEGER,
  is_paid BOOLEAN DEFAULT false NOT NULL,
  price NUMERIC,
  image_url TEXT,
  is_published BOOLEAN DEFAULT true NOT NULL,
  key_points TEXT[],
  contact_phone TEXT,
  contact_whatsapp TEXT,
  contact_instagram TEXT,
  contact_facebook TEXT,
  contact_twitter TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 4. TABLE: event_favorites
CREATE TABLE public.event_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 5. TABLE: marketplace_listings
CREATE TABLE public.marketplace_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category public.marketplace_category NOT NULL,
  price NUMERIC,
  price_type TEXT,
  image_url TEXT,
  location TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  is_published BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 6. TABLE: user_friends
CREATE TABLE public.user_friends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  friend_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_friends ENABLE ROW LEVEL SECURITY;

-- PROFILES: users can read all, update own
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- EVENTS: anyone can read published, owners can CRUD
CREATE POLICY "Published events are viewable by everyone" ON public.events FOR SELECT USING (is_published = true);
CREATE POLICY "Users can create events" ON public.events FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own events" ON public.events FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own events" ON public.events FOR DELETE USING (auth.uid() = user_id);

-- EVENT_FAVORITES: users manage own favorites, can read own
CREATE POLICY "Users can view own favorites" ON public.event_favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can add favorites" ON public.event_favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove favorites" ON public.event_favorites FOR DELETE USING (auth.uid() = user_id);

-- MARKETPLACE_LISTINGS: anyone can read published, owners CRUD
CREATE POLICY "Published listings viewable by everyone" ON public.marketplace_listings FOR SELECT USING (is_published = true);
CREATE POLICY "Users can create listings" ON public.marketplace_listings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own listings" ON public.marketplace_listings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own listings" ON public.marketplace_listings FOR DELETE USING (auth.uid() = user_id);

-- USER_FRIENDS: users can see own friendships
CREATE POLICY "Users can view own friends" ON public.user_friends FOR SELECT USING (auth.uid() = user_id OR auth.uid() = friend_id);
CREATE POLICY "Users can send friend requests" ON public.user_friends FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own friend requests" ON public.user_friends FOR UPDATE USING (auth.uid() = user_id OR auth.uid() = friend_id);
CREATE POLICY "Users can delete own friend requests" ON public.user_friends FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- TRIGGER: auto-create profile on signup
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- TRIGGER: auto-update updated_at
-- ============================================
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_marketplace_updated_at
  BEFORE UPDATE ON public.marketplace_listings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_friends_updated_at
  BEFORE UPDATE ON public.user_friends
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================
-- INDEXES for performance
-- ============================================
CREATE INDEX idx_events_category ON public.events(category);
CREATE INDEX idx_events_date ON public.events(date);
CREATE INDEX idx_events_user_id ON public.events(user_id);
CREATE INDEX idx_events_published ON public.events(is_published);
CREATE INDEX idx_events_location ON public.events(latitude, longitude);
CREATE INDEX idx_event_favorites_user ON public.event_favorites(user_id);
CREATE INDEX idx_event_favorites_event ON public.event_favorites(event_id);
CREATE INDEX idx_marketplace_category ON public.marketplace_listings(category);
CREATE INDEX idx_marketplace_user ON public.marketplace_listings(user_id);
CREATE INDEX idx_friends_user ON public.user_friends(user_id);
CREATE INDEX idx_friends_friend ON public.user_friends(friend_id);

-- ============================================
-- STORAGE BUCKET for images
-- ============================================
INSERT INTO storage.buckets (id, name, public) VALUES ('event-images', 'event-images', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('listing-images', 'listing-images', true);

-- Storage policies
CREATE POLICY "Anyone can view event images" ON storage.objects FOR SELECT USING (bucket_id = 'event-images');
CREATE POLICY "Auth users can upload event images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'event-images' AND auth.role() = 'authenticated');
CREATE POLICY "Users can delete own event images" ON storage.objects FOR DELETE USING (bucket_id = 'event-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Anyone can view avatars" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Auth users can upload avatars" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

CREATE POLICY "Anyone can view listing images" ON storage.objects FOR SELECT USING (bucket_id = 'listing-images');
CREATE POLICY "Auth users can upload listing images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'listing-images' AND auth.role() = 'authenticated');
