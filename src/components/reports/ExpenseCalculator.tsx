
import { getCurrentFY, isInCurrentFY } from "./FinancialYearCalculator";
import { supabase } from "@/integrations/supabase/client";

export const calculateExpenseData = async (expenses: any[], bookingRefunds: any[] = []) => {
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

  // Fetch additional income refunds from additional_income table
  let totalAdditionalIncomeRefunds = 0;
  try {
    const { data: additionalIncomeRefunds, error } = await supabase
      .from('additional_income')
      .select('amount, created_at')
      .eq('category', 'Additional Income Refund')
      .lt('amount', 0); // Only negative amounts (refunds)

    if (!error && additionalIncomeRefunds) {
      const currentFYAdditionalRefunds = additionalIncomeRefunds.filter((refund) =>
        isInCurrentFY(refund.created_at, currentFY)
      );
      
      totalAdditionalIncomeRefunds = currentFYAdditionalRefunds.reduce(
        (sum, refund) => sum + Math.abs(Number(refund.amount)), 0
      );
    }
  } catch (error) {
    console.error('Error fetching additional income refunds:', error);
  }

  const expensesByCategory = currentFYPaidExpenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.totalAmount;
    return acc;
  }, {} as Record<string, number>);

  // Add refunds as separate categories
  if (totalRefunds > 0) {
    expensesByCategory['Rent Refund (Cancellation)'] = totalRefunds;
  }

  if (totalAdditionalIncomeRefunds > 0) {
    expensesByCategory['Additional Income Refund'] = totalAdditionalIncomeRefunds;
  }

  // Calculate total payables
  const totalPayables = expenses
    .filter(expense => !expense.isPaid)
    .reduce((sum, expense) => sum + expense.totalAmount, 0);

  return {
    totalExpenses: totalExpenses + totalRefunds + totalAdditionalIncomeRefunds,
    expensesByCategory,
    totalPayables
  };
};
