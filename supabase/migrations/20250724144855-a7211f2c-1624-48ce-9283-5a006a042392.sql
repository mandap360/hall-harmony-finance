-- Add organization_id field to expense_categories table to match income_categories
ALTER TABLE public.expense_categories 
ADD COLUMN organization_id UUID REFERENCES public.organizations(id);

-- Add is_default field to expense_categories table
ALTER TABLE public.expense_categories 
ADD COLUMN is_default BOOLEAN DEFAULT false;

-- Update existing default expense categories to have is_default = true and organization_id = null
UPDATE public.expense_categories 
SET is_default = true, organization_id = null 
WHERE name IN (
  'Electricity', 
  'Gas', 
  'Wages & Salary', 
  'Maintenance & Repairs', 
  'Cleaning & Housekeeping', 
  'Internet Charges', 
  'Licensing & Registration Fees', 
  'Software Subscription'
);