
-- Fix the handle_new_user function to properly create organization first
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER SET search_path = 'public'
AS $function$
DECLARE
  new_org_id uuid;
BEGIN
  -- Create a new organization first
  INSERT INTO public.organizations (name)
  VALUES (COALESCE(NEW.raw_user_meta_data->>'business_name', 'My Organization'))
  RETURNING id INTO new_org_id;
  
  -- Then create the profile with the valid organization_id
  INSERT INTO public.profiles (id, business_name, phone_number, email, email_verified, full_name, organization_id, role)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'business_name',
    NEW.raw_user_meta_data->>'phone_number',
    NEW.email,
    NEW.email_confirmed_at IS NOT NULL,
    NEW.raw_user_meta_data->>'full_name',
    new_org_id,
    'manager'::user_role
  );
  RETURN NEW;
END;
$function$;
