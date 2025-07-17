
import { getCurrentFY, isInCurrentFY } from "./FinancialYearCalculator";
import { supabase } from "@/integrations/supabase/client";

export const calculateIncomeData = async (bookings: any[]) => {
  const currentFY = getCurrentFY();

  const currentFYBookings = bookings.filter((booking) => 
    isInCurrentFY(booking.startDate, currentFY)
  );

  // Calculate total rent income from actual payments (paidAmount), not rent finalized
  const totalRentIncome = currentFYBookings.reduce((sum, booking) => {
    return sum + booking.paidAmount; // Only rent payments received
  }, 0);

  // Calculate total additional income payments from payments table
  let totalAdditionalIncomeFromPayments = 0;

  // Fetch categorized additional income from additional_income table
  const bookingIds = currentFYBookings.map(booking => booking.id);
  let categorizedAdditionalIncome: Record<string, number> = {};
  let totalCategorizedAdditionalIncome = 0;

  if (bookingIds.length > 0) {
    try {
      // Fetch additional income payments from payments table
      const { data: additionalPayments, error: paymentsError } = await supabase
        .from('payments')
        .select('amount')
        .in('booking_id', bookingIds)
        .eq('payment_type', 'additional');

      if (!paymentsError && additionalPayments) {
        totalAdditionalIncomeFromPayments = additionalPayments.reduce((sum, payment) => {
          return sum + Number(payment.amount);
        }, 0);
      }

      // Fetch categorized additional income from additional_income table
      const { data: additionalIncomeData, error } = await supabase
        .from('additional_income')
        .select('category, amount')
        .in('booking_id', bookingIds);

      if (!error && additionalIncomeData) {
        categorizedAdditionalIncome = additionalIncomeData.reduce((acc, item) => {
          acc[item.category] = (acc[item.category] || 0) + Number(item.amount);
          totalCategorizedAdditionalIncome += Number(item.amount);
          return acc;
        }, {} as Record<string, number>);
      }
    } catch (error) {
      console.error('Error fetching additional income:', error);
    }
  }

  // Calculate unallocated additional income (total additional income received - already allocated)
  const unallocatedAdditionalIncome = totalAdditionalIncomeFromPayments - totalCategorizedAdditionalIncome;

  // Total income combines rent, unallocated additional income, and categorized additional income
  const totalIncome = totalRentIncome + unallocatedAdditionalIncome + totalCategorizedAdditionalIncome;

  // Create detailed income breakdown
  const incomeByCategory: Record<string, number> = {
    "Rent": totalRentIncome, // Only rent received, not finalized
  };

  // Add unallocated additional income if there's any
  if (unallocatedAdditionalIncome > 0) {
    incomeByCategory["Unallocated Additional Income"] = unallocatedAdditionalIncome;
  }

  // Add categorized additional income
  Object.entries(categorizedAdditionalIncome).forEach(([category, amount]) => {
    incomeByCategory[category] = amount;
  });

  // Calculate total receivables (only unpaid rent, not additional income)
  const totalReceivables = bookings.reduce((sum, booking) => {
    const remaining = booking.rentFinalized - booking.paidAmount;
    return sum + (remaining > 0 ? remaining : 0);
  }, 0);

  return {
    totalIncome,
    totalRentIncome,
    totalAdditionalIncome: unallocatedAdditionalIncome + totalCategorizedAdditionalIncome,
    incomeByCategory,
    totalReceivables
  };
};
