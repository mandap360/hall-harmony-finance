
-- Restrict org creation to super admins (prevents abuse: any user creating unlimited orgs)
DROP POLICY IF EXISTS "Authenticated users can create organizations" ON public.organizations;

CREATE POLICY "Super admins can create organizations"
ON public.organizations
FOR INSERT
TO authenticated
WITH CHECK (public.is_super_admin());

-- Revoke EXECUTE on internal SECURITY DEFINER functions from anon/authenticated
REVOKE EXECUTE ON FUNCTION public.is_super_admin() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.migrate_advance_to_payments() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.cleanup_deleted_records() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM anon, authenticated, public;
