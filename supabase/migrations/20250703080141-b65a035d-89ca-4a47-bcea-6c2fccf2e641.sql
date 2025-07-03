
-- Fix the handle_new_user function with proper search path
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER SET search_path = 'public'
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
    'manager'::user_role  -- Now this should work with the proper search path
  );
  RETURN NEW;
END;
$function$;

-- Ensure the trigger exists and is active
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
