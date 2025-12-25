-- Create ENUM types for transactions
CREATE TYPE public.voucher_type AS ENUM ('purchase', 'payment', 'fund_transfer', 'sales', 'receipt');
CREATE TYPE public.party_type AS ENUM ('customer', 'vendor');
CREATE TYPE public.payment_method_type AS ENUM ('cash', 'bank');

-- Create transactions table
CREATE TABLE public.transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  voucher_type public.voucher_type NOT NULL,
  voucher_date DATE NOT NULL,
  amount NUMERIC NOT NULL CHECK (amount > 0),
  party_type public.party_type,
  party_id UUID,
  payment_method public.payment_method_type,
  from_account_id UUID REFERENCES public.accounts(id),
  to_account_id UUID REFERENCES public.accounts(id),
  reference_voucher_id UUID REFERENCES public.transactions(id),
  is_financial_transaction BOOLEAN NOT NULL DEFAULT true,
  organization_id UUID NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX idx_transactions_organization_id ON public.transactions(organization_id);
CREATE INDEX idx_transactions_voucher_date ON public.transactions(voucher_date);
CREATE INDEX idx_transactions_voucher_type ON public.transactions(voucher_type);
CREATE INDEX idx_transactions_party ON public.transactions(party_type, party_id);
CREATE INDEX idx_transactions_from_account ON public.transactions(from_account_id);
CREATE INDEX idx_transactions_to_account ON public.transactions(to_account_id);

-- Enable Row Level Security
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for organization-based access
CREATE POLICY "Users can view their organization transactions"
ON public.transactions
FOR SELECT
USING (organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can create transactions for their organization"
ON public.transactions
FOR INSERT
WITH CHECK (organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can update their organization transactions"
ON public.transactions
FOR UPDATE
USING (organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can delete their organization transactions"
ON public.transactions
FOR DELETE
USING (organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid()));

-- Add comment for documentation
COMMENT ON TABLE public.transactions IS 'Financial transactions including purchases, payments, sales, receipts, and fund transfers';