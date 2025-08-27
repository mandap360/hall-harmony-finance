
import { getCurrentFY, isInCurrentFY } from "./FinancialYearCalculator";
import { supabase } from "@/integrations/supabase/client";

export const calculateExpenseData = async (expenses: any[], selectedFY?: { startYear: number; endYear: number }) => {
  const targetFY = selectedFY || getCurrentFY();

  // Filter expenses for target financial year and not deleted
  const targetFYExpenses = expenses.filter((expense) => 
    isInCurrentFY(expense.date, targetFY)
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

  // Calculate total payables (unpaid bills from selected FY and previous years, exclude future FY)
  const totalPayables = expenses.filter((expense) => {
    if (expense.isPaid) return false;
    
    // Check if expense is from selected FY or previous years (exclude future FY)
    const expenseDate = new Date(expense.date);
    const expenseYear = expenseDate.getFullYear();
    const expenseMonth = expenseDate.getMonth();
    
    // Get the expense's FY
    let expenseFY;
    if (expenseMonth >= 3) { // April onwards
      expenseFY = { startYear: expenseYear, endYear: expenseYear + 1 };
    } else { // January to March
      expenseFY = { startYear: expenseYear - 1, endYear: expenseYear };
    }
    
    // Include if expense FY is same or before the selected FY
    return expenseFY.endYear <= targetFY.endYear;
  }).reduce((sum, expense) => {
    return sum + Number(expense.totalAmount || expense.amount);
  }, 0);

  return {
    totalExpenses,
    expensesByCategory,
    totalPayables
  };
};
