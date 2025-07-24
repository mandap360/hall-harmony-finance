
import { getCurrentFY, isInCurrentFY } from "./FinancialYearCalculator";
import { supabase } from "@/integrations/supabase/client";

export const calculateIncomeData = async (bookings: any[]) => {
  const currentFY = getCurrentFY();

  const currentFYBookings = bookings.filter((booking) => 
    isInCurrentFY(booking.startDate, currentFY)
  );

  const bookingIds = currentFYBookings.map(booking => booking.id);
  let incomeByCategory: Record<string, number> = {};
  let totalIncome = 0;

  if (bookingIds.length > 0) {
    try {
      // Fetch all payments from payments table for current FY bookings
      const { data: allPayments, error: paymentsError } = await supabase
        .from('payments')
        .select('amount, payment_type')
        .in('booking_id', bookingIds);

      if (!paymentsError && allPayments) {
        // Group payments by type and calculate totals
        allPayments.forEach(payment => {
          const amount = Number(payment.amount);
          const paymentType = payment.payment_type;
          
          incomeByCategory[paymentType] = (incomeByCategory[paymentType] || 0) + amount;
          totalIncome += amount;
        });
      }

      // Fetch categorized additional income from secondary_income table
      const { data: additionalIncomeData, error } = await supabase
        .from('secondary_income')
        .select('category, amount')
        .in('booking_id', bookingIds);

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
  }

  // Calculate total receivables (only unpaid rent, not additional income)
  const totalReceivables = bookings.reduce((sum, booking) => {
    const remaining = booking.rentFinalized - booking.paidAmount;
    return sum + (remaining > 0 ? remaining : 0);
  }, 0);

  return {
    totalIncome,
    incomeByCategory,
    totalReceivables
  };
};
