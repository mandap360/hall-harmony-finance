
import { useState, useEffect } from "react";
import { useBookings } from "@/hooks/useBookings";
import { useAccounts } from "@/hooks/useAccounts";
import { useTransactions } from "@/hooks/useTransactions";
import { SalesExpenseSummary } from "@/components/reports/SalesExpenseSummary";
import { DashboardSummaryCards } from "@/components/reports/DashboardSummaryCards";
import { IncomeListView } from "@/components/reports/IncomeListView";
import { VendorPayablesView } from "@/components/reports/VendorPayablesView";
import { UnpaidBillsView } from "@/components/reports/UnpaidBillsView";
import { ReceivablesView } from "@/components/reports/ReceivablesView";
import { AccountTransactions } from "@/components/AccountTransactions";
import { Account } from "@/hooks/useAccounts";
import { calculateIncomeData } from "@/components/reports/IncomeCalculator";
import { FinancialYearNavigation } from "@/components/reports/FinancialYearNavigation";
import { getCurrentFY } from "@/components/reports/FinancialYearCalculator";
import { TrendingUp, FileText, Calendar } from "lucide-react";
import { Card } from "@/components/ui/card";

// Reports page component with dashboard summary cards
export const ReportsPage = () => {
  const [currentView, setCurrentView] = useState("dashboard");
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [selectedFY, setSelectedFY] = useState(getCurrentFY());
  const [incomeData, setIncomeData] = useState<any>(null);
  const [expenseData, setExpenseData] = useState<{ totalExpenses: number; expensesByCategory: Record<string, number>; totalPayables: number } | null>(null);
  const { bookings } = useBookings();
  const { accounts } = useAccounts();
  const { transactions } = useTransactions();

  // Calculate expense data from transactions
  useEffect(() => {
    const calculateExpenseData = () => {
      const targetFY = selectedFY;
      
      // Filter purchase transactions for the selected FY
      const purchaseTransactions = transactions.filter(tx => {
        if (tx.voucher_type !== 'purchase') return false;
        
        const txDate = new Date(tx.voucher_date);
        const txYear = txDate.getFullYear();
        const txMonth = txDate.getMonth();
        
        // Calculate transaction FY
        let txFY;
        if (txMonth >= 3) { // April onwards
          txFY = { startYear: txYear, endYear: txYear + 1 };
        } else { // January to March
          txFY = { startYear: txYear - 1, endYear: txYear };
        }
        
        return txFY.startYear === targetFY.startYear && txFY.endYear === targetFY.endYear;
      });

      const totalExpenses = purchaseTransactions.reduce((sum, tx) => sum + tx.amount, 0);

      // Group by description (as proxy for category since we don't have category_id on transactions)
      const expensesByCategory = purchaseTransactions.reduce((acc, tx) => {
        const category = tx.description || 'Uncategorized';
        acc[category] = (acc[category] || 0) + tx.amount;
        return acc;
      }, {} as Record<string, number>);

      // Calculate payables (unpaid purchases from selected FY and earlier)
      const unpaidPurchases = transactions.filter(tx => {
        if (tx.voucher_type !== 'purchase' || tx.is_financial_transaction) return false;
        
        const txDate = new Date(tx.voucher_date);
        const txYear = txDate.getFullYear();
        const txMonth = txDate.getMonth();
        
        let txFY;
        if (txMonth >= 3) {
          txFY = { startYear: txYear, endYear: txYear + 1 };
        } else {
          txFY = { startYear: txYear - 1, endYear: txYear };
        }
        
        return txFY.endYear <= targetFY.endYear;
      });

      const totalPayables = unpaidPurchases.reduce((sum, tx) => sum + tx.amount, 0);

      setExpenseData({ totalExpenses, expensesByCategory, totalPayables });
    };

    calculateExpenseData();
  }, [transactions, selectedFY]);

  // Calculate income data asynchronously based on selected FY
  useEffect(() => {
    const fetchIncomeData = async () => {
      const incomeResult = await calculateIncomeData(selectedFY);
      setIncomeData(incomeResult);
    };
    fetchIncomeData();
  }, [selectedFY]);

  // Calculate banking summary
  const bankingSummary = accounts.reduce((acc, account) => {
    if (account.account_type === 'cash_bank' && account.sub_type === 'cash') {
      acc.cashInHand += account.balance;
    } else if (account.account_type === 'cash_bank' && account.sub_type === 'bank') {
      acc.bankBalance += account.balance;
    }
    return acc;
  }, { cashInHand: 0, bankBalance: 0 });

  const handleAccountClick = (account: Account) => {
    setSelectedAccount(account);
  };

  if (selectedAccount) {
    return (
      <AccountTransactions 
        account={selectedAccount} 
        onBack={() => setSelectedAccount(null)}
        showFilters={true}
        showBalance={false}
      />
    );
  }

  if (currentView === "income") {
    return <IncomeListView onBack={() => setCurrentView("dashboard")} />;
  }

  if (currentView === "payables") {
    return <VendorPayablesView onBack={() => setCurrentView("dashboard")} selectedFY={selectedFY} />;
  }

  if (currentView === "unpaid-bills") {
    return <UnpaidBillsView onBack={() => setCurrentView("dashboard")} />;
  }

  if (currentView === "receivables") {
    return <ReceivablesView onBack={() => setCurrentView("dashboard")} selectedFY={selectedFY} />;
  }

  // Show loading state while data is being calculated
  if (!incomeData || !expenseData) {
    return (
      <div className="bg-background p-4">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Financial Reports</h1>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  // Check if there's no data to display
  const hasNoData = bookings.length === 0 && transactions.filter(tx => tx.voucher_type === 'purchase').length === 0;

  if (hasNoData) {
    return (
      <div className="bg-background flex items-center justify-center p-4">
        <div className="max-w-md mx-auto text-center">
          <Card className="p-8 shadow-lg">
            <div className="mb-6">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Welcome to Financial Reports
              </h2>
              <p className="text-muted-foreground mb-6">
                Start by adding your first booking or expense to see comprehensive financial insights and analytics.
              </p>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center text-sm text-muted-foreground bg-muted p-3 rounded">
                <Calendar className="h-4 w-4 mr-2" />
                <span>Add bookings to track income</span>
              </div>
              <div className="flex items-center text-sm text-muted-foreground bg-muted p-3 rounded">
                <FileText className="h-4 w-4 mr-2" />
                <span>Record expenses to monitor spending</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground">
                Once you have data, you'll see detailed reports including profit/loss analysis, 
                category breakdowns, and account summaries.
              </p>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background p-4">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Financial Year Navigation */}
        <FinancialYearNavigation 
          currentFY={selectedFY}
          onFYChange={setSelectedFY}
        />

        {/* Income & Expense Summary */}
        <SalesExpenseSummary 
          totalIncome={incomeData.totalIncome}
          totalExpenses={expenseData.totalExpenses}
          profit={incomeData.totalIncome - expenseData.totalExpenses}
          incomeByCategory={incomeData.incomeByCategory}
          expensesByCategory={expenseData.expensesByCategory}
        />

        {/* Accounts Summary Title */}
        <div className="flex items-center">
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
            Accounts Summary
          </h2>
        </div>

        {/* Dashboard Summary Cards */}
        <DashboardSummaryCards
          totalIncome={incomeData.totalIncome}
          totalExpenses={expenseData.totalExpenses}
          totalReceivables={bookings
            .filter(booking => {
              if (booking.status === 'cancelled') return false;
              
              // Filter by selected FY and earlier (not future FY)
              const bookingEndDate = new Date(booking.endDate);
              const bookingFY = bookingEndDate.getMonth() >= 3 
                ? { startYear: bookingEndDate.getFullYear(), endYear: bookingEndDate.getFullYear() + 1 }
                : { startYear: bookingEndDate.getFullYear() - 1, endYear: bookingEndDate.getFullYear() };
              
              // Show receivables for selected FY and earlier (not future)
              return bookingFY.endYear <= selectedFY.endYear;
            })
            .reduce((sum, booking) => {
              const pendingRent = booking.rentFinalized - booking.rentReceived;
              return pendingRent > 0 ? sum + pendingRent : sum;
            }, 0)
          }
          totalPayables={expenseData.totalPayables}
          onReceivablesClick={() => setCurrentView("receivables")}
          onPayablesClick={() => setCurrentView("payables")}
        />
      </div>
    </div>
  );
};
