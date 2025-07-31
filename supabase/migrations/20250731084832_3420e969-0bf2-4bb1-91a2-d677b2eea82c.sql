-- Update the advance amount in secondary_income table for August 23rd function to match total secondary income
UPDATE secondary_income 
SET amount = 988
WHERE id = '7cb1d34d-a3ca-4460-9eba-df964b0d52dc'
AND booking_id = 'd5d3bc2c-7ff2-4aef-9ef6-fad44944075e';