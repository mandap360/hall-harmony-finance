
-- Create accounts table for banking functionality
CREATE TABLE public.accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  account_type TEXT NOT NULL CHECK (account_type IN ('cash', 'bank', 'other')),
  balance NUMERIC NOT NULL DEFAULT 0,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create transactions table for banking functionality
CREATE TABLE public.transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('credit', 'debit')),
  amount NUMERIC NOT NULL,
  description TEXT,
  reference_type TEXT, -- 'booking_payment', 'expense', 'manual'
  reference_id UUID, -- booking_id or expense_id
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default accounts
INSERT INTO public.accounts (name, account_type, balance, is_default) VALUES
('Cash in Hand', 'cash', 0, true),
('Bank Account', 'bank', 0, true);

-- Add payment_mode column to bookings table
ALTER TABLE public.bookings ADD COLUMN payment_mode UUID REFERENCES public.accounts(id);

-- Enable RLS on accounts and transactions
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for accounts (allow all operations for now since no auth)
CREATE POLICY "Allow all operations on accounts" ON public.accounts FOR ALL USING (true);

-- Create RLS policies for transactions (allow all operations for now since no auth)
CREATE POLICY "Allow all operations on transactions" ON public.transactions FOR ALL USING (true);
