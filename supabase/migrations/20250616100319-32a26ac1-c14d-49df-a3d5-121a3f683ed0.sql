
-- Create expense_categories table for managing expense categories
CREATE TABLE public.expense_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert some default expense categories
INSERT INTO public.expense_categories (name, description) VALUES 
('Electricity', 'Electricity bills and charges'),
('Gas', 'Gas bills and charges'),
('Maintenance', 'General maintenance and repairs'),
('Cleaning', 'Cleaning services and supplies'),
('Security', 'Security services and equipment'),
('Insurance', 'Insurance premiums and policies'),
('Staff', 'Staff salaries and benefits'),
('Marketing', 'Marketing and advertising expenses'),
('Office Supplies', 'Office supplies and stationery'),
('Transportation', 'Transportation and fuel costs');

-- Create expenses table
CREATE TABLE public.expenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_name TEXT NOT NULL,
  bill_number TEXT NOT NULL,
  category_id UUID REFERENCES public.expense_categories(id) NOT NULL,
  amount NUMERIC NOT NULL,
  includes_gst BOOLEAN NOT NULL DEFAULT false,
  gst_percentage NUMERIC DEFAULT 0,
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.expense_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- Create policies for expense_categories (public read, no auth required for now)
CREATE POLICY "Anyone can view expense categories" 
  ON public.expense_categories 
  FOR SELECT 
  USING (true);

-- Create policies for expenses (public access for now)
CREATE POLICY "Anyone can view expenses" 
  ON public.expenses 
  FOR SELECT 
  USING (true);

CREATE POLICY "Anyone can create expenses" 
  ON public.expenses 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Anyone can update expenses" 
  ON public.expenses 
  FOR UPDATE 
  USING (true);

CREATE POLICY "Anyone can delete expenses" 
  ON public.expenses 
  FOR DELETE 
  USING (true);

-- Add constraint to ensure unique income category per booking in additional_income
ALTER TABLE public.additional_income 
ADD CONSTRAINT unique_category_per_booking 
UNIQUE (booking_id, category);
