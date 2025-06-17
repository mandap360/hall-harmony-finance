
-- Drop the unused balance_payments table since all payments are now handled through the payments table
DROP TABLE IF EXISTS public.balance_payments;

-- Ensure the payments table has proper indexes for better performance
CREATE INDEX IF NOT EXISTS idx_payments_booking_id ON public.payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_payment_type ON public.payments(payment_type);
CREATE INDEX IF NOT EXISTS idx_additional_income_booking_id ON public.additional_income(booking_id);

-- Add RLS policies for payments table if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'payments' AND policyname = 'Users can view payments'
    ) THEN
        CREATE POLICY "Users can view payments" ON public.payments FOR SELECT USING (true);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'payments' AND policyname = 'Users can insert payments'
    ) THEN
        CREATE POLICY "Users can insert payments" ON public.payments FOR INSERT WITH CHECK (true);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'payments' AND policyname = 'Users can update payments'
    ) THEN
        CREATE POLICY "Users can update payments" ON public.payments FOR UPDATE USING (true);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'payments' AND policyname = 'Users can delete payments'
    ) THEN
        CREATE POLICY "Users can delete payments" ON public.payments FOR DELETE USING (true);
    END IF;
END $$;

-- Add RLS policies for additional_income table if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'additional_income' AND policyname = 'Users can view additional income'
    ) THEN
        CREATE POLICY "Users can view additional income" ON public.additional_income FOR SELECT USING (true);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'additional_income' AND policyname = 'Users can insert additional income'
    ) THEN
        CREATE POLICY "Users can insert additional income" ON public.additional_income FOR INSERT WITH CHECK (true);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'additional_income' AND policyname = 'Users can update additional income'
    ) THEN
        CREATE POLICY "Users can update additional income" ON public.additional_income FOR UPDATE USING (true);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'additional_income' AND policyname = 'Users can delete additional income'
    ) THEN
        CREATE POLICY "Users can delete additional income" ON public.additional_income FOR DELETE USING (true);
    END IF;
END $$;
