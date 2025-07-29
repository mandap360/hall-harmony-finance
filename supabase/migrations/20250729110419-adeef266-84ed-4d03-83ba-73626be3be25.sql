-- Fix the refund category lookup and rename unallocated to Advance

-- 1. Update the booking refund logic to use the new "Refund - Cancellation" category name
-- (The code will need to be updated separately)

-- 2. Rename "unallocated" to "Advance" in income categories
UPDATE income_categories 
SET name = 'Advance',
    description = 'Advance payments received from clients'
WHERE name = 'unallocated';

-- 3. Also ensure "Advance" has "Secondary Income" as parent if it doesn't already
UPDATE income_categories 
SET parent_id = (
    SELECT id 
    FROM income_categories 
    WHERE name = 'Secondary Income' 
    AND parent_id IS NULL
    LIMIT 1
)
WHERE name = 'Advance' 
AND parent_id IS NULL;