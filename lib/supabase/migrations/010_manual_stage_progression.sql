-- Migration 010: Manual Stage Progression
-- Removes the auto_progress_customer_stage trigger and replaces it with
-- a simple updated_at trigger. Stage changes are now handled explicitly
-- via the UI and API.

DROP TRIGGER IF EXISTS trigger_auto_progress_stage ON customers;
DROP FUNCTION IF EXISTS auto_progress_customer_stage();

-- Replacement trigger: keep updated_at current on every UPDATE
CREATE OR REPLACE FUNCTION update_customers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW
  EXECUTE FUNCTION update_customers_updated_at();
