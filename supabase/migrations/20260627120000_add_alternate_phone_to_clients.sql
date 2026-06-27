ALTER TABLE public."Clients"
  ADD COLUMN IF NOT EXISTS alternate_phone_number TEXT;
