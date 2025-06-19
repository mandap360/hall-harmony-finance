
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, CreditCard, Banknote, ChevronRight } from "lucide-react";
import { useBookings } from "@/hooks/useBookings";
import { useExpenses } from "@/hooks/useExpenses";
import { useAccounts } from "@/hooks/useAccounts";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

export const ReportsPage = () => {
  const { bookings } = useBookings();
  const { expenses } = useExpenses();
  const { accounts } = useAccounts();
  const [additionalIncomeCategories, setAdditionalIncomeCategories] = useState<any[]>([]);
  const [showDetailedReports, setShowDetailedReports] = useState(false);

  // Fetch additional income categories breakdown
  useEffect(() => {
    const fetchAdditionalIncomeCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('additional_income')
          .select('category, amount');
        
        if (error) throw error;
        
        // Group by category and sum amounts
        const categoryTotals = (data || []).reduce((acc, item) => {
          const category = item.category;
          acc[category] = (acc[category] || 0) + Number(item.amount);
          return acc;
        }, {} as Record<string, number>);
        
        setAdditionalIncomeCategories(Object.entries(categoryTotals).map(([category, amount]) => ({
          category,
          amount
        })));
      } catch (error) {
        console.error('Error fetching additional income categories:', error);
      }
    };
    
    fetchAdditionalIncomeCategories();
  }, []);

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

  // Calculate banking summary
  const bankingSummary = useMemo(() => {
    const cashAccount = accounts.find(acc => acc.account_type === 'cash' && acc.is_default);
    const bankAccount = accounts.find(acc => acc.account_type === 'bank' && acc.is_default);
    const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

    return {
      cashInHand: cashAccount?.balance || 0,
      bankBalance: bankAccount?.balance || 0,
      totalBankBalance: totalBalance,
    };
  }, [accounts]);

  return (
    <div className="p-4 space-y-6 bg-gradient-to-br from-blue-50 to-indigo-50 min-h-screen">
      {/* Banking Summary */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900 flex items-center">
          <CreditCard className="h-5 w-5 mr-2 text-blue-600" />
          Banking Summary
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium opacity-90">Cash in Hand</CardTitle>
              <Banknote className="h-4 w-4 opacity-90" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₹{bankingSummary.cashInHand.toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium opacity-90">Bank Balance</CardTitle>
              <CreditCard className="h-4 w-4 opacity-90" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₹{bankingSummary.bankBalance.toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium opacity-90">Total Balance</CardTitle>
              <DollarSign className="h-4 w-4 opacity-90" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₹{bankingSummary.totalBankBalance.toLocaleString()}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Sales & Expense */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900 flex items-center">
          <TrendingUp className="h-5 w-5 mr-2 text-orange-600" />
          Sales & Expense
        </h2>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium opacity-90">Total Income</CardTitle>
              <TrendingUp className="h-4 w-4 opacity-90" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₹{financialData.totalIncome.toLocaleString()}
              </div>
              <p className="text-xs opacity-80">Actual payments received</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-red-500 to-pink-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium opacity-90">Total Expenses</CardTitle>
              <TrendingDown className="h-4 w-4 opacity-90" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₹{financialData.totalExpenses.toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card className={`bg-gradient-to-r ${financialData.profit >= 0 
            ? 'from-cyan-500 to-blue-600' 
            : 'from-orange-500 to-red-600'} text-white`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium opacity-90">
                {financialData.profit >= 0 ? 'Profit' : 'Loss'}
              </CardTitle>
              <DollarSign className="h-4 w-4 opacity-90" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₹{Math.abs(financialData.profit).toLocaleString()}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* More Button */}
        <div className="flex justify-center">
          <Button
            onClick={() => setShowDetailedReports(!showDetailedReports)}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <span>{showDetailedReports ? 'Show Less' : 'More'}</span>
            <ChevronRight className={`h-4 w-4 transition-transform ${showDetailedReports ? 'rotate-90' : ''}`} />
          </Button>
        </div>

        {/* Detailed Reports */}
        {showDetailedReports && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Income Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-green-700">Income Summary (Received)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="text-gray-600">Rent Payments:</span>
                  <span className="font-semibold text-green-600">₹{financialData.incomeBreakdown.rent.toLocaleString()}</span>
                </div>
                
                {/* Show individual income categories */}
                {additionalIncomeCategories.map((category) => (
                  <div key={category.category} className="flex justify-between items-center border-b pb-2">
                    <span className="text-gray-600">{category.category}:</span>
                    <span className="font-semibold text-green-600">₹{category.amount.toLocaleString()}</span>
                  </div>
                ))}
                
                {financialData.incomeBreakdown.additionalAdvance > 0 && (
                  <div className="flex justify-between items-center border-b pb-2">
                    <span className="text-gray-600">Additional Income (Advance):</span>
                    <span className="font-semibold text-green-600">₹{financialData.incomeBreakdown.additionalAdvance.toLocaleString()}</span>
                  </div>
                )}

                <div className="flex justify-between items-center pt-2 border-t font-bold">
                  <span className="text-gray-900">Total:</span>
                  <span className="text-green-600">₹{financialData.totalIncome.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>

            {/* Expense Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-red-700">Expense Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {Object.entries(financialData.expensesByCategory).map(([category, amount]) => (
                  <div key={category} className="flex justify-between items-center border-b pb-2">
                    <span className="text-gray-600">{category}:</span>
                    <span className="font-semibold text-red-600">₹{amount.toLocaleString()}</span>
                  </div>
                ))}
                
                {Object.keys(financialData.expensesByCategory).length === 0 && (
                  <p className="text-gray-500 text-center py-4">No expenses recorded</p>
                )}

                {Object.keys(financialData.expensesByCategory).length > 0 && (
                  <div className="flex justify-between items-center pt-2 border-t font-bold">
                    <span className="text-gray-900">Total:</span>
                    <span className="text-red-600">₹{financialData.totalExpenses.toLocaleString()}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};
