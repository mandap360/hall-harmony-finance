-- 1. Rename "Booking Cancellation" to "Refund - Cancellation" and set parent_id to null
UPDATE income_categories 
SET name = 'Refund - Cancellation',
    parent_id = NULL,
    description = 'Refunds issued for cancelled bookings'
WHERE name = 'Booking Cancellation';

-- 2. Update existing "Refund" category to have "Secondary Income" as parent
UPDATE income_categories 
SET parent_id = (
        SELECT id 
        FROM income_categories 
        WHERE name = 'Secondary Income' 
        AND parent_id IS NULL
    ),
    description = 'General refunds and excess advance returns'
WHERE name = 'Refund';

-- 3. Update payment descriptions based on category changes
UPDATE payments 
SET description = REPLACE(description, 'Booking Cancellation', 'Refund - Cancellation')
WHERE description LIKE '%Booking Cancellation%';

UPDATE payments 
SET description = REPLACE(description, 'Excess Advance', 'Refund')
WHERE description LIKE '%Excess Advance%';