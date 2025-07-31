-- Update advance amount for the 23 Aug booking to be secondary_income - total_allocations
WITH booking_data AS (
  SELECT 
    b.id as booking_id,
    b.secondary_income,
    b.organization_id,
    -- Total allocations (excluding advance)
    COALESCE(SUM(CASE WHEN ic.name != 'Advance' THEN si.amount ELSE 0 END), 0) as total_allocations,
    -- What advance should be
    b.secondary_income - COALESCE(SUM(CASE WHEN ic.name != 'Advance' THEN si.amount ELSE 0 END), 0) as correct_advance,
    -- Get advance category ID
    (SELECT id FROM income_categories WHERE name = 'Advance' AND parent_id = (SELECT id FROM income_categories WHERE name = 'Secondary Income' AND parent_id IS NULL) LIMIT 1) as advance_category_id
  FROM bookings b
  LEFT JOIN secondary_income si ON b.id = si.booking_id
  LEFT JOIN income_categories ic ON si.category_id = ic.id
  WHERE b.id = 'd5d3bc2c-7ff2-4aef-9ef6-fad44944075e'
  GROUP BY b.id, b.secondary_income, b.organization_id
),
advance_update AS (
  UPDATE secondary_income 
  SET amount = bd.correct_advance
  FROM booking_data bd
  WHERE secondary_income.booking_id = bd.booking_id 
    AND secondary_income.category_id = bd.advance_category_id
  RETURNING secondary_income.id, secondary_income.amount
)
SELECT 'Updated advance for booking d5d3bc2c-7ff2-4aef-9ef6-fad44944075e' as result;