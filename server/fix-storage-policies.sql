-- SQL Script to fix storage bucket policies for lesson-images
-- This allows anonymous uploads (for lesson builder without authentication)
-- Run this in your Supabase SQL Editor

-- First, drop existing policies if they exist
DROP POLICY IF EXISTS "Public Access for lesson-images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload to lesson-images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update lesson-images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete from lesson-images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload to lesson-images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update lesson-images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete from lesson-images" ON storage.objects;

-- Create new policies that allow anonymous access for lesson builder

-- Policy 1: Allow public read access (anyone can view images via public URL)
CREATE POLICY "Public Access for lesson-images"
ON storage.objects FOR SELECT
USING (bucket_id = 'lesson-images');

-- Policy 2: Allow anyone (including anonymous) to upload to lesson-images
CREATE POLICY "Anyone can upload to lesson-images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'lesson-images');

-- Policy 3: Allow anyone to update files in lesson-images
CREATE POLICY "Anyone can update lesson-images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'lesson-images')
WITH CHECK (bucket_id = 'lesson-images');

-- Policy 4: Allow anyone to delete from lesson-images
CREATE POLICY "Anyone can delete from lesson-images"
ON storage.objects FOR DELETE
USING (bucket_id = 'lesson-images');

-- Verify policies were created
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'objects' AND policyname LIKE '%lesson-images%';

