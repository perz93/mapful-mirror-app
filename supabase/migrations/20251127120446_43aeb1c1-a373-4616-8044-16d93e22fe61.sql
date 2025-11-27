-- Create storage bucket for event images
INSERT INTO storage.buckets (id, name, public)
VALUES ('event-images', 'event-images', true);

-- Create RLS policies for event images
CREATE POLICY "Users can upload their own event images"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'event-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own event images"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'event-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own event images"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'event-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Event images are publicly accessible"
ON storage.objects
FOR SELECT
USING (bucket_id = 'event-images');