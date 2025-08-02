
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
    // Get Secondary Income category ID
    const { data: secondaryCategory } = await supabase
      .from('income_categories')
      .select('id')
      .eq('name', 'Secondary Income')
      .single();

    // Fetch all income with category details for user's organization
    const { data: allIncome, error: incomeError } = await supabase
      .from('income')
      .select(`
        amount,
        category_id,
        income_categories!category_id (
          name,
          parent_id
        )
      `)
      .eq('organization_id', profile.organization_id);

    if (!incomeError && allIncome) {
      // Group income by category and calculate totals (excluding Secondary Income categories)
      allIncome.forEach(income => {
        const amount = Number(income.amount);
        const categoryName = income.income_categories?.name || 'Uncategorized';
        const isSecondaryIncome = income.category_id === secondaryCategory?.id || 
                                income.income_categories?.parent_id === secondaryCategory?.id;
        
        // Only include non-secondary income categories from income table
        if (!isSecondaryIncome) {
          incomeByCategory[categoryName] = (incomeByCategory[categoryName] || 0) + amount;
          totalIncome += amount;
        }
      });
    }

    // Fetch secondary income from secondary_income table only for Secondary Income category
    const { data: secondaryIncomeData, error } = await supabase
      .from('secondary_income')
      .select('amount, income_categories!inner(name, parent_id)')
      .eq('organization_id', profile.organization_id);

    if (!error && secondaryIncomeData) {
      let secondaryIncomeTotal = 0;
      const secondaryIncomeSubcategories: Record<string, number> = {};
      
      secondaryIncomeData.forEach(item => {
        const amount = Number(item.amount);
        const categoryName = item.income_categories.name;
        
        // Include all secondary income subcategories
        if (item.income_categories.parent_id) {
          secondaryIncomeSubcategories[categoryName] = (secondaryIncomeSubcategories[categoryName] || 0) + amount;
          secondaryIncomeTotal += amount;
        }
      });
      
      // Add subcategories to the main income breakdown
      Object.entries(secondaryIncomeSubcategories).forEach(([categoryName, amount]) => {
        incomeByCategory[categoryName] = amount;
      });
      
      // Set "Secondary Income" to be the total of its subcategories from secondary_income table
      if (secondaryIncomeTotal !== 0) {
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
