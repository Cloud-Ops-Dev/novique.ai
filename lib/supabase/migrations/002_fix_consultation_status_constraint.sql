-- =====================================================
-- Fix consultation_requests status check constraint
-- =====================================================
-- This migration updates the status column constraint to allow 'converted'
--
-- Run this in Supabase SQL Editor
-- =====================================================

-- Drop the existing check constraint
ALTER TABLE consultation_requests
  DROP CONSTRAINT IF EXISTS consultation_requests_status_check;

-- Add the updated check constraint with all valid statuses
ALTER TABLE consultation_requests
  ADD CONSTRAINT consultation_requests_status_check
  CHECK (status IN ('pending', 'contacted', 'completed', 'converted', 'cancelled'));

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
