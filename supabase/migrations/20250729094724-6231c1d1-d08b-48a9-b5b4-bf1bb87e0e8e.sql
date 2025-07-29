-- Update "Unallocated" subcategory under "Secondary Income" to "Advance"
UPDATE income_categories 
SET name = 'Advance',
    description = 'Advance payments received from clients'
WHERE name = 'Unallocated' 
AND parent_id = (
    SELECT id 
    FROM income_categories 
    WHERE name = 'Secondary Income' 
    AND parent_id IS NULL
);