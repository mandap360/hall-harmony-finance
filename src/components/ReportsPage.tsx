
import { useState, useEffect } from "react";
import { useBookings } from "@/hooks/useBookings";
import { useExpenses } from "@/hooks/useExpenses";
import { useAccounts } from "@/hooks/useAccounts";
import { SalesExpenseSummary } from "@/components/reports/SalesExpenseSummary";
import { DashboardSummaryCards } from "@/components/reports/DashboardSummaryCards";
import { IncomeListView } from "@/components/reports/IncomeListView";
import { ExpenseListView } from "@/components/reports/ExpenseListView";
import { VendorPayablesView } from "@/components/reports/VendorPayablesView";
import { UnpaidBillsView } from "@/components/reports/UnpaidBillsView";
import { ReceivablesView } from "@/components/reports/ReceivablesView";
import { AccountTransactions } from "@/components/AccountTransactions";
import { Account } from "@/hooks/useAccounts";
import { calculateIncomeData } from "@/components/reports/IncomeCalculator";
import { calculateExpenseData } from "@/components/reports/ExpenseCalculator";
import { TrendingUp, FileText, PlusCircle, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

// Reports page component with dashboard summary cards
export const ReportsPage = () => {
  const [currentView, setCurrentView] = useState("dashboard");
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [incomeData, setIncomeData] = useState<any>(null);
  const [expenseData, setExpenseData] = useState<any>(null);
  const { bookings } = useBookings();
  const { expenses } = useExpenses();
  const { accounts } = useAccounts();

  // Calculate income and expense data asynchronously
  useEffect(() => {
    const fetchFinancialData = async () => {
      if (bookings.length > 0) {
        const incomeResult = await calculateIncomeData(bookings);
        setIncomeData(incomeResult);
        
        const expenseResult = await calculateExpenseData(expenses);
        setExpenseData(expenseResult);
      } else {
        // Set empty data when no bookings exist
        setIncomeData({ totalIncome: 0, totalReceivables: 0, incomeByCategory: [] });
        setExpenseData({ totalExpenses: 0, totalPayables: 0, expensesByCategory: [] });
      }
    };
    fetchFinancialData();
  }, [bookings, expenses]);

  // Calculate banking summary
  const bankingSummary = accounts.reduce((acc, account) => {
    if (account.account_type === 'operational' && account.sub_type === 'cash') {
      acc.cashInHand += account.balance;
    } else if (account.account_type === 'operational' && account.sub_type === 'bank') {
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

  if (currentView === "expenses") {
    return <ExpenseListView onBack={() => setCurrentView("dashboard")} />;
  }

  if (currentView === "payables") {
    return <VendorPayablesView onBack={() => setCurrentView("dashboard")} />;
  }

  if (currentView === "unpaid-bills") {
    return <UnpaidBillsView onBack={() => setCurrentView("dashboard")} />;
  }

  if (currentView === "receivables") {
    return <ReceivablesView onBack={() => setCurrentView("dashboard")} />;
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
  const hasNoData = bookings.length === 0 && expenses.length === 0;

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

  // Calculate overdue invoices and bills for display
  const overdueInvoices = bookings.filter(booking => booking.rentFinalized > booking.paidAmount).length;
  const overdueBills = expenses.filter(expense => !expense.isPaid).length;

  return (
    <div className="bg-background p-4">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Dashboard Summary Cards */}
        <DashboardSummaryCards
          totalIncome={incomeData.totalIncome}
          totalExpenses={expenseData.totalExpenses}
          totalReceivables={incomeData.totalReceivables}
          totalPayables={expenseData.totalPayables}
          onReceivablesClick={() => setCurrentView("receivables")}
          onPayablesClick={() => setCurrentView("payables")}
        />

        {/* Sales & Expense Summary with dropdown functionality */}
        <SalesExpenseSummary 
          totalIncome={incomeData.totalIncome}
          totalExpenses={expenseData.totalExpenses}
          profit={incomeData.totalIncome - expenseData.totalExpenses}
          incomeByCategory={incomeData.incomeByCategory}
          expensesByCategory={expenseData.expensesByCategory}
        />
      </div>
    </div>
  );
};
