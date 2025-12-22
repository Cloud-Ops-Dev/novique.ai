-- Supabase Storage RLS Policies for blog-images bucket
-- Run this in Supabase SQL Editor

-- Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload blog images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'blog-images');

-- Allow authenticated users to update their uploaded files
CREATE POLICY "Authenticated users can update blog images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'blog-images');

-- Allow authenticated users to delete files (admin/editor only via app logic)
CREATE POLICY "Authenticated users can delete blog images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'blog-images');

-- Allow public read access to all blog images
CREATE POLICY "Public users can read blog images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'blog-images');
