-- SQL Script to create storage bucket for lesson images in Supabase
-- Run this in your Supabase SQL Editor (the same project your server uses)

-- Create the storage bucket for lesson images
-- This bucket will store images uploaded from the lesson builder
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'lesson-images',
  'lesson-images',
  true, -- Make bucket public so images can be accessed directly via public URL
  52428800, -- 50MB file size limit (52428800 bytes = 50MB)
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO UPDATE
SET 
  public = true,
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];

-- Create storage policies for the bucket

-- Policy 1: Allow public read access (anyone can view images via public URL)
CREATE POLICY "Public Access for lesson-images"
ON storage.objects FOR SELECT
USING (bucket_id = 'lesson-images');

-- Policy 2: Allow authenticated users to upload images
-- This works if your lesson builder uses authenticated requests
CREATE POLICY "Authenticated users can upload to lesson-images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'lesson-images' AND auth.role() = 'authenticated');

-- Policy 3: Allow authenticated users to update images
CREATE POLICY "Authenticated users can update lesson-images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'lesson-images' AND auth.role() = 'authenticated')
WITH CHECK (bucket_id = 'lesson-images' AND auth.role() = 'authenticated');

-- Policy 4: Allow authenticated users to delete images
CREATE POLICY "Authenticated users can delete from lesson-images"
ON storage.objects FOR DELETE
USING (bucket_id = 'lesson-images' AND auth.role() = 'authenticated');

-- Alternative: If you want to allow anonymous uploads (for lesson builder without auth)
-- Comment out the authenticated policies above and uncomment these:
/*
-- Allow anonymous uploads
CREATE POLICY "Anyone can upload to lesson-images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'lesson-images');

-- Allow anonymous updates
CREATE POLICY "Anyone can update lesson-images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'lesson-images')
WITH CHECK (bucket_id = 'lesson-images');

-- Allow anonymous deletes
CREATE POLICY "Anyone can delete from lesson-images"
ON storage.objects FOR DELETE
USING (bucket_id = 'lesson-images');
*/

-- Verify the bucket was created
SELECT * FROM storage.buckets WHERE id = 'lesson-images';
