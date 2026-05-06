
-- 1) Bookings: drop overly permissive "Enable ... for all users" policies
DROP POLICY IF EXISTS "Enable read access for all users" ON public."Bookings";
DROP POLICY IF EXISTS "Enable insert access for all users" ON public."Bookings";
DROP POLICY IF EXISTS "Enable update access for all users" ON public."Bookings";
DROP POLICY IF EXISTS "Enable delete access for all users" ON public."Bookings";

-- 2) SecondaryIncome: drop duplicate permissive policies, keep org-scoped ones
DROP POLICY IF EXISTS "Enable read access for all users" ON public."SecondaryIncome";
DROP POLICY IF EXISTS "Enable insert access for all users" ON public."SecondaryIncome";
DROP POLICY IF EXISTS "Enable update access for all users" ON public."SecondaryIncome";
DROP POLICY IF EXISTS "Enable delete access for all users" ON public."SecondaryIncome";
DROP POLICY IF EXISTS "Users can view additional income" ON public."SecondaryIncome";
DROP POLICY IF EXISTS "Users can insert additional income" ON public."SecondaryIncome";
DROP POLICY IF EXISTS "Users can update additional income" ON public."SecondaryIncome";
DROP POLICY IF EXISTS "Users can delete additional income" ON public."SecondaryIncome";

-- 3) Vendors: drop permissive duplicate policies
DROP POLICY IF EXISTS "Users can view vendors in their organization" ON public."Vendors";
DROP POLICY IF EXISTS "Users can create vendors" ON public."Vendors";
DROP POLICY IF EXISTS "Users can update vendors" ON public."Vendors";
DROP POLICY IF EXISTS "Users can delete vendors" ON public."Vendors";

-- 4) Add is_super_admin flag column to profiles (immutable, controlled via DB)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_super_admin boolean NOT NULL DEFAULT false;

-- Backfill: any existing admin in the legacy "Mandap360 Organization" becomes super admin
UPDATE public.profiles p
SET is_super_admin = true
WHERE p.role = 'admin'
  AND p.organization_id IN (
    SELECT id FROM public.organizations WHERE name = 'Mandap360 Organization'
  );

-- 5) Replace is_super_admin() to use the flag instead of organization name
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND is_super_admin = true
  );
$$;

-- 6) Restrict organization UPDATE to members of that organization (or super admins)
DROP POLICY IF EXISTS "Allow authenticated users to update organizations" ON public.organizations;

CREATE POLICY "Members can update their organization"
ON public.organizations
FOR UPDATE
TO authenticated
USING (
  id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid())
  OR public.is_super_admin()
)
WITH CHECK (
  id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid())
  OR public.is_super_admin()
);

-- 7) Fix mutable search_path on remaining functions
CREATE OR REPLACE FUNCTION public.migrate_advance_to_payments()
RETURNS void
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  INSERT INTO public.payments (booking_id, amount, payment_date, payment_type, description, organization_id)
  SELECT 
    id,
    advance,
    DATE(created_at),
    'advance',
    'Initial advance payment',
    organization_id
  FROM public.bookings 
  WHERE advance > 0
  AND NOT EXISTS (
    SELECT 1 FROM public.payments 
    WHERE booking_id = bookings.id AND payment_type = 'advance'
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.cleanup_deleted_records()
RETURNS void
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  DELETE FROM public.bookings 
  WHERE is_deleted = true 
  AND deleted_at < NOW() - INTERVAL '10 days';

  DELETE FROM public.expenses 
  WHERE is_deleted = true 
  AND deleted_at < NOW() - INTERVAL '10 days';
END;
$function$;
