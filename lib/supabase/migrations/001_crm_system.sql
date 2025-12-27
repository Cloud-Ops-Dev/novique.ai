-- =====================================================
-- Novique.AI CRM System - Database Migration
-- =====================================================
-- This migration creates the complete customer tracking system
-- including automatic stage progression and interaction logging.
--
-- Run this in Supabase SQL Editor
-- =====================================================

-- =====================================================
-- 1. CREATE ENUMS
-- =====================================================

-- Customer lifecycle stages
CREATE TYPE customer_stage AS ENUM (
  'consultation_requested',
  'consultation_completed',
  'proposal_development',
  'proposal_sent',
  'negotiation',
  'project_active',
  'implementation',
  'delivered',
  'signed_off',
  'closed_won',
  'closed_lost'
);

-- Meeting types
CREATE TYPE meeting_type AS ENUM (
  'virtual',
  'in_person'
);

-- Project status indicators
CREATE TYPE project_status AS ENUM (
  'on_track',
  'at_risk',
  'delayed',
  'blocked',
  'completed'
);

-- Payment status
CREATE TYPE payment_status AS ENUM (
  'not_applicable',
  'pending',
  'partial',
  'paid',
  'overdue'
);

-- Interaction types for communication log
CREATE TYPE interaction_type AS ENUM (
  'consultation_request',
  'meeting',
  'email',
  'call',
  'note',
  'proposal_sent',
  'contract_signed',
  'payment_received',
  'stage_change'
);

-- =====================================================
-- 2. UPDATE CONSULTATION_REQUESTS TABLE
-- =====================================================

-- Add new columns to existing consultation_requests table
ALTER TABLE consultation_requests
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES profiles(id),
  ADD COLUMN IF NOT EXISTS business_type TEXT,
  ADD COLUMN IF NOT EXISTS business_size TEXT,
  ADD COLUMN IF NOT EXISTS preferred_date DATE,
  ADD COLUMN IF NOT EXISTS preferred_time TEXT,
  ADD COLUMN IF NOT EXISTS meeting_type meeting_type,
  ADD COLUMN IF NOT EXISTS challenges TEXT,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Note: converted_to_customer_id will be added after customers table is created

-- =====================================================
-- 3. CREATE CUSTOMERS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS customers (
  -- Identity
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consultation_request_id UUID REFERENCES consultation_requests(id),

  -- Basic Info (from consultation form)
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  business_type TEXT,
  business_size TEXT,
  initial_challenges TEXT,

  -- Stage Management (automatic progression)
  stage customer_stage DEFAULT 'proposal_development',
  project_status project_status DEFAULT 'on_track',

  -- Consultation Phase
  consultation_occurred_date DATE,
  consultation_notes TEXT,

  -- Proposal Phase
  investigation_notes TEXT,
  proposed_solutions TEXT[], -- Array of solution descriptions
  proposal_presentation_datetime TIMESTAMPTZ,
  proposal_location TEXT,

  -- Negotiation/Agreement Phase
  accepted_solutions TEXT[], -- What customer agreed to
  agreed_implementation_cost DECIMAL(10,2),
  agreed_recurring_cost DECIMAL(10,2),
  delivery_requirements TEXT,

  -- Project Delivery Phase
  solution_due_date DATE,
  ga_date DATE, -- General Availability date from customer
  github_repo_url TEXT, -- MVP1: manual field, MVP2: API integration
  wekan_board_url TEXT, -- MVP1: manual field, MVP2: API integration

  -- Implementation Phase
  demonstration_date DATE,
  implementation_date DATE,

  -- Sign-off Phase
  signoff_date DATE,
  signoff_notes TEXT,

  -- Payment Phase
  payment_status payment_status DEFAULT 'not_applicable',
  payment_info TEXT,
  payment_confirmed_date DATE,

  -- Project Health Tracking
  current_blockers TEXT,
  risk_level TEXT CHECK (risk_level IN ('low', 'medium', 'high')),
  next_action_required TEXT,
  next_action_due_date DATE,

  -- Assignment
  assigned_admin_id UUID REFERENCES profiles(id),

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Full-text search support
  search_vector tsvector
);

-- Add foreign key back to consultation_requests
ALTER TABLE consultation_requests
  ADD COLUMN IF NOT EXISTS converted_to_customer_id UUID REFERENCES customers(id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_customers_stage ON customers(stage);
CREATE INDEX IF NOT EXISTS idx_customers_status ON customers(project_status);
CREATE INDEX IF NOT EXISTS idx_customers_assigned ON customers(assigned_admin_id);
CREATE INDEX IF NOT EXISTS idx_customers_search ON customers USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_customers_created_at ON customers(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);

-- =====================================================
-- 4. CREATE CUSTOMER_INTERACTIONS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS customer_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,

  -- Interaction details
  interaction_type interaction_type NOT NULL,
  subject TEXT,
  notes TEXT,
  interaction_date TIMESTAMPTZ DEFAULT NOW(),

  -- Who logged it
  created_by UUID REFERENCES profiles(id),

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_interactions_customer ON customer_interactions(customer_id);
CREATE INDEX IF NOT EXISTS idx_interactions_date ON customer_interactions(interaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_interactions_type ON customer_interactions(interaction_type);

-- =====================================================
-- 5. AUTOMATIC STAGE PROGRESSION TRIGGER
-- =====================================================

-- Function to automatically progress customer through stages
CREATE OR REPLACE FUNCTION auto_progress_customer_stage()
RETURNS TRIGGER AS $$
BEGIN
  -- Consultation completed (meeting occurred)
  IF NEW.consultation_occurred_date IS NOT NULL AND
     (OLD.consultation_occurred_date IS NULL OR OLD.consultation_occurred_date != NEW.consultation_occurred_date) THEN
    NEW.stage := 'consultation_completed';
    INSERT INTO customer_interactions (customer_id, interaction_type, notes, created_by)
    VALUES (NEW.id, 'stage_change', 'Stage changed to: consultation_completed', NEW.assigned_admin_id);
  END IF;

  -- Proposal sent (solutions proposed)
  IF NEW.proposed_solutions IS NOT NULL AND array_length(NEW.proposed_solutions, 1) > 0 AND
     (OLD.proposed_solutions IS NULL OR array_length(OLD.proposed_solutions, 1) = 0) THEN
    NEW.stage := 'proposal_sent';
    INSERT INTO customer_interactions (customer_id, interaction_type, subject, notes, created_by)
    VALUES (
      NEW.id,
      'proposal_sent',
      'Proposal sent to customer',
      'Proposed solutions: ' || array_to_string(NEW.proposed_solutions, ', '),
      NEW.assigned_admin_id
    );
  END IF;

  -- Negotiation (customer responded with accepted solutions)
  IF NEW.accepted_solutions IS NOT NULL AND array_length(NEW.accepted_solutions, 1) > 0 AND
     (OLD.accepted_solutions IS NULL OR array_length(OLD.accepted_solutions, 1) = 0) THEN
    NEW.stage := 'negotiation';
    INSERT INTO customer_interactions (customer_id, interaction_type, notes, created_by)
    VALUES (NEW.id, 'stage_change', 'Stage changed to: negotiation', NEW.assigned_admin_id);
  END IF;

  -- Project active (costs agreed)
  IF NEW.agreed_implementation_cost IS NOT NULL AND
     (OLD.agreed_implementation_cost IS NULL OR OLD.agreed_implementation_cost != NEW.agreed_implementation_cost) THEN
    NEW.stage := 'project_active';
    INSERT INTO customer_interactions (customer_id, interaction_type, notes, created_by)
    VALUES (
      NEW.id,
      'stage_change',
      'Stage changed to: project_active - Implementation cost agreed: $' || NEW.agreed_implementation_cost,
      NEW.assigned_admin_id
    );
  END IF;

  -- Implementation phase
  IF NEW.implementation_date IS NOT NULL AND
     (OLD.implementation_date IS NULL OR OLD.implementation_date != NEW.implementation_date) THEN
    NEW.stage := 'implementation';
    INSERT INTO customer_interactions (customer_id, interaction_type, notes, created_by)
    VALUES (NEW.id, 'stage_change', 'Stage changed to: implementation', NEW.assigned_admin_id);
  END IF;

  -- Delivered (demonstration completed)
  IF NEW.demonstration_date IS NOT NULL AND
     (OLD.demonstration_date IS NULL OR OLD.demonstration_date != NEW.demonstration_date) THEN
    NEW.stage := 'delivered';
    INSERT INTO customer_interactions (customer_id, interaction_type, notes, created_by)
    VALUES (NEW.id, 'stage_change', 'Stage changed to: delivered', NEW.assigned_admin_id);
  END IF;

  -- Signed off
  IF NEW.signoff_date IS NOT NULL AND
     (OLD.signoff_date IS NULL OR OLD.signoff_date != NEW.signoff_date) THEN
    NEW.stage := 'signed_off';
    INSERT INTO customer_interactions (customer_id, interaction_type, notes, created_by)
    VALUES (NEW.id, 'stage_change', 'Stage changed to: signed_off', NEW.assigned_admin_id);
  END IF;

  -- Closed won (payment confirmed)
  IF NEW.payment_confirmed_date IS NOT NULL AND
     (OLD.payment_confirmed_date IS NULL OR OLD.payment_confirmed_date != NEW.payment_confirmed_date) THEN
    NEW.stage := 'closed_won';
    INSERT INTO customer_interactions (customer_id, interaction_type, subject, notes, created_by)
    VALUES (
      NEW.id,
      'payment_received',
      'Payment confirmed',
      'Stage changed to: closed_won',
      NEW.assigned_admin_id
    );
  END IF;

  -- Always update the timestamp
  NEW.updated_at := NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach trigger to customers table
DROP TRIGGER IF EXISTS trigger_auto_progress_stage ON customers;
CREATE TRIGGER trigger_auto_progress_stage
  BEFORE UPDATE ON customers
  FOR EACH ROW
  EXECUTE FUNCTION auto_progress_customer_stage();

-- =====================================================
-- 6. UPDATE FULL-TEXT SEARCH FUNCTION
-- =====================================================

-- Function to update search vector for customers
CREATE OR REPLACE FUNCTION update_customer_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.email, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.business_type, '')), 'C') ||
    setweight(to_tsvector('english', COALESCE(NEW.initial_challenges, '')), 'D');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach search vector trigger
DROP TRIGGER IF EXISTS trigger_update_search_vector ON customers;
CREATE TRIGGER trigger_update_search_vector
  BEFORE INSERT OR UPDATE ON customers
  FOR EACH ROW
  EXECUTE FUNCTION update_customer_search_vector();

-- =====================================================
-- 7. ROW-LEVEL SECURITY POLICIES
-- =====================================================

-- Enable RLS on consultation_requests
ALTER TABLE consultation_requests ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins can view all consultations" ON consultation_requests;
DROP POLICY IF EXISTS "Admins can insert consultations" ON consultation_requests;
DROP POLICY IF EXISTS "Admins can update consultations" ON consultation_requests;
DROP POLICY IF EXISTS "Public can insert consultations" ON consultation_requests;

-- Admins can do everything with consultations
CREATE POLICY "Admins can view all consultations"
  ON consultation_requests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can insert consultations"
  ON consultation_requests FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update consultations"
  ON consultation_requests FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Allow public to insert consultation requests (from website form)
CREATE POLICY "Public can insert consultations"
  ON consultation_requests FOR INSERT
  WITH CHECK (true);

-- Enable RLS on customers table
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins can manage customers" ON customers;

-- Admins have full access to customers
CREATE POLICY "Admins can manage customers"
  ON customers FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Enable RLS on customer_interactions table
ALTER TABLE customer_interactions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins can manage interactions" ON customer_interactions;

-- Admins have full access to interactions
CREATE POLICY "Admins can manage interactions"
  ON customer_interactions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =====================================================
-- 8. HELPER FUNCTIONS FOR DASHBOARD METRICS
-- =====================================================

-- Function to calculate revenue metrics
CREATE OR REPLACE FUNCTION get_revenue_metrics()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'ytd', COALESCE(SUM(CASE
      WHEN EXTRACT(YEAR FROM payment_confirmed_date) = EXTRACT(YEAR FROM NOW())
      THEN agreed_implementation_cost
      ELSE 0
    END), 0),
    'pipeline', COALESCE(SUM(CASE
      WHEN stage IN ('proposal_sent', 'negotiation', 'project_active')
      THEN agreed_implementation_cost
      ELSE 0
    END), 0),
    'avg_deal', COALESCE(AVG(CASE
      WHEN stage = 'closed_won'
      THEN agreed_implementation_cost
      ELSE NULL
    END), 0)
  ) INTO result
  FROM customers;

  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
--
-- Next steps:
-- 1. Run this SQL in Supabase SQL Editor
-- 2. Verify all tables, enums, and functions created successfully
-- 3. Test automatic stage progression with a sample customer
-- 4. Update application code to use new schema
--
-- =====================================================
