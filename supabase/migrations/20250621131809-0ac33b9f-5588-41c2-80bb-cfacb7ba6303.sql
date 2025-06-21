
-- Add opening_balance column to accounts table
ALTER TABLE public.accounts ADD COLUMN opening_balance NUMERIC NOT NULL DEFAULT 0;

-- Update existing accounts to have their current balance as opening balance
UPDATE public.accounts SET opening_balance = balance WHERE opening_balance = 0;
