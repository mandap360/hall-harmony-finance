
import { getCurrentFY, isInCurrentFY } from "./FinancialYearCalculator";

export const calculateExpenseData = (expenses: any[]) => {
  const currentFY = getCurrentFY();

  // Calculate total expenses (only paid expenses)
  const currentFYPaidExpenses = expenses.filter((expense) => {
    return isInCurrentFY(expense.date, currentFY) && expense.isPaid;
  });

  const totalExpenses = currentFYPaidExpenses.reduce((sum, expense) => sum + expense.totalAmount, 0);

  const expensesByCategory = currentFYPaidExpenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.totalAmount;
    return acc;
  }, {} as Record<string, number>);

  // Calculate total payables
  const totalPayables = expenses
    .filter(expense => !expense.isPaid)
    .reduce((sum, expense) => sum + expense.totalAmount, 0);

  return {
    totalExpenses,
    expensesByCategory,
    totalPayables
  };
};
