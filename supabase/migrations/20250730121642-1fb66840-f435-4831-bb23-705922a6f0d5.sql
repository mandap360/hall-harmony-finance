-- First, let's add a unique constraint to secondary_income table to prevent duplicates
ALTER TABLE secondary_income 
ADD CONSTRAINT unique_booking_category UNIQUE (booking_id, category_id);

-- Update existing income records where category is "Advance" but should be "Secondary Income"
WITH category_ids AS (
  SELECT 
    (SELECT id FROM income_categories WHERE name = 'Secondary Income' AND is_default = true) as secondary_income_id,
    (SELECT id FROM income_categories WHERE name = 'Advance' AND is_default = true) as advance_id
)
UPDATE income 
SET category_id = (SELECT secondary_income_id FROM category_ids)
WHERE category_id = (SELECT advance_id FROM category_ids);

-- For each booking that has Secondary Income payments, create advance allocations in secondary_income table
INSERT INTO secondary_income (booking_id, amount, category_id, organization_id)
SELECT 
  i.booking_id,
  SUM(i.amount) as total_amount,
  (SELECT id FROM income_categories WHERE name = 'Advance' AND is_default = true),
  i.organization_id
FROM income i
WHERE i.category_id = (SELECT id FROM income_categories WHERE name = 'Secondary Income' AND is_default = true)
GROUP BY i.booking_id, i.organization_id
ON CONFLICT (booking_id, category_id) 
DO UPDATE SET amount = secondary_income.amount + EXCLUDED.amount;