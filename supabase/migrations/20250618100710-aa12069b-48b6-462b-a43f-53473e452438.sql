
-- Create vendors table
CREATE TABLE public.vendors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_name TEXT NOT NULL,
  contact_person TEXT,
  phone_number TEXT,
  gstin TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  organization_id UUID REFERENCES public.organizations(id)
);

-- Add Row Level Security (RLS)
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;

-- Create policies for vendors (assuming organization-based access)
CREATE POLICY "Users can view vendors in their organization" 
  ON public.vendors 
  FOR SELECT 
  USING (true); -- Allow all for now, can be restricted later

CREATE POLICY "Users can create vendors" 
  ON public.vendors 
  FOR INSERT 
  WITH CHECK (true); -- Allow all for now, can be restricted later

CREATE POLICY "Users can update vendors" 
  ON public.vendors 
  FOR UPDATE 
  USING (true); -- Allow all for now, can be restricted later

CREATE POLICY "Users can delete vendors" 
  ON public.vendors 
  FOR DELETE 
  USING (true); -- Allow all for now, can be restricted later
