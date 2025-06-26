
-- Update the bookings table to rename advance column to rent_received
ALTER TABLE bookings RENAME COLUMN advance TO rent_received;

-- Update the bookings table to rename total_rent column to rent_finalized  
ALTER TABLE bookings RENAME COLUMN total_rent TO rent_finalized;
