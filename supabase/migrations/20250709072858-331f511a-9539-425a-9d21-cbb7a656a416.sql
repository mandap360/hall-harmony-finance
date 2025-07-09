-- Update existing expenses to have organization_id populated
-- This ensures proper organization isolation for existing data
UPDATE public.expenses 
SET organization_id = (
  SELECT organization_id 
  FROM public.profiles 
  WHERE profiles.id = (
    SELECT id 
    FROM auth.users 
    LIMIT 1
  )
)
WHERE organization_id IS NULL;

-- Update existing additional_income records to have organization_id
UPDATE public.additional_income 
SET organization_id = (
  SELECT organization_id 
  FROM public.profiles 
  WHERE profiles.id = (
    SELECT id 
    FROM auth.users 
    LIMIT 1
  )
)
WHERE organization_id IS NULL;