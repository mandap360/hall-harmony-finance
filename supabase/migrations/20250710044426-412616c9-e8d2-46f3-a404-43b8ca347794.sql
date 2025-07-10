-- Add organization_id to accounts table
ALTER TABLE public.accounts ADD COLUMN organization_id UUID REFERENCES public.organizations(id);

-- Update existing accounts with a default organization (first one found)
UPDATE public.accounts 
SET organization_id = (SELECT id FROM public.organizations LIMIT 1)
WHERE organization_id IS NULL;

-- Make organization_id NOT NULL after populating
ALTER TABLE public.accounts ALTER COLUMN organization_id SET NOT NULL;

-- Add RLS policies for accounts organization isolation
DROP POLICY IF EXISTS "Allow all operations on accounts" ON public.accounts;

CREATE POLICY "Users can view their organization accounts"
ON public.accounts
FOR SELECT
USING (organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can create accounts for their organization"
ON public.accounts
FOR INSERT
WITH CHECK (organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can update their organization accounts"
ON public.accounts
FOR UPDATE
USING (organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can delete their organization accounts"
ON public.accounts
FOR DELETE
USING (organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid()));