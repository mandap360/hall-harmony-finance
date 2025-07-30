-- Rename payments table to income
ALTER TABLE public.payments RENAME TO income;

-- Update any indexes that reference the old table name
-- (Supabase will automatically update most constraints and indexes)

-- Verify the rename was successful
COMMENT ON TABLE public.income IS 'Income records for bookings and additional income sources';