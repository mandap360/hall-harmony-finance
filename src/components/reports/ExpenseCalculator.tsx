
import { getCurrentFY, isInCurrentFY } from "./FinancialYearCalculator";
import { supabase } from "@/integrations/supabase/client";

export const calculateExpenseData = async (expenses: any[], selectedFY?: { startYear: number; endYear: number }) => {
  const targetFY = selectedFY || getCurrentFY();

  // Filter expenses for target financial year and not deleted
  const targetFYExpenses = expenses.filter((expense) => 
    isInCurrentFY(expense.date, targetFY) && !expense.isDeleted
  );

  // Calculate total expenses (ALL expenses - paid and unpaid)
  const totalExpenses = targetFYExpenses.reduce((sum, expense) => {
    return sum + Number(expense.totalAmount || expense.amount);
  }, 0);

  // Group expenses by category for breakdown (ALL expenses - paid and unpaid)
  const expensesByCategory: Record<string, number> = {};
  
  targetFYExpenses.forEach((expense) => {
    const categoryName = expense.category || 'Uncategorized';
    const amount = Number(expense.totalAmount || expense.amount);
    expensesByCategory[categoryName] = (expensesByCategory[categoryName] || 0) + amount;
  });

  // Calculate total payables (unpaid bills)
  const totalPayables = targetFYExpenses.reduce((sum, expense) => {
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
