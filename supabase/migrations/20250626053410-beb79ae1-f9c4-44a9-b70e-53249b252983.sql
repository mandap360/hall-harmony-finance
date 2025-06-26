
-- Add soft delete columns to bookings table
ALTER TABLE public.bookings 
ADD COLUMN deleted_at timestamp with time zone,
ADD COLUMN is_deleted boolean DEFAULT false;

-- Add soft delete columns to expenses table  
ALTER TABLE public.expenses
ADD COLUMN deleted_at timestamp with time zone,
ADD COLUMN is_deleted boolean DEFAULT false;

-- Create function to permanently delete old soft-deleted records
CREATE OR REPLACE FUNCTION cleanup_deleted_records()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Delete bookings older than 10 days
  DELETE FROM public.bookings 
  WHERE is_deleted = true 
  AND deleted_at < NOW() - INTERVAL '10 days';
  
  -- Delete expenses older than 10 days
  DELETE FROM public.expenses 
  WHERE is_deleted = true 
  AND deleted_at < NOW() - INTERVAL '10 days';
END;
$$;

-- Create a scheduled job to run cleanup (this would need to be set up separately in production)
-- For now, this is just the function that can be called manually or via a cron job
