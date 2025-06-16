
-- Add a payments table to track all payments separately
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID NOT NULL,
  amount NUMERIC NOT NULL,
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  payment_type TEXT NOT NULL DEFAULT 'rent',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  organization_id UUID
);

-- Enable RLS for payments table
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for payments
CREATE POLICY "Users can view payments" ON public.payments FOR SELECT USING (true);
CREATE POLICY "Users can insert payments" ON public.payments FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update payments" ON public.payments FOR UPDATE USING (true);
CREATE POLICY "Users can delete payments" ON public.payments FOR DELETE USING (true);

-- Update expenses table to add CGST and SGST fields and remove old GST fields
ALTER TABLE public.expenses 
ADD COLUMN IF NOT EXISTS cgst_percentage NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS sgst_percentage NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS cgst_amount NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS sgst_amount NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_amount NUMERIC DEFAULT 0;

-- Remove the old GST percentage column if it exists (keeping for backwards compatibility)
-- ALTER TABLE public.expenses DROP COLUMN IF EXISTS gst_percentage;

-- Create function to migrate existing advance payments to payments table
CREATE OR REPLACE FUNCTION migrate_advance_to_payments()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Insert existing advance amounts as initial payments
  INSERT INTO public.payments (booking_id, amount, payment_date, payment_type, description, organization_id)
  SELECT 
    id,
    advance,
    DATE(created_at),
    'advance',
    'Initial advance payment',
    organization_id
  FROM public.bookings 
  WHERE advance > 0
  AND NOT EXISTS (
    SELECT 1 FROM public.payments 
    WHERE booking_id = bookings.id AND payment_type = 'advance'
  );
END;
$$;

-- Run the migration function
SELECT migrate_advance_to_payments();

-- Insert existing balance payments into the new payments table
INSERT INTO public.payments (booking_id, amount, payment_date, payment_type, description, organization_id)
SELECT 
  booking_id,
  amount,
  payment_date,
  COALESCE(payment_type, 'balance'),
  'Balance payment',
  organization_id
FROM public.balance_payments 
WHERE NOT EXISTS (
  SELECT 1 FROM public.payments 
  WHERE booking_id = balance_payments.booking_id 
  AND amount = balance_payments.amount 
  AND payment_date = balance_payments.payment_date
);
