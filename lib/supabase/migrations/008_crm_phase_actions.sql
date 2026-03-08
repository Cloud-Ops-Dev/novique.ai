-- =====================================================
-- 008: CRM Phase Communication Log & Action Items
-- =====================================================
-- Adds phase-based filtering to interactions and
-- a new action items table per CRM phase.
--
-- This migration is additive — no existing data is modified.
-- Run in Supabase SQL Editor.
-- =====================================================

-- 1. Add phase column to customer_interactions
ALTER TABLE customer_interactions
  ADD COLUMN IF NOT EXISTS phase TEXT;

-- Add CHECK constraint for valid phases
ALTER TABLE customer_interactions
  ADD CONSTRAINT chk_interaction_phase
  CHECK (phase IS NULL OR phase IN (
    'consultation', 'proposal', 'agreement',
    'delivery', 'implementation', 'signoff'
  ));

-- Index for phase-filtered queries
CREATE INDEX IF NOT EXISTS idx_interactions_phase
  ON customer_interactions(phase);

-- 2. Create customer_action_items table
CREATE TABLE IF NOT EXISTS customer_action_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  phase TEXT NOT NULL CHECK (phase IN (
    'consultation', 'proposal', 'agreement',
    'delivery', 'implementation', 'signoff'
  )),
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'completed')),
  assigned_to UUID REFERENCES profiles(id),
  source_interaction_id UUID REFERENCES customer_interactions(id) ON DELETE SET NULL,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_action_items_customer
  ON customer_action_items(customer_id);
CREATE INDEX IF NOT EXISTS idx_action_items_phase
  ON customer_action_items(phase);
CREATE INDEX IF NOT EXISTS idx_action_items_status
  ON customer_action_items(status);
CREATE INDEX IF NOT EXISTS idx_action_items_due_date
  ON customer_action_items(due_date);

-- 3. RLS: admin-only (same pattern as existing tables)
ALTER TABLE customer_action_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage action items" ON customer_action_items;

CREATE POLICY "Admins can manage action items"
  ON customer_action_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
