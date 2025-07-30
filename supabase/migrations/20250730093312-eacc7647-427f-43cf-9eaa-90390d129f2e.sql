-- Rename category column to category_id and change type from text to uuid
ALTER TABLE public.secondary_income 
DROP COLUMN category;

ALTER TABLE public.secondary_income 
ADD COLUMN category_id uuid REFERENCES public.income_categories(id);

-- Add index for better performance
CREATE INDEX idx_secondary_income_category_id ON public.secondary_income(category_id);
CREATE INDEX idx_secondary_income_booking_id ON public.secondary_income(booking_id);