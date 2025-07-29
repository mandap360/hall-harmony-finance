-- Add "Unallocated" subcategory under Secondary Income
INSERT INTO public.income_categories (name, description, is_default, parent_id)
SELECT 'Unallocated', 'Unallocated secondary income', true, id
FROM public.income_categories 
WHERE name = 'Secondary Income' AND is_default = true AND parent_id IS NULL;