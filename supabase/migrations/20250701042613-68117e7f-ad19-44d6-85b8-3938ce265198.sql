
-- Just update the existing handle_new_user function to use the correct enum value
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  INSERT INTO public.profiles (id, business_name, phone_number, email, email_verified, full_name, organization_id, role)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'business_name',
    NEW.raw_user_meta_data->>'phone_number',
    NEW.email,
    NEW.email_confirmed_at IS NOT NULL,
    NEW.raw_user_meta_data->>'full_name',
    gen_random_uuid(), -- Create a unique organization for each user
    'manager'::user_role  -- Use 'manager' instead of 'admin' since that's the default in the schema
  );
  RETURN NEW;
END;
$function$;
