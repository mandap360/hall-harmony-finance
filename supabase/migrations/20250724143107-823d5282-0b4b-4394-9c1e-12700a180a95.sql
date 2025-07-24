-- Add default expense categories
INSERT INTO public.expense_categories (name, description, parent_id) VALUES
('Electricity', 'Electricity expenses', NULL),
('Gas', 'Gas expenses', NULL),
('Wages & Salary', 'Employee wages and salary payments', NULL),
('Maintenance & Repairs', 'Maintenance and repair expenses', NULL),
('Cleaning & Housekeeping', 'Cleaning and housekeeping expenses', NULL),
('Internet Charges', 'Internet and connectivity charges', NULL),
('Licensing & Registration Fees', 'Licensing and registration fee expenses', NULL),
('Software Subscription', 'Software subscription expenses', NULL);

-- Rename additional_income table to secondary_income
ALTER TABLE public.additional_income RENAME TO secondary_income;