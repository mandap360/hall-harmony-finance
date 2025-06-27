
-- Add status column to bookings table
ALTER TABLE public.bookings 
ADD COLUMN status TEXT DEFAULT 'confirmed';

-- Add a check constraint to ensure valid status values
ALTER TABLE public.bookings 
ADD CONSTRAINT bookings_status_check 
CHECK (status IN ('confirmed', 'cancelled', 'completed'));

-- Update existing bookings to have 'confirmed' status by default
UPDATE public.bookings 
SET status = 'confirmed' 
WHERE status IS NULL;
