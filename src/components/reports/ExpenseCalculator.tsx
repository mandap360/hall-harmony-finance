
import { getCurrentFY, isInCurrentFY } from "./FinancialYearCalculator";
import { supabase } from "@/integrations/supabase/client";

export const calculateExpenseData = async (expenses: any[]) => {
  const currentFY = getCurrentFY();

  // Filter expenses for current financial year and not deleted
  const currentFYExpenses = expenses.filter((expense) => 
    isInCurrentFY(expense.date, currentFY) && !expense.isDeleted
  );

  // Calculate total expenses (only from expenses table, no refunds)
  const totalExpenses = currentFYExpenses.reduce((sum, expense) => {
    return sum + Number(expense.totalAmount || expense.amount);
  }, 0);

  // Group expenses by category for breakdown
  const expensesByCategory: Record<string, number> = {};
  
  currentFYExpenses.forEach((expense) => {
    const categoryName = expense.category?.name || expense.categoryName || 'Uncategorized';
    const amount = Number(expense.totalAmount || expense.amount);
    expensesByCategory[categoryName] = (expensesByCategory[categoryName] || 0) + amount;
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
