-- =====================================================
-- Cleanup Test Data
-- =====================================================
-- This removes all test customers and resets consultations
--
-- Run this in Supabase SQL Editor
-- =====================================================

-- IMPORTANT: Must clear foreign keys FIRST before deleting customers
-- Step 1: Reset consultation_requests (clear foreign key references)
UPDATE consultation_requests
SET
  status = 'pending',
  converted_to_customer_id = NULL
WHERE status = 'converted';

-- Step 2: Delete all customer interactions
DELETE FROM customer_interactions;

-- Step 3: Delete all test customers (now safe since foreign keys are cleared)
DELETE FROM customers;

-- =====================================================
-- CLEANUP COMPLETE
-- =====================================================
-- You should now have:
-- - Zero customers in the customers table
-- - Zero interactions in customer_interactions table
-- - All consultations back to 'pending' status
-- =====================================================
