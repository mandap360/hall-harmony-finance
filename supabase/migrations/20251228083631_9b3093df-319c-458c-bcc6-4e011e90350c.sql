-- Fix search_path for recalculate_account_balance
CREATE OR REPLACE FUNCTION public.recalculate_account_balance(account_id uuid)
RETURNS void AS $$
DECLARE
  acc_type text;
  calc_balance numeric;
  opening numeric;
BEGIN
  -- Get account type and opening balance
  SELECT account_type, opening_balance INTO acc_type, opening FROM public.accounts WHERE id = account_id;
  
  IF acc_type IN ('cash', 'bank') THEN
    -- For cash/bank: opening_balance + money_in - money_out
    SELECT opening + 
      COALESCE((SELECT SUM(amount) FROM public.transactions WHERE to_account_id = account_id), 0) -
      COALESCE((SELECT SUM(amount) FROM public.transactions WHERE from_account_id = account_id), 0)
    INTO calc_balance;
  ELSIF acc_type = 'party' THEN
    -- For parties: opening_balance + purchases - payments (what we owe them)
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Fix search_path for update_account_balance_on_transaction
CREATE OR REPLACE FUNCTION public.update_account_balance_on_transaction()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    IF NEW.party_id IS NOT NULL THEN
      PERFORM public.recalculate_account_balance(NEW.party_id);
    END IF;
    IF NEW.from_account_id IS NOT NULL THEN
      PERFORM public.recalculate_account_balance(NEW.from_account_id);
    END IF;
    IF NEW.to_account_id IS NOT NULL THEN
      PERFORM public.recalculate_account_balance(NEW.to_account_id);
    END IF;
  END IF;
  
  IF TG_OP = 'DELETE' OR TG_OP = 'UPDATE' THEN
    IF OLD.party_id IS NOT NULL THEN
      PERFORM public.recalculate_account_balance(OLD.party_id);
    END IF;
    IF OLD.from_account_id IS NOT NULL THEN
      PERFORM public.recalculate_account_balance(OLD.from_account_id);
    END IF;
    IF OLD.to_account_id IS NOT NULL THEN
      PERFORM public.recalculate_account_balance(OLD.to_account_id);
    END IF;
  END IF;
  
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Fix search_path for update_balance_on_opening_balance_change
CREATE OR REPLACE FUNCTION public.update_balance_on_opening_balance_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.opening_balance IS DISTINCT FROM NEW.opening_balance THEN
    PERFORM public.recalculate_account_balance(NEW.id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;