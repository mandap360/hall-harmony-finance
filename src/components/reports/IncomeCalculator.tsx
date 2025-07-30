
import { getCurrentFY, isInCurrentFY } from "./FinancialYearCalculator";
import { supabase } from "@/integrations/supabase/client";

export const calculateIncomeData = async () => {
  let incomeByCategory: Record<string, number> = {};
  let totalIncome = 0;

  try {
    // Fetch all income with category details
    const { data: allIncome, error: incomeError } = await supabase
      .from('income')
      .select(`
        amount,
        income_categories!category_id (
          name
        )
      `);

    if (!incomeError && allIncome) {
      // Group income by category and calculate totals
      allIncome.forEach(income => {
        const amount = Number(income.amount);
        const categoryName = income.income_categories?.name || 'Uncategorized';
        
        incomeByCategory[categoryName] = (incomeByCategory[categoryName] || 0) + amount;
        totalIncome += amount;
      });
    }

    // Fetch additional income from secondary_income table
    const { data: additionalIncomeData, error } = await supabase
      .from('secondary_income')
      .select('category, amount');

    if (!error && additionalIncomeData) {
      additionalIncomeData.forEach(item => {
        const amount = Number(item.amount);
        incomeByCategory[item.category] = (incomeByCategory[item.category] || 0) + amount;
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
