-- =====================================================
-- Novique.AI Communications Hub - Database Migration
-- =====================================================
-- This migration creates the unified communications system
-- for managing voicemails, SMS, and future email integration.
--
-- Run this in Supabase SQL Editor
-- =====================================================

-- =====================================================
-- 1. CREATE ENUMS
-- =====================================================

-- Communication types
CREATE TYPE communication_type AS ENUM (
  'voicemail',
  'sms',
  'email',
  'call'
);

-- Communication direction
CREATE TYPE communication_direction AS ENUM (
  'inbound',
  'outbound'
);

-- Communication status
CREATE TYPE communication_status AS ENUM (
  'unread',
  'read',
  'archived',
  'replied'
);

-- Transcription status
CREATE TYPE transcription_status AS ENUM (
  'pending',
  'in_progress',
  'completed',
  'failed'
);

-- =====================================================
-- 2. CREATE COMMUNICATIONS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS communications (
  -- Identity
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Classification
  type communication_type NOT NULL,
  direction communication_direction NOT NULL DEFAULT 'inbound',
  status communication_status NOT NULL DEFAULT 'unread',

  -- Contact info
  from_address TEXT NOT NULL,  -- Phone number (E.164) or email
  from_name TEXT,              -- Caller/sender name if available
  to_address TEXT NOT NULL,    -- Our phone number or email

  -- Content
  subject TEXT,                -- For emails
  body TEXT,                   -- Message content or transcription

  -- Voicemail specific
  duration INTEGER,            -- Duration in seconds
  recording_url TEXT,          -- Twilio recording URL
  transcription_status transcription_status DEFAULT 'pending',

  -- Provider references
  twilio_call_sid TEXT,        -- Twilio call SID
  twilio_recording_sid TEXT,   -- Twilio recording SID
  twilio_message_sid TEXT,     -- Twilio SMS message SID
  resend_email_id TEXT,        -- Resend email ID (future)

  -- Email specific (future)
  attachments JSONB,           -- Array of attachment metadata

  -- CRM linkage
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,

  -- SMS consent tracking
  sms_consent BOOLEAN,         -- Whether user has opted in to SMS

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  read_at TIMESTAMPTZ,
  replied_at TIMESTAMPTZ,
  archived_at TIMESTAMPTZ
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_communications_type ON communications(type);
CREATE INDEX IF NOT EXISTS idx_communications_status ON communications(status);
CREATE INDEX IF NOT EXISTS idx_communications_direction ON communications(direction);
CREATE INDEX IF NOT EXISTS idx_communications_created_at ON communications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_communications_customer_id ON communications(customer_id);
CREATE INDEX IF NOT EXISTS idx_communications_from_address ON communications(from_address);
CREATE INDEX IF NOT EXISTS idx_communications_twilio_call_sid ON communications(twilio_call_sid);
CREATE INDEX IF NOT EXISTS idx_communications_twilio_recording_sid ON communications(twilio_recording_sid);

-- Composite index for common queries
CREATE INDEX IF NOT EXISTS idx_communications_type_status ON communications(type, status);
CREATE INDEX IF NOT EXISTS idx_communications_unread ON communications(status, created_at DESC)
  WHERE status = 'unread';

-- =====================================================
-- 3. SMS CONSENT TRACKING TABLE
-- =====================================================

-- Track SMS opt-in/opt-out status per phone number
CREATE TABLE IF NOT EXISTS sms_consent (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number TEXT UNIQUE NOT NULL,  -- E.164 format
  consented BOOLEAN NOT NULL DEFAULT true,
  consent_date TIMESTAMPTZ DEFAULT NOW(),
  consent_source TEXT,  -- 'web_form', 'sms_keyword', etc.
  opt_out_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sms_consent_phone ON sms_consent(phone_number);

-- =====================================================
-- 4. FUNCTION: AUTO-MATCH CUSTOMER BY PHONE/EMAIL
-- =====================================================

CREATE OR REPLACE FUNCTION match_customer_by_contact(
  p_from_address TEXT,
  p_type communication_type
)
RETURNS UUID AS $$
DECLARE
  v_customer_id UUID;
BEGIN
  IF p_type IN ('voicemail', 'sms', 'call') THEN
    -- Match by phone number (strip formatting for comparison)
    SELECT id INTO v_customer_id
    FROM customers
    WHERE regexp_replace(phone, '[^0-9+]', '', 'g') = regexp_replace(p_from_address, '[^0-9+]', '', 'g')
    LIMIT 1;
  ELSIF p_type = 'email' THEN
    -- Match by email
    SELECT id INTO v_customer_id
    FROM customers
    WHERE LOWER(email) = LOWER(p_from_address)
    LIMIT 1;
  END IF;

  RETURN v_customer_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 5. FUNCTION: GET COMMUNICATION STATS
-- =====================================================

CREATE OR REPLACE FUNCTION get_communication_stats()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_unread', (SELECT COUNT(*) FROM communications WHERE status = 'unread'),
    'unread_voicemail', (SELECT COUNT(*) FROM communications WHERE status = 'unread' AND type = 'voicemail'),
    'unread_sms', (SELECT COUNT(*) FROM communications WHERE status = 'unread' AND type = 'sms'),
    'unread_email', (SELECT COUNT(*) FROM communications WHERE status = 'unread' AND type = 'email'),
    'today_count', (SELECT COUNT(*) FROM communications WHERE created_at >= CURRENT_DATE),
    'this_week_count', (SELECT COUNT(*) FROM communications WHERE created_at >= date_trunc('week', CURRENT_DATE))
  ) INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 6. TRIGGER: UPDATE TIMESTAMPS
-- =====================================================

CREATE OR REPLACE FUNCTION update_communication_timestamps()
RETURNS TRIGGER AS $$
BEGIN
  -- Set read_at when status changes to 'read'
  IF NEW.status = 'read' AND (OLD.status IS NULL OR OLD.status != 'read') THEN
    NEW.read_at := NOW();
  END IF;

  -- Set archived_at when status changes to 'archived'
  IF NEW.status = 'archived' AND (OLD.status IS NULL OR OLD.status != 'archived') THEN
    NEW.archived_at := NOW();
  END IF;

  -- Set replied_at when status changes to 'replied'
  IF NEW.status = 'replied' AND (OLD.status IS NULL OR OLD.status != 'replied') THEN
    NEW.replied_at := NOW();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_communication_timestamps ON communications;
CREATE TRIGGER trigger_communication_timestamps
  BEFORE UPDATE ON communications
  FOR EACH ROW
  EXECUTE FUNCTION update_communication_timestamps();

-- =====================================================
-- 7. TRIGGER: AUTO-MATCH CUSTOMER ON INSERT
-- =====================================================

CREATE OR REPLACE FUNCTION auto_match_customer_on_communication()
RETURNS TRIGGER AS $$
BEGIN
  -- Only auto-match if customer_id is not already set
  IF NEW.customer_id IS NULL THEN
    NEW.customer_id := match_customer_by_contact(NEW.from_address, NEW.type);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_auto_match_customer ON communications;
CREATE TRIGGER trigger_auto_match_customer
  BEFORE INSERT ON communications
  FOR EACH ROW
  EXECUTE FUNCTION auto_match_customer_on_communication();

-- =====================================================
-- 8. ROW-LEVEL SECURITY POLICIES
-- =====================================================

-- Enable RLS on communications table
ALTER TABLE communications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins and editors can view communications" ON communications;
DROP POLICY IF EXISTS "Admins can manage communications" ON communications;
DROP POLICY IF EXISTS "System can insert communications" ON communications;

-- Admins and editors can view all communications
CREATE POLICY "Admins and editors can view communications"
  ON communications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'editor')
    )
  );

-- Only admins can insert, update, delete
CREATE POLICY "Admins can manage communications"
  ON communications FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Allow unauthenticated inserts for webhook handlers
-- This is necessary because Twilio webhooks won't have auth
CREATE POLICY "System can insert communications"
  ON communications FOR INSERT
  WITH CHECK (true);

-- Enable RLS on sms_consent table
ALTER TABLE sms_consent ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins can view sms consent" ON sms_consent;
DROP POLICY IF EXISTS "System can manage sms consent" ON sms_consent;

-- Admins can view consent records
CREATE POLICY "Admins can view sms consent"
  ON sms_consent FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- System/webhooks can manage consent
CREATE POLICY "System can manage sms consent"
  ON sms_consent FOR ALL
  WITH CHECK (true);

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
--
-- Next steps:
-- 1. Run this SQL in Supabase SQL Editor
-- 2. Verify all tables, enums, and functions created successfully
-- 3. Update Twilio webhook URLs to point to production endpoints
-- 4. Add ADMIN_PHONE_NUMBER to Vercel environment variables
--
-- Tables created:
--   - communications (unified inbox)
--   - sms_consent (opt-in/opt-out tracking)
--
-- Functions created:
--   - match_customer_by_contact() - Auto-link to CRM
--   - get_communication_stats() - Dashboard metrics
--
-- =====================================================
