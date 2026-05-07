
-- 1) Prevent privilege escalation via profile self-update
CREATE OR REPLACE FUNCTION public.prevent_profile_privilege_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only enforce for non-super-admin callers updating their own row
  IF auth.uid() = OLD.id AND NOT public.is_super_admin() THEN
    IF NEW.is_super_admin IS DISTINCT FROM OLD.is_super_admin THEN
      RAISE EXCEPTION 'Not allowed to modify is_super_admin';
    END IF;
    IF NEW.organization_id IS DISTINCT FROM OLD.organization_id THEN
      RAISE EXCEPTION 'Not allowed to change organization_id';
    END IF;
    IF NEW.role IS DISTINCT FROM OLD.role THEN
      RAISE EXCEPTION 'Not allowed to change role';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS prevent_profile_privilege_escalation_trg ON public.profiles;
CREATE TRIGGER prevent_profile_privilege_escalation_trg
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.prevent_profile_privilege_escalation();

-- 2) Restrict business-table policies to authenticated role
DO $$
DECLARE
  r record;
BEGIN
  FOR r IN
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN (
        'Bookings','SecondaryIncome','Vendors','AccountCategories','Accounts',
        'BillAllocations','IncomeAllocations','Clients','Transactions','Bills',
        'profiles'
      )
      AND 'public' = ANY(roles)
  LOOP
    EXECUTE format('ALTER POLICY %I ON public.%I TO authenticated',
                   r.policyname, r.tablename);
  END LOOP;
END$$;
