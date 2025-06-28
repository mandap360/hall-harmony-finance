
-- Add missing RLS policies for expense_categories table to allow full CRUD operations

-- Create policy for inserting expense categories (anyone can create)
CREATE POLICY "Anyone can create expense categories" 
  ON public.expense_categories 
  FOR INSERT 
  WITH CHECK (true);

-- Create policy for updating expense categories (anyone can update)
CREATE POLICY "Anyone can update expense categories" 
  ON public.expense_categories 
  FOR UPDATE 
  USING (true);

-- Create policy for deleting expense categories (anyone can delete)
CREATE POLICY "Anyone can delete expense categories" 
  ON public.expense_categories 
  FOR DELETE 
  USING (true);
