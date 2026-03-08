-- 1a. Add columns (nullable first for seeding)
ALTER TABLE customers ADD COLUMN IF NOT EXISTS customer_number TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS is_test BOOLEAN NOT NULL DEFAULT false;

-- 1b. Seed known customers
UPDATE customers SET customer_number = '1121', is_test = false WHERE name = 'novique management';
UPDATE customers SET customer_number = '1122', is_test = false WHERE name = 'StBenedicts';
UPDATE customers SET customer_number = '0001', is_test = true  WHERE name = 'Spiffy Logistics';
UPDATE customers SET customer_number = '0002', is_test = true  WHERE name = 'Super Construction Company';

-- 1b2. Assign numbers to any remaining customers that weren't seeded
DO $$
DECLARE
  r RECORD;
  next_num INT := 1122; -- start after last known real customer
BEGIN
  SELECT COALESCE(MAX(customer_number::int), 1122)
    INTO next_num
    FROM customers WHERE is_test = false AND customer_number IS NOT NULL;

  FOR r IN SELECT id FROM customers WHERE customer_number IS NULL ORDER BY created_at
  LOOP
    next_num := next_num + 1;
    UPDATE customers SET customer_number = LPAD(next_num::text, 4, '0') WHERE id = r.id;
  END LOOP;
END $$;

-- 1c. Add constraints on customer_number
ALTER TABLE customers ALTER COLUMN customer_number SET NOT NULL;
ALTER TABLE customers ADD CONSTRAINT uq_customer_number UNIQUE (customer_number);
CREATE INDEX IF NOT EXISTS idx_customers_number ON customers(customer_number);
CREATE INDEX IF NOT EXISTS idx_customers_is_test ON customers(is_test);

-- 1d. Auto-generation trigger with separate ranges for test vs real
CREATE OR REPLACE FUNCTION generate_customer_number()
RETURNS TRIGGER AS $$
DECLARE next_num INT;
BEGIN
  IF NEW.customer_number IS NULL OR NEW.customer_number = '' THEN
    IF NEW.is_test THEN
      SELECT COALESCE(MAX(customer_number::int), 0) + 1
        INTO next_num
        FROM customers WHERE is_test = true;
    ELSE
      SELECT GREATEST(COALESCE(MAX(customer_number::int), 1120) + 1, 1121)
        INTO next_num
        FROM customers WHERE is_test = false;
    END IF;
    NEW.customer_number := LPAD(next_num::text, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_generate_customer_number ON customers;
CREATE TRIGGER trigger_generate_customer_number
  BEFORE INSERT ON customers FOR EACH ROW
  EXECUTE FUNCTION generate_customer_number();

-- 1e. Update full-text search to include customer_number
CREATE OR REPLACE FUNCTION update_customer_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.customer_number, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.email, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.business_type, '')), 'C') ||
    setweight(to_tsvector('english', COALESCE(NEW.initial_challenges, '')), 'D');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
