-- Add parent_id column to support subcategories
ALTER TABLE public.income_categories 
ADD COLUMN parent_id uuid REFERENCES income_categories(id) ON DELETE CASCADE;

ALTER TABLE public.expense_categories 
ADD COLUMN parent_id uuid REFERENCES expense_categories(id) ON DELETE CASCADE;

-- Add indexes for better performance
CREATE INDEX idx_income_categories_parent_id ON public.income_categories(parent_id);
CREATE INDEX idx_expense_categories_parent_id ON public.expense_categories(parent_id);