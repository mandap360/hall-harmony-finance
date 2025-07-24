-- Clear existing default categories first
DELETE FROM public.income_categories WHERE name IN ('Rent', 'Secondary Income', 'EB', 'Gas', 'Cleaning Charge');

-- Add organization_id column if it doesn't exist
ALTER TABLE public.income_categories 
ADD COLUMN IF NOT EXISTS organization_id uuid;

-- Add is_default column if it doesn't exist
ALTER TABLE public.income_categories 
ADD COLUMN IF NOT EXISTS is_default boolean DEFAULT false;

-- Create single entries for default categories (shared across all organizations)
INSERT INTO public.income_categories (name, is_default, organization_id) VALUES
('Rent', true, NULL),
('Secondary Income', true, NULL);

-- Get the Secondary Income category ID
DO $$
DECLARE
    secondary_income_id uuid;
BEGIN
    SELECT id INTO secondary_income_id 
    FROM public.income_categories 
    WHERE name = 'Secondary Income' AND is_default = true;

    -- Insert subcategories under Secondary Income
    INSERT INTO public.income_categories (name, parent_id, is_default, organization_id) VALUES
    ('EB', secondary_income_id, true, NULL),
    ('Gas', secondary_income_id, true, NULL),
    ('Cleaning Charge', secondary_income_id, true, NULL),
    ('AC Charge', secondary_income_id, true, NULL),
    ('Electric Generator', secondary_income_id, true, NULL),
    ('Security', secondary_income_id, true, NULL),
    ('Serial Light', secondary_income_id, true, NULL),
    ('Room Rent', secondary_income_id, true, NULL),
    ('Missing Products', secondary_income_id, true, NULL);
END $$;