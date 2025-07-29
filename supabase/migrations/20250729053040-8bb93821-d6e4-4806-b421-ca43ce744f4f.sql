-- Update all existing payment descriptions to use the new format: "Parent Category - Child Category"
UPDATE payments 
SET description = CASE
  WHEN parent_category.name IS NOT NULL THEN 
    parent_category.name || ' - ' || category.name || ' for ' || 
    CASE 
      WHEN DATE(b.start_datetime) = DATE(b.end_datetime) THEN
        TO_CHAR(b.start_datetime, 'DD Mon YYYY')
      ELSE
        TO_CHAR(b.start_datetime, 'DD Mon YYYY') || ' - ' || TO_CHAR(b.end_datetime, 'DD Mon YYYY')
    END
  ELSE
    category.name || ' for ' || 
    CASE 
      WHEN DATE(b.start_datetime) = DATE(b.end_datetime) THEN
        TO_CHAR(b.start_datetime, 'DD Mon YYYY')
      ELSE
        TO_CHAR(b.start_datetime, 'DD Mon YYYY') || ' - ' || TO_CHAR(b.end_datetime, 'DD Mon YYYY')
    END
END
FROM bookings b
JOIN income_categories category ON payments.category_id = category.id
LEFT JOIN income_categories parent_category ON category.parent_id = parent_category.id
WHERE payments.booking_id = b.id
AND payments.category_id IS NOT NULL;