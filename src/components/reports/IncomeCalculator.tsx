
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
    // This includes allocated advance amounts and other secondary income categories
    const { data: additionalIncomeData, error } = await supabase
      .from('secondary_income')
      .select('amount, income_categories!inner(name, parent_id)')
      .eq('organization_id', profile.organization_id);

    if (!error && additionalIncomeData) {
      let secondaryIncomeTotal = 0;
      additionalIncomeData.forEach(item => {
        const amount = Number(item.amount);
        const categoryName = item.income_categories.name;
        
        // Only include subcategories in individual totals (not the parent "Secondary Income")
        if (item.income_categories.parent_id) {
          incomeByCategory[categoryName] = (incomeByCategory[categoryName] || 0) + amount;
          secondaryIncomeTotal += amount;
        }
      });
      
      // Set "Secondary Income" to be the total of its subcategories, not from income table
      if (secondaryIncomeTotal > 0) {
        incomeByCategory['Secondary Income'] = secondaryIncomeTotal;
        totalIncome += secondaryIncomeTotal;
      }
    }
  } catch (error) {
    console.error('Error fetching income data:', error);
  }

  return {
    totalIncome,
    incomeByCategory
  };
};
