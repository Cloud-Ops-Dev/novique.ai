-- Migration 011: Add consultation_in_progress stage
-- Adds a new stage between consultation_requested and consultation_completed
-- to represent multi-meeting consultation processes.

ALTER TYPE customer_stage ADD VALUE 'consultation_in_progress' AFTER 'consultation_requested';
