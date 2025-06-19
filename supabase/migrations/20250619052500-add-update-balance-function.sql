
-- Create function to update account balance
CREATE OR REPLACE FUNCTION public.update_account_balance(
  account_uuid UUID,
  amount_change NUMERIC
)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.accounts 
  SET balance = balance + amount_change,
      updated_at = now()
  WHERE id = account_uuid;
END;
$$;
