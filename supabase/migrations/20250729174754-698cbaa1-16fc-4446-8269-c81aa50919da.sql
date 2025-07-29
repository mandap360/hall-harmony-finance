-- Update payments that are using Secondary Income parent category to use Advance subcategory instead
UPDATE payments 
SET category_id = 'a7732c5b-9d7e-4cdc-9ccb-56616b587289'  -- Advance subcategory ID
WHERE category_id = '30080457-218b-470e-a5fb-9e22957343a7'  -- Secondary Income parent ID
AND EXISTS (
    SELECT 1 FROM bookings b 
    WHERE b.id = payments.booking_id
);