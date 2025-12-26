-- Drop existing constraint
ALTER TABLE accounts DROP CONSTRAINT IF EXISTS accounts_account_type_check;

-- Update existing data
UPDATE accounts SET account_type = 'cash_bank' WHERE account_type = 'operational';
UPDATE accounts SET account_type = 'owners_capital' WHERE account_type = 'capital';

-- Add new constraint with only the three types
ALTER TABLE accounts ADD CONSTRAINT accounts_account_type_check 
  CHECK (account_type = ANY (ARRAY['cash_bank'::text, 'owners_capital'::text, 'party'::text]));