
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { useBookings } from "@/hooks/useBookings";
import { useExpenses } from "@/hooks/useExpenses";

export const ReportsPage = () => {
  const { bookings } = useBookings();
  const { expenses } = useExpenses();

  const financialData = useMemo(() => {
    // Calculate total income from bookings
    let totalRent = 0;
    let totalEB = 0;
    let totalGas = 0;
    let totalOtherIncome = 0;

    bookings.forEach(booking => {
      totalRent += booking.totalRent;
      
      // Calculate additional income from payments
      booking.payments?.forEach(payment => {
        if (payment.type === 'additional') {
          if (payment.category === 'EB') {
            totalEB += payment.amount;
          } else if (payment.category === 'Gas') {
            totalGas += payment.amount;
          } else {
            totalOtherIncome += payment.amount;
          }
        }
      });
    });

    const totalIncome = totalRent + totalEB + totalGas + totalOtherIncome;

    // Calculate expenses by category
    const expensesByCategory: Record<string, number> = {};
    let totalExpenses = 0;

    expenses.forEach(expense => {
      expensesByCategory[expense.category] = (expensesByCategory[expense.category] || 0) + expense.amount;
      totalExpenses += expense.amount;
    });

    const profit = totalIncome - totalExpenses;

    return {
      totalIncome,
      totalExpenses,
      profit,
      incomeBreakdown: {
        rent: totalRent,
        eb: totalEB,
        gas: totalGas,
        other: totalOtherIncome,
      },
      expensesByCategory,
    };
  }, [bookings, expenses]);

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <p className="text-gray-600">Financial insights and analytics</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ₹{financialData.totalIncome.toLocaleString()}
            </div>
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
          <CardTitle>Income Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Rent:</span>
            <span className="font-semibold">₹{financialData.incomeBreakdown.rent.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">EB:</span>
            <span className="font-semibold">₹{financialData.incomeBreakdown.eb.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Gas:</span>
            <span className="font-semibold">₹{financialData.incomeBreakdown.gas.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Other:</span>
            <span className="font-semibold">₹{financialData.incomeBreakdown.other.toLocaleString()}</span>
          </div>
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
