-- Drop unused SecondaryIncome table
-- This table is no longer used; IncomeAllocations handles all income categorization

DROP TABLE IF EXISTS public."SecondaryIncome" CASCADE;
