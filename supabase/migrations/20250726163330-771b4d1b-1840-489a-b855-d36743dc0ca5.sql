-- Remove payment_id column and add category_id to payments table
ALTER TABLE public.payments 
DROP COLUMN IF EXISTS payment_id;

ALTER TABLE public.payments 
ADD COLUMN category_id UUID REFERENCES public.income_categories(id);

-- Add secondary_income column to bookings table
ALTER TABLE public.bookings 
ADD COLUMN secondary_income NUMERIC DEFAULT 0;

-- Update existing payments to map payment_type to category_id
-- Map 'rent' to 'Rent' category
UPDATE public.payments 
SET category_id = (
  SELECT id FROM public.income_categories 
  WHERE name = 'Rent' AND is_default = true 
  LIMIT 1
)
WHERE payment_type = 'rent';

-- Map 'Secondary Income' to 'Secondary Income' category
UPDATE public.payments 
SET category_id = (
  SELECT id FROM public.income_categories 
  WHERE name = 'Secondary Income' AND is_default = true 
  LIMIT 1
)
WHERE payment_type = 'Secondary Income';

-- Calculate and update secondary_income for each booking
UPDATE public.bookings 
SET secondary_income = COALESCE((
  SELECT SUM(p.amount) 
  FROM public.payments p
  JOIN public.income_categories ic ON p.category_id = ic.id
  WHERE p.booking_id = bookings.id 
  AND ic.name = 'Secondary Income'
), 0);

-- Remove payment_type column since we now use category_id
ALTER TABLE public.payments 
DROP COLUMN payment_type;