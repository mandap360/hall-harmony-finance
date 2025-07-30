
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const calculateIncomeData = async () => {
  // Get current user's organization
  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', (await supabase.auth.getUser()).data.user?.id)
    .single();

  if (!profile?.organization_id) {
    return { totalIncome: 0, incomeByCategory: {} };
  }
  let incomeByCategory: Record<string, number> = {};
  let totalIncome = 0;

  try {
    // Fetch all income with category details for user's organization
    const { data: allIncome, error: incomeError } = await supabase
      .from('income')
      .select(`
        amount,
        income_categories!category_id (
          name
        )
      `)
      .eq('organization_id', profile.organization_id);

    if (!incomeError && allIncome) {
      // Group income by category and calculate totals
      allIncome.forEach(income => {
        const amount = Number(income.amount);
        const categoryName = income.income_categories?.name || 'Uncategorized';
        
        incomeByCategory[categoryName] = (incomeByCategory[categoryName] || 0) + amount;
        totalIncome += amount;
      });
    }

    // Fetch additional income from secondary_income table for user's organization
    const { data: additionalIncomeData, error } = await supabase
      .from('secondary_income')
      .select('amount, income_categories!inner(name)')
      .eq('organization_id', profile.organization_id);

    if (!error && additionalIncomeData) {
      additionalIncomeData.forEach(item => {
        const amount = Number(item.amount);
        const categoryName = item.income_categories.name;
        incomeByCategory[categoryName] = (incomeByCategory[categoryName] || 0) + amount;
        totalIncome += amount;
      });
    }
  } catch (error) {
    console.error('Error fetching income data:', error);
  }

  return {
    totalIncome,
    incomeByCategory
  };
};
