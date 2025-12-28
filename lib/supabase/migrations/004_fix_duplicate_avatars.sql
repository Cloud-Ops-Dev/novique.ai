-- =====================================================
-- Fix Duplicate Avatar Images
-- =====================================================
-- Adds avatar_url column to customers table and updates
-- James Chen and Michael Chen to have distinct avatar images

-- Step 1: Add avatar_url column to customers table
ALTER TABLE customers
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Step 2: Update James Chen (Cafe Entrepreneur) - Use blue background avatar
UPDATE customers
SET avatar_url = 'https://ui-avatars.com/api/?name=James+Chen&background=3b82f6&color=fff&size=128'
WHERE name = 'James Chen'
  AND (business_type LIKE '%Cafe%' OR business_type LIKE '%Entrepreneur%');

-- Step 3: Update Michael Chen (Lead AI Engineer) - Use green background avatar
UPDATE customers
SET avatar_url = 'https://ui-avatars.com/api/?name=Michael+Chen&background=10b981&color=fff&size=128'
WHERE name = 'Michael Chen'
  AND (business_type LIKE '%AI%' OR business_type LIKE '%Engineer%');

-- Alternative: If the above doesn't work, update by exact name match
-- Uncomment and run these if needed:
-- UPDATE customers SET avatar_url = 'https://ui-avatars.com/api/?name=James+Chen&background=3b82f6&color=fff&size=128' WHERE name = 'James Chen' LIMIT 1;
-- UPDATE customers SET avatar_url = 'https://ui-avatars.com/api/?name=Michael+Chen&background=10b981&color=fff&size=128' WHERE name = 'Michael Chen' LIMIT 1;

-- Note: You can also update by email if needed:
-- UPDATE customers SET avatar_url = '...' WHERE email = 'james@example.com';
