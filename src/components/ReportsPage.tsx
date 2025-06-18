
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { useBookings } from "@/hooks/useBookings";
import { useExpenses } from "@/hooks/useExpenses";

export const ReportsPage = () => {
  const { bookings } = useBookings();
  const { expenses } = useExpenses();

  // Get current Indian Financial Year (April to March)
  const getCurrentFY = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    
    if (month >= 3) { // April onwards (month is 0-indexed, so March = 2, April = 3)
      return { startYear: year, endYear: year + 1 };
    } else { // January to March
      return { startYear: year - 1, endYear: year };
    }
  };

  const currentFY = getCurrentFY();

  const financialData = useMemo(() => {
    // Filter bookings for current FY
    const currentFYBookings = bookings.filter((booking) => {
      const bookingDate = new Date(booking.startDate);
      const bookingYear = bookingDate.getFullYear();
      const bookingMonth = bookingDate.getMonth();
      
      if (bookingMonth >= 3) { // April onwards
        return bookingYear === currentFY.startYear;
      } else { // January to March
        return bookingYear === currentFY.endYear;
      }
    });

    // Filter expenses for current FY
    const currentFYExpenses = expenses.filter((expense) => {
      const expenseDate = new Date(expense.date);
      const expenseYear = expenseDate.getFullYear();
      const expenseMonth = expenseDate.getMonth();
      
      if (expenseMonth >= 3) { // April onwards
        return expenseYear === currentFY.startYear;
      } else { // January to March
        return expenseYear === currentFY.endYear;
      }
    });

    // Calculate total income from actual payments received
    let totalPaidAmount = 0;
    let totalAdditionalCategoryIncome = 0;
    let totalAdditionalAdvance = 0;

    currentFYBookings.forEach(booking => {
      // Use paidAmount which represents actual payments received
      const rentPayments = booking.payments?.filter(payment => 
        payment.type === 'advance' || payment.type === 'rent'
      ).reduce((sum, payment) => sum + payment.amount, 0) || 0;
      
      const additionalPayments = booking.payments?.filter(payment => 
        payment.type === 'additional'
      ) || [];
      
      totalPaidAmount += rentPayments;
      
      // Separate category-based additional income from advance additional income
      additionalPayments.forEach(payment => {
        if (payment.description && payment.description.includes('categories')) {
          totalAdditionalCategoryIncome += payment.amount;
        } else {
          totalAdditionalAdvance += payment.amount;
        }
      });
    });

    const totalIncome = totalPaidAmount + totalAdditionalCategoryIncome + totalAdditionalAdvance;

    // Calculate expenses by category for current FY
    const expensesByCategory: Record<string, number> = {};
    let totalExpenses = 0;

    currentFYExpenses.forEach(expense => {
      expensesByCategory[expense.category] = (expensesByCategory[expense.category] || 0) + expense.totalAmount;
      totalExpenses += expense.totalAmount;
    });

    const profit = totalIncome - totalExpenses;

    return {
      totalIncome,
      totalExpenses,
      profit,
      incomeBreakdown: {
        rent: totalPaidAmount,
        additionalCategory: totalAdditionalCategoryIncome,
        additionalAdvance: totalAdditionalAdvance,
      },
      expensesByCategory,
      currentFY
    };
  }, [bookings, expenses, currentFY]);

  return (
    <div className="p-4 space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Income Received</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ₹{financialData.totalIncome.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500">Actual payments received</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              ₹{financialData.totalExpenses.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profit</CardTitle>
            <DollarSign className={`h-4 w-4 ${financialData.profit >= 0 ? 'text-green-600' : 'text-red-600'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${financialData.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ₹{financialData.profit.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Income Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Income Summary (Received)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Rent Payments Received:</span>
            <span className="font-semibold">₹{financialData.incomeBreakdown.rent.toLocaleString()}</span>
          </div>
          {financialData.incomeBreakdown.additionalCategory > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Additional Income (Category):</span>
              <span className="font-semibold">₹{financialData.incomeBreakdown.additionalCategory.toLocaleString()}</span>
            </div>
          )}
          {financialData.incomeBreakdown.additionalAdvance > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Additional Income (Advance):</span>
              <span className="font-semibold">₹{financialData.incomeBreakdown.additionalAdvance.toLocaleString()}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Expense Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Expense Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Object.entries(financialData.expensesByCategory).map(([category, amount]) => (
            <div key={category} className="flex justify-between items-center">
              <span className="text-gray-600">{category}:</span>
              <span className="font-semibold">₹{amount.toLocaleString()}</span>
            </div>
          ))}
          {Object.keys(financialData.expensesByCategory).length === 0 && (
            <p className="text-gray-500 text-center">No expenses recorded</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
