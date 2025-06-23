import { useMemo, useState, useEffect } from "react";
import { TrendingUp, ChevronRight } from "lucide-react";
import { useBookings } from "@/hooks/useBookings";
import { useExpenses } from "@/hooks/useExpenses";
import { useAccounts } from "@/hooks/useAccounts";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { BankingSummaryCard } from "@/components/reports/BankingSummaryCard";
import { SalesExpenseSummary } from "@/components/reports/SalesExpenseSummary";
import { DetailedReports } from "@/components/reports/DetailedReports";

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
    const cashAccount = accounts.find(acc => acc.account_type === 'operational' && acc.sub_type === 'cash' && acc.is_default);
    const bankAccount = accounts.find(acc => acc.account_type === 'operational' && acc.sub_type === 'bank' && acc.is_default);
    const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

    return {
      cashInHand: cashAccount?.balance || 0,
      bankBalance: bankAccount?.balance || 0,
      totalBankBalance: totalBalance,
    };
  }, [accounts]);

  return (
    <div className="p-4 space-y-6 bg-gradient-to-br from-blue-50 to-indigo-50 min-h-screen">
      <BankingSummaryCard
        cashInHand={bankingSummary.cashInHand}
        bankBalance={bankingSummary.bankBalance}
        totalBalance={bankingSummary.totalBankBalance}
      />

      {/* Sales & Expense */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900 flex items-center">
          <TrendingUp className="h-5 w-5 mr-2 text-orange-600" />
          Sales & Expense
        </h2>

        <SalesExpenseSummary
          totalIncome={financialData.totalIncome}
          totalExpenses={financialData.totalExpenses}
          profit={financialData.profit}
        />

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
          <DetailedReports
            incomeBreakdown={financialData.incomeBreakdown}
            totalIncome={financialData.totalIncome}
            expensesByCategory={financialData.expensesByCategory}
            totalExpenses={financialData.totalExpenses}
            additionalIncomeCategories={additionalIncomeCategories}
          />
        )}
      </div>
    </div>
  );
};
