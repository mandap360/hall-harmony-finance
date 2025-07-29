-- Update all existing payment descriptions to follow the new format: "{CategoryName} for {DateRange}"

UPDATE payments 
SET description = CASE 
  WHEN ic.parent_id IS NOT NULL THEN 
    CONCAT(pic.name, ' - ', ic.name, ' for ', 
           CASE 
             WHEN DATE(b.start_datetime) = DATE(b.end_datetime) THEN 
               TO_CHAR(b.start_datetime, 'DD Mon YYYY')
             ELSE 
               CONCAT(TO_CHAR(b.start_datetime, 'DD Mon YYYY'), ' - ', TO_CHAR(b.end_datetime, 'DD Mon YYYY'))
           END)
  ELSE 
    CONCAT(ic.name, ' for ', 
           CASE 
             WHEN DATE(b.start_datetime) = DATE(b.end_datetime) THEN 
               TO_CHAR(b.start_datetime, 'DD Mon YYYY')
             ELSE 
               CONCAT(TO_CHAR(b.start_datetime, 'DD Mon YYYY'), ' - ', TO_CHAR(b.end_datetime, 'DD Mon YYYY'))
           END)
END
FROM bookings b,
     income_categories ic
LEFT JOIN income_categories pic ON ic.parent_id = pic.id
WHERE payments.booking_id = b.id 
AND payments.category_id = ic.id 
AND payments.category_id IS NOT NULL;