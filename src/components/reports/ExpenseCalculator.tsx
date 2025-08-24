
import { FinancialYear, getCurrentFinancialYear, isInFinancialYear } from "@/utils/financialYear";
import { supabase } from "@/integrations/supabase/client";

export const calculateExpenseData = async (expenses: any[], financialYear?: FinancialYear) => {
  const targetFY = financialYear || getCurrentFinancialYear();

  // Filter expenses for target financial year and not deleted
  const currentFYExpenses = expenses.filter((expense) => 
    isInFinancialYear(expense.date, targetFY) && !expense.isDeleted
  );

  // Calculate total expenses (only paid expenses from expenses table)
  const totalExpenses = currentFYExpenses.reduce((sum, expense) => {
    if (expense.isPaid) {
      return sum + Number(expense.totalAmount || expense.amount);
    }
    return sum;
  }, 0);

  // Group expenses by category for breakdown
  const expensesByCategory: Record<string, number> = {};
  
  currentFYExpenses.forEach((expense) => {
    // Only include paid expenses in category breakdown
    if (expense.isPaid) {
      const categoryName = expense.category || 'Uncategorized';
      const amount = Number(expense.totalAmount || expense.amount);
      expensesByCategory[categoryName] = (expensesByCategory[categoryName] || 0) + amount;
    }
  });

  // Calculate total payables (unpaid bills)
  const totalPayables = currentFYExpenses.reduce((sum, expense) => {
    if (!expense.isPaid) {
      return sum + Number(expense.totalAmount || expense.amount);
    }
    return sum;
  }, 0);

  return {
    totalExpenses,
    expensesByCategory,
    totalPayables
  };
};
