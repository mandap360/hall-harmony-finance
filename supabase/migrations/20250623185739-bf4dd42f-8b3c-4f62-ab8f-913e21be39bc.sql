
-- Update the accounts table to allow 'other' account type
ALTER TABLE accounts DROP CONSTRAINT IF EXISTS accounts_account_type_check;
ALTER TABLE accounts ADD CONSTRAINT accounts_account_type_check 
CHECK (account_type IN ('operational', 'capital', 'other'));
