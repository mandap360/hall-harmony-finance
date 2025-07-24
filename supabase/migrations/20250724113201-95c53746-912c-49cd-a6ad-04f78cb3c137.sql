-- Add back the missing default income categories
INSERT INTO public.income_categories (name, description, organization_id, is_default, parent_id) VALUES
('Rent', 'Rental income from properties', NULL, true, NULL),
('Secondary Income', 'Additional income sources', NULL, true, NULL);

-- Get the ID of Secondary Income to add Electricity as subcategory
-- This will be done in a separate insert after we have the parent ID
DO $$
DECLARE
    secondary_income_id UUID;
BEGIN
    -- Get the Secondary Income category ID
    SELECT id INTO secondary_income_id 
    FROM public.income_categories 
    WHERE name = 'Secondary Income' AND organization_id IS NULL;
    
    -- Insert Electricity as subcategory of Secondary Income
    IF secondary_income_id IS NOT NULL THEN
        INSERT INTO public.income_categories (name, description, organization_id, is_default, parent_id) VALUES
        ('Electricity', 'Electricity bill reimbursements or allowances', NULL, true, secondary_income_id);
    END IF;
END $$;