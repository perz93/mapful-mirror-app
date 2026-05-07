-- Add is_read column to notification_log
ALTER TABLE public.notification_log ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT false;

-- Add title and body columns to store notification content for inbox display
ALTER TABLE public.notification_log ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE public.notification_log ADD COLUMN IF NOT EXISTS body TEXT;
ALTER TABLE public.notification_log ADD COLUMN IF NOT EXISTS url TEXT;
ALTER TABLE public.notification_log ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Allow users to update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
  ON public.notification_log FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Allow anon insert for proximity notifications (logged locally then synced)
CREATE POLICY "Authenticated users can insert own notifications"
  ON public.notification_log FOR INSERT
  WITH CHECK (auth.uid() = user_id);
