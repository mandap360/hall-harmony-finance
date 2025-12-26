-- Add dedicated columns for party-specific fields
ALTER TABLE public.accounts 
ADD COLUMN gstin text,
ADD COLUMN phone_number text,
ADD COLUMN address text;