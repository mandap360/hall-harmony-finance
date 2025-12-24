-- Add voucher-related columns to transactions table
ALTER TABLE public.transactions
ADD COLUMN voucher_type text,
ADD COLUMN is_financial_transaction boolean DEFAULT false,
ADD COLUMN from_account_id uuid REFERENCES public.accounts(id),
ADD COLUMN to_account_id uuid REFERENCES public.accounts(id),
ADD COLUMN vendor_id uuid REFERENCES public.vendors(id),
ADD COLUMN booking_id uuid REFERENCES public.bookings(id);

-- Add check constraint for voucher_type
ALTER TABLE public.transactions
ADD CONSTRAINT valid_voucher_type CHECK (voucher_type IN ('purchase', 'payment', 'fund_transfer', 'sales', 'receipt'));

-- Create index for faster filtering of financial transactions
CREATE INDEX idx_transactions_is_financial ON public.transactions(is_financial_transaction) WHERE is_financial_transaction = true;

-- Create index for voucher type lookups
CREATE INDEX idx_transactions_voucher_type ON public.transactions(voucher_type);