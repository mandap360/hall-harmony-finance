-- Update existing payment records to rename 'additional' to 'Secondary Income'
UPDATE payments 
SET payment_type = 'Secondary Income' 
WHERE payment_type = 'additional';

-- Update any additional_income table entries to use 'Secondary Income' category
UPDATE additional_income 
SET category = REPLACE(category, 'Additional', 'Secondary Income')
WHERE category LIKE '%Additional%';