
import { useState } from "react";
import { useBookings } from "@/hooks/useBookings";
import { useExpenses } from "@/hooks/useExpenses";
import { useAccounts } from "@/hooks/useAccounts";
import { SalesExpenseSummary } from "@/components/reports/SalesExpenseSummary";
import { ZohoStyleSummary } from "@/components/reports/ZohoStyleSummary";
import { BankingSummaryCard } from "@/components/reports/BankingSummaryCard";
import { IncomeListView } from "@/components/reports/IncomeListView";
import { ExpenseListView } from "@/components/reports/ExpenseListView";
import { VendorPayablesView } from "@/components/reports/VendorPayablesView";
import { AccountTransactions } from "@/components/AccountTransactions";
import { Account } from "@/hooks/useAccounts";

export const ReportsPage = () => {
  const [currentView, setCurrentView] = useState("dashboard");
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const { bookings } = useBookings();
  const { expenses } = useExpenses();
  const { accounts } = useAccounts();

  // Get current FY data
  const getCurrentFY = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    
    if (month >= 3) {
      return { startYear: year, endYear: year + 1 };
    } else {
      return { startYear: year - 1, endYear: year };
    }
  };

  const currentFY = getCurrentFY();

  // Calculate total income from payments (only actual payments received)
  const totalIncome = bookings
    .filter((booking) => {
      const bookingDate = new Date(booking.startDate);
      const bookingYear = bookingDate.getFullYear();
      const bookingMonth = bookingDate.getMonth();
      
      if (bookingMonth >= 3) {
        return bookingYear === currentFY.startYear;
      } else {
        return bookingYear === currentFY.endYear;
      }
    })
    .reduce((sum, booking) => {
      return sum + booking.paidAmount;
    }, 0);

  // Calculate total expenses (only paid expenses)
  const currentFYPaidExpenses = expenses.filter((expense) => {
    const expenseDate = new Date(expense.date);
    const expenseYear = expenseDate.getFullYear();
    const expenseMonth = expenseDate.getMonth();
    
    let isCurrentFY = false;
    if (expenseMonth >= 3) {
      isCurrentFY = expenseYear === currentFY.startYear;
    } else {
      isCurrentFY = expenseYear === currentFY.endYear;
    }
    
    return isCurrentFY && expense.isPaid;
  });

  const totalExpenses = currentFYPaidExpenses.reduce((sum, expense) => sum + expense.totalAmount, 0);

  // Calculate total receivables
  const totalReceivables = bookings.reduce((sum, booking) => {
    const remaining = booking.rent - booking.paidAmount;
    return sum + (remaining > 0 ? remaining : 0);
  }, 0);

  // Calculate total payables
  const totalPayables = expenses
    .filter(expense => !expense.isPaid)
    .reduce((sum, expense) => sum + expense.totalAmount, 0);

  // Calculate banking summary
  const bankingSummary = accounts.reduce((acc, account) => {
    if (account.account_type === 'operational' && account.sub_type === 'cash') {
      acc.cashInHand += account.balance;
    } else if (account.account_type === 'operational' && account.sub_type === 'bank') {
      acc.bankBalance += account.balance;
      acc.totalBankBalance += account.balance;
    }
    return acc;
  }, { cashInHand: 0, bankBalance: 0, totalBankBalance: 0 });

  const handleAccountClick = (account: Account) => {
    setSelectedAccount(account);
  };

  if (selectedAccount) {
    return (
      <AccountTransactions 
        account={selectedAccount} 
        onBack={() => setSelectedAccount(null)} 
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

  // Calculate overdue invoices and bills for display
  const overdueInvoices = bookings.filter(booking => booking.rent > booking.paidAmount).length;
  const overdueBills = expenses.filter(expense => !expense.isPaid).length;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Financial Reports</h1>
          <p className="text-gray-600">Current Financial Year Overview</p>
        </div>

        {/* Sales & Expense Summary */}
        <SalesExpenseSummary 
          totalIncome={totalIncome}
          totalExpenses={totalExpenses}
          profit={totalIncome - totalExpenses}
          onIncomeClick={() => setCurrentView("income")}
          onExpenseClick={() => setCurrentView("expenses")}
        />

        {/* Zoho Books Style Summary */}
        <ZohoStyleSummary
          totalReceivables={totalReceivables}
          totalPayables={totalPayables}
          overdueInvoices={overdueInvoices}
          overdueBills={overdueBills}
          onPayablesClick={() => setCurrentView("payables")}
        />

        {/* Banking Summary */}
        <BankingSummaryCard 
          cashInHand={bankingSummary.cashInHand}
          bankBalance={bankingSummary.bankBalance}
          totalBalance={bankingSummary.totalBankBalance}
          onAccountClick={handleAccountClick}
          accounts={accounts}
        />
      </div>
    </div>
  );
};
