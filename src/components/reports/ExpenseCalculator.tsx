
import { getCurrentFY, isInCurrentFY } from "./FinancialYearCalculator";

export const calculateExpenseData = (expenses: any[], bookingRefunds: any[] = []) => {
  const currentFY = getCurrentFY();

  // Calculate total expenses (only paid expenses)
  const currentFYPaidExpenses = expenses.filter((expense) => {
    return isInCurrentFY(expense.date, currentFY) && expense.isPaid;
  });

  const totalExpenses = currentFYPaidExpenses.reduce((sum, expense) => sum + expense.totalAmount, 0);

  // Calculate refunds from bookings (treated as expenses)
  const currentFYRefunds = bookingRefunds.filter((refund) => {
    return isInCurrentFY(refund.date, currentFY);
  });

  const totalRefunds = currentFYRefunds.reduce((sum, refund) => sum + refund.amount, 0);

  const expensesByCategory = currentFYPaidExpenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.totalAmount;
    return acc;
  }, {} as Record<string, number>);

  // Add refunds as a separate category
  if (totalRefunds > 0) {
    expensesByCategory['Rent Refund (Cancellation)'] = totalRefunds;
  }

  // Calculate total payables
  const totalPayables = expenses
    .filter(expense => !expense.isPaid)
    .reduce((sum, expense) => sum + expense.totalAmount, 0);

  return {
    totalExpenses: totalExpenses + totalRefunds,
    expensesByCategory,
    totalPayables
  };
};
