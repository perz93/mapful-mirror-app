-- Create event_favorites table for storing user's favorite events
CREATE TABLE public.event_favorites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, event_id)
);

-- Enable RLS
ALTER TABLE public.event_favorites ENABLE ROW LEVEL SECURITY;

-- Create policies for event_favorites
CREATE POLICY "Users can view their own favorites"
ON public.event_favorites
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can add their own favorites"
ON public.event_favorites
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their own favorites"
ON public.event_favorites
FOR DELETE
USING (auth.uid() = user_id);

-- Create user_friends table for storing friendship relationships
CREATE TABLE public.user_friends (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  friend_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, friend_id),
  CHECK (user_id != friend_id)
);

-- Enable RLS
ALTER TABLE public.user_friends ENABLE ROW LEVEL SECURITY;

-- Create policies for user_friends
CREATE POLICY "Users can view their own friendships"
ON public.user_friends
FOR SELECT
USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "Users can create friendship requests"
ON public.user_friends
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update friendships they're part of"
ON public.user_friends
FOR UPDATE
USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "Users can delete their own friendships"
ON public.user_friends
FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for updated_at on user_friends
CREATE TRIGGER update_user_friends_updated_at
BEFORE UPDATE ON public.user_friends
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();