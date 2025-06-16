
-- Create organizations table
CREATE TABLE public.organizations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create user roles enum
CREATE TYPE public.user_role AS ENUM ('admin', 'manager');

-- Create profiles table for users
CREATE TABLE public.profiles (
  id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  role user_role NOT NULL DEFAULT 'manager',
  full_name text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Add organization_id to existing tables
ALTER TABLE public.bookings ADD COLUMN organization_id uuid REFERENCES public.organizations(id);
ALTER TABLE public.expenses ADD COLUMN organization_id uuid REFERENCES public.organizations(id);
ALTER TABLE public.additional_income ADD COLUMN organization_id uuid REFERENCES public.organizations(id);

-- Update balance_payments to store all payments with better structure
ALTER TABLE public.balance_payments ADD COLUMN payment_type text DEFAULT 'balance';
ALTER TABLE public.balance_payments ADD COLUMN organization_id uuid REFERENCES public.organizations(id);

-- Update expenses table for CGST/SGST
ALTER TABLE public.expenses DROP COLUMN includes_gst;
ALTER TABLE public.expenses ADD COLUMN cgst_percentage numeric DEFAULT 0;
ALTER TABLE public.expenses ADD COLUMN sgst_percentage numeric DEFAULT 0;
ALTER TABLE public.expenses ADD COLUMN cgst_amount numeric DEFAULT 0;
ALTER TABLE public.expenses ADD COLUMN sgst_amount numeric DEFAULT 0;
ALTER TABLE public.expenses ADD COLUMN total_amount numeric DEFAULT 0;

-- Enable RLS on all tables
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.additional_income ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.balance_payments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their organization" ON public.organizations FOR SELECT USING (
  id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid())
);

CREATE POLICY "Users can view their profile" ON public.profiles FOR SELECT USING (id = auth.uid());

CREATE POLICY "Users can view org bookings" ON public.bookings FOR SELECT USING (
  organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid())
);

CREATE POLICY "Admins can manage bookings" ON public.bookings FOR ALL USING (
  organization_id IN (
    SELECT organization_id FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Managers can insert payments" ON public.balance_payments FOR INSERT WITH CHECK (
  organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid())
);

CREATE POLICY "Users can view org payments" ON public.balance_payments FOR SELECT USING (
  organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid())
);

CREATE POLICY "Users can view org expenses" ON public.expenses FOR SELECT USING (
  organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid())
);

CREATE POLICY "Admins can manage expenses" ON public.expenses FOR ALL USING (
  organization_id IN (
    SELECT organization_id FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  org_id uuid;
BEGIN
  -- Create organization if it doesn't exist
  IF NEW.raw_user_meta_data->>'organization_name' IS NOT NULL THEN
    INSERT INTO public.organizations (name)
    VALUES (NEW.raw_user_meta_data->>'organization_name')
    RETURNING id INTO org_id;
  END IF;

  -- Insert profile
  INSERT INTO public.profiles (id, organization_id, role, full_name)
  VALUES (
    NEW.id,
    org_id,
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'admin'),
    NEW.raw_user_meta_data->>'full_name'
  );

  RETURN NEW;
END;
$$;

-- Create trigger for new users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
