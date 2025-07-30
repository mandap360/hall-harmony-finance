-- Update existing income records where category is "Advance" but should be "Secondary Income"
-- First, get the category IDs we need
WITH category_ids AS (
  SELECT 
    (SELECT id FROM income_categories WHERE name = 'Secondary Income' AND is_default = true) as secondary_income_id,
    (SELECT id FROM income_categories WHERE name = 'Advance' AND is_default = true) as advance_id
)
UPDATE income 
SET category_id = (SELECT secondary_income_id FROM category_ids)
WHERE category_id = (SELECT advance_id FROM category_ids);

-- For each updated income record, create or update secondary_income table entry
-- This will handle the requirement to track allocations properly
INSERT INTO secondary_income (booking_id, amount, category_id, organization_id)
SELECT 
  i.booking_id,
  i.amount,
  (SELECT id FROM income_categories WHERE name = 'Advance' AND is_default = true),
  i.organization_id
FROM income i
WHERE i.category_id = (SELECT id FROM income_categories WHERE name = 'Secondary Income' AND is_default = true)
ON CONFLICT (booking_id, category_id) 
DO UPDATE SET amount = secondary_income.amount + EXCLUDED.amount;