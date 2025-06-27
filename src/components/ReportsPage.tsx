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
import { UnpaidBillsView } from "@/components/reports/UnpaidBillsView";
import { AccountTransactions } from "@/components/AccountTransactions";
import { Account } from "@/hooks/useAccounts";
import { calculateIncomeData } from "@/components/reports/IncomeCalculator";
import { calculateExpenseData } from "@/components/reports/ExpenseCalculator";

export const ReportsPage = () => {
  const [currentView, setCurrentView] = useState("dashboard");
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const { bookings } = useBookings();
  const { expenses } = useExpenses();
  const { accounts } = useAccounts();

  const incomeData = calculateIncomeData(bookings);
  
  // Extract refund data from bookings
  const bookingRefunds = bookings.flatMap(booking => 
    (booking.payments || [])
      .filter(payment => payment.type === 'refund')
      .map(payment => ({
        amount: Math.abs(payment.amount),
        date: payment.date,
        description: payment.description || `Refund for ${booking.eventName}`
      }))
  );

  const expenseData = calculateExpenseData(expenses, bookingRefunds);

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

        {/* Zoho Books Style Summary */}
        <ZohoStyleSummary
          totalReceivables={incomeData.totalReceivables}
          totalPayables={expenseData.totalPayables}
          overdueInvoices={overdueInvoices}
          overdueBills={overdueBills}
          onPendingBillsClick={() => setCurrentView("unpaid-bills")}
        />

        {/* Banking Summary - Moved above Sales & Expense */}
        <BankingSummaryCard 
          cashInHand={bankingSummary.cashInHand}
          bankBalance={bankingSummary.bankBalance}
          onAccountClick={handleAccountClick}
          accounts={accounts}
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
