
import { getCurrentFY, isInCurrentFY } from "./FinancialYearCalculator";

export const calculateIncomeData = (bookings: any[]) => {
  const currentFY = getCurrentFY();

  const currentFYBookings = bookings.filter((booking) => 
    isInCurrentFY(booking.startDate, currentFY)
  );

  // Calculate total income from rent payments only (excluding additional income)
  const totalRentIncome = currentFYBookings.reduce((sum, booking) => {
    return sum + booking.paidAmount; // Only rent payments
  }, 0);

  // Calculate total additional income separately
  const totalAdditionalIncome = currentFYBookings.reduce((sum, booking) => {
    return sum + booking.additionalIncome; // Only additional income
  }, 0);

  // Total income combines both rent and additional income
  const totalIncome = totalRentIncome + totalAdditionalIncome;

  // Calculate category breakdowns - separate rent and additional income
  const incomeByCategory = currentFYBookings.reduce((acc, booking) => {
    // Only include rent payments in "Rent" category
    if (booking.paidAmount > 0) {
      acc["Rent"] = (acc["Rent"] || 0) + booking.paidAmount;
    }
    // Additional income goes to "Additional Income" category
    if (booking.additionalIncome > 0) {
      acc["Additional Income"] = (acc["Additional Income"] || 0) + booking.additionalIncome;
    }
    return acc;
  }, {} as Record<string, number>);

  // Calculate total receivables (only unpaid rent, not additional income)
  const totalReceivables = bookings.reduce((sum, booking) => {
    const remaining = booking.rent - booking.paidAmount;
    return sum + (remaining > 0 ? remaining : 0);
  }, 0);

  return {
    totalIncome,
    totalRentIncome,
    totalAdditionalIncome,
    incomeByCategory,
    totalReceivables
  };
};
