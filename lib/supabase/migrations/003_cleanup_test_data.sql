-- =====================================================
-- Cleanup Test Data
-- =====================================================
-- This removes all test customers and resets consultations
--
-- Run this in Supabase SQL Editor
-- =====================================================

-- Delete all customer interactions (will cascade delete is not enabled, so delete manually first)
DELETE FROM customer_interactions;

-- Delete all test customers
DELETE FROM customers;

-- Reset consultation_requests (clear converted status and links)
UPDATE consultation_requests
SET
  status = 'pending',
  converted_to_customer_id = NULL
WHERE status = 'converted';

-- =====================================================
-- CLEANUP COMPLETE
-- =====================================================
-- You should now have:
-- - Zero customers in the customers table
-- - Zero interactions in customer_interactions table
-- - All consultations back to 'pending' status
-- =====================================================
