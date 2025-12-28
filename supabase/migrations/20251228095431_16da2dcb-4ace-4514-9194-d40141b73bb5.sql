-- Fix the recalculate_account_balance function to use correct account_type value
CREATE OR REPLACE FUNCTION public.recalculate_account_balance(account_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  acc_type text;
  acc_sub_type text;
  calc_balance numeric;
  opening numeric;
BEGIN
  -- Get account type, sub_type, and opening balance
  SELECT account_type, sub_type, opening_balance INTO acc_type, acc_sub_type, opening FROM public.accounts WHERE id = account_id;
  
  IF acc_type = 'cash_bank' THEN
    -- For cash/bank: opening_balance + money_in - money_out
    SELECT opening + 
      COALESCE((SELECT SUM(amount) FROM public.transactions WHERE to_account_id = account_id), 0) -
      COALESCE((SELECT SUM(amount) FROM public.transactions WHERE from_account_id = account_id), 0)
    INTO calc_balance;
  ELSIF acc_type = 'party' THEN
    -- For parties: opening_balance + purchases - payments - sales + receipts (what we owe them)
    SELECT opening + 
      COALESCE((SELECT SUM(amount) FROM public.transactions WHERE party_id = account_id AND voucher_type = 'purchase'), 0) -
      COALESCE((SELECT SUM(amount) FROM public.transactions WHERE party_id = account_id AND voucher_type = 'payment'), 0) -
      COALESCE((SELECT SUM(amount) FROM public.transactions WHERE party_id = account_id AND voucher_type = 'sales'), 0) +
      COALESCE((SELECT SUM(amount) FROM public.transactions WHERE party_id = account_id AND voucher_type = 'receipt'), 0)
    INTO calc_balance;
  ELSE
    calc_balance := opening;
  END IF;
  
  UPDATE public.accounts SET balance = COALESCE(calc_balance, opening), updated_at = now() WHERE id = account_id;
END;
$function$;