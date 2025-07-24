-- Add the missing default income categories
INSERT INTO public.income_categories (name, description, organization_id, is_default, parent_id) VALUES
('Rent', 'Rental income from properties', NULL, true, NULL),
('Electricity', 'Electricity bill reimbursements or allowances', NULL, true, '30080457-218b-470e-a5fb-9e22957343a7');