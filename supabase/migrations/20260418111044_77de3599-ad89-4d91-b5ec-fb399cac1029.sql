-- =========================================================================
-- STEP 1: Drop dependent triggers and functions tied to old transactions
-- =========================================================================
DROP TRIGGER IF EXISTS trg_update_account_balance_on_transaction ON public.transactions;
DROP TRIGGER IF EXISTS update_account_balance_on_transaction ON public.transactions;
DROP TRIGGER IF EXISTS trg_update_balance_on_opening_balance_change ON public.accounts;
DROP TRIGGER IF EXISTS update_balance_on_opening_balance_change ON public.accounts;
DROP FUNCTION IF EXISTS public.update_account_balance_on_transaction() CASCADE;
DROP FUNCTION IF EXISTS public.update_balance_on_opening_balance_change() CASCADE;
DROP FUNCTION IF EXISTS public.recalculate_account_balance(uuid) CASCADE;

-- =========================================================================
-- STEP 2: Drop the old transactions table entirely (user approved data loss)
-- =========================================================================
DROP TABLE IF EXISTS public.transactions CASCADE;

-- =========================================================================
-- STEP 3: Drop old category tables (replaced by AccountCategories)
-- =========================================================================
DROP TABLE IF EXISTS public.expense_categories CASCADE;
DROP TABLE IF EXISTS public.income_categories CASCADE;

-- =========================================================================
-- STEP 4: Rename existing tables to PascalCase
-- =========================================================================
ALTER TABLE public.bookings RENAME TO "Bookings";
ALTER TABLE public.vendors RENAME TO "Vendors";
ALTER TABLE public.accounts RENAME TO "Accounts";
ALTER TABLE public.secondary_income RENAME TO "SecondaryIncome";

-- =========================================================================
-- STEP 5: Modify Vendors table
-- =========================================================================
ALTER TABLE public."Vendors" RENAME COLUMN id TO vendor_id;
ALTER TABLE public."Vendors" RENAME COLUMN business_name TO name;
ALTER TABLE public."Vendors" DROP COLUMN IF EXISTS contact_person;
ALTER TABLE public."Vendors" ADD COLUMN current_balance NUMERIC NOT NULL DEFAULT 0;

-- =========================================================================
-- STEP 6: Modify Accounts table
-- =========================================================================
ALTER TABLE public."Accounts" DROP COLUMN IF EXISTS balance;
ALTER TABLE public."Accounts" DROP COLUMN IF EXISTS sub_type;
ALTER TABLE public."Accounts" DROP COLUMN IF EXISTS gstin;
ALTER TABLE public."Accounts" DROP COLUMN IF EXISTS phone_number;
ALTER TABLE public."Accounts" DROP COLUMN IF EXISTS address;
ALTER TABLE public."Accounts" RENAME COLUMN opening_balance TO initial_balance;

-- =========================================================================
-- STEP 7: Create Clients table
-- =========================================================================
CREATE TABLE public."Clients" (
  client_id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone_number TEXT,
  email TEXT,
  address TEXT,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =========================================================================
-- STEP 8: Modify Bookings table - add client_id, drop client_name & phone_number
-- =========================================================================
ALTER TABLE public."Bookings" ADD COLUMN client_id UUID REFERENCES public."Clients"(client_id) ON DELETE SET NULL;
ALTER TABLE public."Bookings" DROP COLUMN IF EXISTS client_name;
ALTER TABLE public."Bookings" DROP COLUMN IF EXISTS phone_number;

-- =========================================================================
-- STEP 9: Create AccountCategories table
-- =========================================================================
CREATE TYPE public.account_category_type AS ENUM ('income', 'expense');

CREATE TABLE public."AccountCategories" (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type public.account_category_type NOT NULL,
  is_secondary_income BOOLEAN NOT NULL DEFAULT false,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =========================================================================
-- STEP 10: Update SecondaryIncome to reference AccountCategories
-- (category_id column already exists; FK was to income_categories which is dropped via CASCADE)
-- =========================================================================
ALTER TABLE public."SecondaryIncome"
  ADD CONSTRAINT secondary_income_category_id_fkey
  FOREIGN KEY (category_id) REFERENCES public."AccountCategories"(id) ON DELETE SET NULL;

-- =========================================================================
-- STEP 11: Create new Transactions table from scratch
-- =========================================================================
CREATE TYPE public.transaction_type AS ENUM ('Income', 'Expense', 'Refund', 'Advance Paid', 'Transfer');
CREATE TYPE public.transaction_status AS ENUM ('Available', 'Partially Allocated', 'Fully Allocated', 'Void');

CREATE TABLE public."Transactions" (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type public.transaction_type NOT NULL,
  amount NUMERIC NOT NULL,
  from_account_id UUID REFERENCES public."Accounts"(id) ON DELETE SET NULL,
  to_account_id UUID REFERENCES public."Accounts"(id) ON DELETE SET NULL,
  booking_id UUID REFERENCES public."Bookings"(id) ON DELETE SET NULL,
  entity_id UUID, -- references either vendor_id or client_id (no FK because it can be either)
  transaction_date DATE NOT NULL,
  description TEXT,
  transaction_status public.transaction_status NOT NULL DEFAULT 'Available',
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =========================================================================
-- STEP 12: Create Bills table
-- =========================================================================
CREATE TYPE public.bill_status AS ENUM ('unpaid', 'partial', 'paid');

CREATE TABLE public."Bills" (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id UUID NOT NULL REFERENCES public."Vendors"(vendor_id) ON DELETE CASCADE,
  bill_number TEXT,
  category_id UUID REFERENCES public."AccountCategories"(id) ON DELETE SET NULL,
  date DATE NOT NULL,
  amount NUMERIC NOT NULL,
  status public.bill_status NOT NULL DEFAULT 'unpaid',
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =========================================================================
-- STEP 13: Create BillAllocations table
-- =========================================================================
CREATE TABLE public."BillAllocations" (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_id UUID NOT NULL REFERENCES public."Transactions"(id) ON DELETE CASCADE,
  bill_id UUID NOT NULL REFERENCES public."Bills"(id) ON DELETE CASCADE,
  amount_applied NUMERIC NOT NULL,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE
);

-- =========================================================================
-- STEP 14: Create IncomeAllocations table
-- =========================================================================
CREATE TABLE public."IncomeAllocations" (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_id UUID NOT NULL REFERENCES public."Transactions"(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public."AccountCategories"(id) ON DELETE SET NULL,
  amount NUMERIC NOT NULL,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =========================================================================
-- STEP 15: Enable RLS on all new/renamed tables
-- =========================================================================
ALTER TABLE public."Clients" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."AccountCategories" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Transactions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Bills" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."BillAllocations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."IncomeAllocations" ENABLE ROW LEVEL SECURITY;

-- =========================================================================
-- STEP 16: RLS policies for Clients
-- =========================================================================
CREATE POLICY "Users can view their organization clients"
  ON public."Clients" FOR SELECT
  USING (organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can create clients for their organization"
  ON public."Clients" FOR INSERT
  WITH CHECK (organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can update their organization clients"
  ON public."Clients" FOR UPDATE
  USING (organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can delete their organization clients"
  ON public."Clients" FOR DELETE
  USING (organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

-- =========================================================================
-- STEP 17: RLS policies for AccountCategories
-- =========================================================================
CREATE POLICY "Users can view their org or default categories"
  ON public."AccountCategories" FOR SELECT
  USING (
    organization_id IS NULL
    OR organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY "Users can create categories for their organization"
  ON public."AccountCategories" FOR INSERT
  WITH CHECK (organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can update their organization categories"
  ON public."AccountCategories" FOR UPDATE
  USING (organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can delete their organization categories"
  ON public."AccountCategories" FOR DELETE
  USING (organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

-- =========================================================================
-- STEP 18: RLS policies for Transactions
-- =========================================================================
CREATE POLICY "Users can view their organization transactions"
  ON public."Transactions" FOR SELECT
  USING (organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can create transactions for their organization"
  ON public."Transactions" FOR INSERT
  WITH CHECK (organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can update their organization transactions"
  ON public."Transactions" FOR UPDATE
  USING (organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can delete their organization transactions"
  ON public."Transactions" FOR DELETE
  USING (organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

-- =========================================================================
-- STEP 19: RLS policies for Bills
-- =========================================================================
CREATE POLICY "Users can view their organization bills"
  ON public."Bills" FOR SELECT
  USING (organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can create bills for their organization"
  ON public."Bills" FOR INSERT
  WITH CHECK (organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can update their organization bills"
  ON public."Bills" FOR UPDATE
  USING (organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can delete their organization bills"
  ON public."Bills" FOR DELETE
  USING (organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

-- =========================================================================
-- STEP 20: RLS policies for BillAllocations
-- =========================================================================
CREATE POLICY "Users can view their organization bill allocations"
  ON public."BillAllocations" FOR SELECT
  USING (organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can create bill allocations for their organization"
  ON public."BillAllocations" FOR INSERT
  WITH CHECK (organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can update their organization bill allocations"
  ON public."BillAllocations" FOR UPDATE
  USING (organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can delete their organization bill allocations"
  ON public."BillAllocations" FOR DELETE
  USING (organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

-- =========================================================================
-- STEP 21: RLS policies for IncomeAllocations
-- =========================================================================
CREATE POLICY "Users can view their organization income allocations"
  ON public."IncomeAllocations" FOR SELECT
  USING (organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can create income allocations for their organization"
  ON public."IncomeAllocations" FOR INSERT
  WITH CHECK (organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can update their organization income allocations"
  ON public."IncomeAllocations" FOR UPDATE
  USING (organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can delete their organization income allocations"
  ON public."IncomeAllocations" FOR DELETE
  USING (organization_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

-- =========================================================================
-- STEP 22: Indexes for performance
-- =========================================================================
CREATE INDEX idx_bookings_client_id ON public."Bookings"(client_id);
CREATE INDEX idx_transactions_from_account ON public."Transactions"(from_account_id);
CREATE INDEX idx_transactions_to_account ON public."Transactions"(to_account_id);
CREATE INDEX idx_transactions_booking ON public."Transactions"(booking_id);
CREATE INDEX idx_transactions_entity ON public."Transactions"(entity_id);
CREATE INDEX idx_transactions_date ON public."Transactions"(transaction_date);
CREATE INDEX idx_bills_vendor ON public."Bills"(vendor_id);
CREATE INDEX idx_billallocations_transaction ON public."BillAllocations"(transaction_id);
CREATE INDEX idx_billallocations_bill ON public."BillAllocations"(bill_id);
CREATE INDEX idx_incomeallocations_transaction ON public."IncomeAllocations"(transaction_id);

-- =========================================================================
-- STEP 23: updated_at triggers for new tables
-- =========================================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON public."Clients"
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON public."Transactions"
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bills_updated_at BEFORE UPDATE ON public."Bills"
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();