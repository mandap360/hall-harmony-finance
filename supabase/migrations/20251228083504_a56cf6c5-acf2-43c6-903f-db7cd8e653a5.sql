-- Function to recalculate and update a single account's balance
CREATE OR REPLACE FUNCTION recalculate_account_balance(account_id uuid)
RETURNS void AS $$
DECLARE
  acc_type text;
  calc_balance numeric;
  opening numeric;
BEGIN
  -- Get account type and opening balance
  SELECT account_type, opening_balance INTO acc_type, opening FROM accounts WHERE id = account_id;
  
  IF acc_type IN ('cash', 'bank') THEN
    -- For cash/bank: opening_balance + money_in - money_out
    SELECT opening + 
      COALESCE((SELECT SUM(amount) FROM transactions WHERE to_account_id = account_id), 0) -
      COALESCE((SELECT SUM(amount) FROM transactions WHERE from_account_id = account_id), 0)
    INTO calc_balance;
  ELSIF acc_type = 'party' THEN
    -- For parties: opening_balance + purchases - payments (what we owe them)
    -- Also handle sales - receipts (what they owe us, shown as negative payable)
    SELECT opening + 
      COALESCE((SELECT SUM(amount) FROM transactions WHERE party_id = account_id AND voucher_type = 'purchase'), 0) -
      COALESCE((SELECT SUM(amount) FROM transactions WHERE party_id = account_id AND voucher_type = 'payment'), 0) -
      COALESCE((SELECT SUM(amount) FROM transactions WHERE party_id = account_id AND voucher_type = 'sales'), 0) +
      COALESCE((SELECT SUM(amount) FROM transactions WHERE party_id = account_id AND voucher_type = 'receipt'), 0)
    INTO calc_balance;
  ELSE
    -- Default: just use opening balance
    calc_balance := opening;
  END IF;
  
  -- Update the balance
  UPDATE accounts SET balance = COALESCE(calc_balance, opening), updated_at = now() WHERE id = account_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger function for transactions table
CREATE OR REPLACE FUNCTION update_account_balance_on_transaction()
RETURNS TRIGGER AS $$
BEGIN
  -- Handle INSERT or UPDATE
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    -- Update party balance if party_id exists
    IF NEW.party_id IS NOT NULL THEN
      PERFORM recalculate_account_balance(NEW.party_id);
    END IF;
    
    -- Update from_account balance if exists
    IF NEW.from_account_id IS NOT NULL THEN
      PERFORM recalculate_account_balance(NEW.from_account_id);
    END IF;
    
    -- Update to_account balance if exists
    IF NEW.to_account_id IS NOT NULL THEN
      PERFORM recalculate_account_balance(NEW.to_account_id);
    END IF;
  END IF;
  
  -- Handle DELETE or UPDATE (for old values)
  IF TG_OP = 'DELETE' OR TG_OP = 'UPDATE' THEN
    -- Update old party balance if party_id existed
    IF OLD.party_id IS NOT NULL THEN
      PERFORM recalculate_account_balance(OLD.party_id);
    END IF;
    
    -- Update old from_account balance if existed
    IF OLD.from_account_id IS NOT NULL THEN
      PERFORM recalculate_account_balance(OLD.from_account_id);
    END IF;
    
    -- Update old to_account balance if existed
    IF OLD.to_account_id IS NOT NULL THEN
      PERFORM recalculate_account_balance(OLD.to_account_id);
    END IF;
  END IF;
  
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger function for accounts table (when opening_balance is updated)
CREATE OR REPLACE FUNCTION update_balance_on_opening_balance_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Only recalculate if opening_balance changed
  IF OLD.opening_balance IS DISTINCT FROM NEW.opening_balance THEN
    PERFORM recalculate_account_balance(NEW.id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on transactions table
DROP TRIGGER IF EXISTS trigger_update_account_balance ON transactions;
CREATE TRIGGER trigger_update_account_balance
AFTER INSERT OR UPDATE OR DELETE ON transactions
FOR EACH ROW EXECUTE FUNCTION update_account_balance_on_transaction();

-- Create trigger on accounts table for opening_balance changes
DROP TRIGGER IF EXISTS trigger_update_balance_on_opening ON accounts;
CREATE TRIGGER trigger_update_balance_on_opening
AFTER UPDATE ON accounts
FOR EACH ROW EXECUTE FUNCTION update_balance_on_opening_balance_change();

-- One-time recalculation of all account balances
DO $$
DECLARE
  acc RECORD;
BEGIN
  FOR acc IN SELECT id FROM accounts LOOP
    PERFORM recalculate_account_balance(acc.id);
  END LOOP;
END $$;