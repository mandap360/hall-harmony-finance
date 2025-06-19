
-- First, let's see what account types currently exist
-- and handle the migration more carefully

-- Remove the constraint if it exists
ALTER TABLE public.accounts DROP CONSTRAINT IF EXISTS accounts_account_type_check;

-- Update all existing accounts to 'operational' first
UPDATE public.accounts SET account_type = 'operational';

-- Add the sub_type column
ALTER TABLE public.accounts ADD COLUMN IF NOT EXISTS sub_type TEXT;

-- Set sub_types based on existing account types and names
UPDATE public.accounts 
SET sub_type = CASE 
  WHEN LOWER(name) LIKE '%cash%' OR LOWER(name) LIKE '%petty%' THEN 'cash'
  WHEN LOWER(name) LIKE '%bank%' OR LOWER(name) LIKE '%hdfc%' OR LOWER(name) LIKE '%sbi%' THEN 'bank'
  ELSE 'other'
END;

-- Now add the constraint with the correct values
ALTER TABLE public.accounts ADD CONSTRAINT accounts_account_type_check 
CHECK (account_type IN ('operational', 'capital'));

-- Add payment_mode column to payments table if it doesn't exist
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS payment_mode UUID REFERENCES public.accounts(id);

-- Remove payment_mode column from bookings table if it exists
ALTER TABLE public.bookings DROP COLUMN IF EXISTS payment_mode;
