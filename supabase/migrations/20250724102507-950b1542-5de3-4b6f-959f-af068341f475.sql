-- Add is_default column to income_categories to mark default categories as non-deletable
ALTER TABLE public.income_categories 
ADD COLUMN IF NOT EXISTS is_default boolean DEFAULT false;

-- Add organization_id column to income_categories if it doesn't exist
ALTER TABLE public.income_categories 
ADD COLUMN IF NOT EXISTS organization_id uuid;

-- Create single entries for default categories (shared across all organizations)
DO $$
DECLARE
    secondary_income_id uuid;
BEGIN
    -- Insert "Rent" category as a global default (no organization_id)
    INSERT INTO public.income_categories (name, is_default, organization_id)
    SELECT 'Rent', true, NULL
    WHERE NOT EXISTS (
        SELECT 1 FROM public.income_categories 
        WHERE name = 'Rent' AND is_default = true AND organization_id IS NULL
    );

    -- Insert "Secondary Income" category as a global default
    INSERT INTO public.income_categories (name, is_default, organization_id)
    SELECT 'Secondary Income', true, NULL
    WHERE NOT EXISTS (
        SELECT 1 FROM public.income_categories 
        WHERE name = 'Secondary Income' AND is_default = true AND organization_id IS NULL
    )
    RETURNING id INTO secondary_income_id;

    -- Get Secondary Income ID if it already exists
    IF secondary_income_id IS NULL THEN
        SELECT id INTO secondary_income_id 
        FROM public.income_categories 
        WHERE name = 'Secondary Income' AND is_default = true AND organization_id IS NULL;
    END IF;

    -- Insert subcategories under Secondary Income as global defaults
    INSERT INTO public.income_categories (name, parent_id, is_default, organization_id)
    SELECT 'EB', secondary_income_id, true, NULL
    WHERE NOT EXISTS (
        SELECT 1 FROM public.income_categories 
        WHERE name = 'EB' AND parent_id = secondary_income_id AND is_default = true
    );

    INSERT INTO public.income_categories (name, parent_id, is_default, organization_id)
    SELECT 'Gas', secondary_income_id, true, NULL
    WHERE NOT EXISTS (
        SELECT 1 FROM public.income_categories 
        WHERE name = 'Gas' AND parent_id = secondary_income_id AND is_default = true
    );

    INSERT INTO public.income_categories (name, parent_id, is_default, organization_id)
    SELECT 'Cleaning Charge', secondary_income_id, true, NULL
    WHERE NOT EXISTS (
        SELECT 1 FROM public.income_categories 
        WHERE name = 'Cleaning Charge' AND parent_id = secondary_income_id AND is_default = true
    );

    INSERT INTO public.income_categories (name, parent_id, is_default, organization_id)
    SELECT 'AC Charge', secondary_income_id, true, NULL
    WHERE NOT EXISTS (
        SELECT 1 FROM public.income_categories 
        WHERE name = 'AC Charge' AND parent_id = secondary_income_id AND is_default = true
    );

    INSERT INTO public.income_categories (name, parent_id, is_default, organization_id)
    SELECT 'Electric Generator', secondary_income_id, true, NULL
    WHERE NOT EXISTS (
        SELECT 1 FROM public.income_categories 
        WHERE name = 'Electric Generator' AND parent_id = secondary_income_id AND is_default = true
    );

    INSERT INTO public.income_categories (name, parent_id, is_default, organization_id)
    SELECT 'Security', secondary_income_id, true, NULL
    WHERE NOT EXISTS (
        SELECT 1 FROM public.income_categories 
        WHERE name = 'Security' AND parent_id = secondary_income_id AND is_default = true
    );

    INSERT INTO public.income_categories (name, parent_id, is_default, organization_id)
    SELECT 'Serial Light', secondary_income_id, true, NULL
    WHERE NOT EXISTS (
        SELECT 1 FROM public.income_categories 
        WHERE name = 'Serial Light' AND parent_id = secondary_income_id AND is_default = true
    );

    INSERT INTO public.income_categories (name, parent_id, is_default, organization_id)
    SELECT 'Room Rent', secondary_income_id, true, NULL
    WHERE NOT EXISTS (
        SELECT 1 FROM public.income_categories 
        WHERE name = 'Room Rent' AND parent_id = secondary_income_id AND is_default = true
    );

    INSERT INTO public.income_categories (name, parent_id, is_default, organization_id)
    SELECT 'Missing Products', secondary_income_id, true, NULL
    WHERE NOT EXISTS (
        SELECT 1 FROM public.income_categories 
        WHERE name = 'Missing Products' AND parent_id = secondary_income_id AND is_default = true
    );
END $$;