import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Wallet, Receipt, ChevronDown, ChevronUp } from 'lucide-react';
import { useBookings } from '@/hooks/useBookings';
import { useAccounts } from '@/hooks/useAccounts';
import { useTransactions } from '@/hooks/useTransactions';
import { useIncomeAllocations } from '@/hooks/useIncomeAllocations';
import { useAccountCategories } from '@/hooks/useAccountCategories';
import { useBills } from '@/hooks/useBills';
import { formatINR, APP_CONSTANTS } from '@/utils/constants';
import { FinancialYearNavigation } from '@/components/reports/FinancialYearNavigation';
import { getCurrentFY } from '@/components/reports/FinancialYearCalculator';

const inFY = (date: string, fy: { startYear: number; endYear: number }) => {
  const d = new Date(date);
  const m = d.getMonth();
  const y = d.getFullYear();
  if (m >= 3) return y === fy.startYear;
  return y === fy.endYear;
};

export const ReportsPage = () => {
  const [selectedFY, setSelectedFY] = useState(getCurrentFY());
  const [expandedIncomeDetails, setExpandedIncomeDetails] = useState(false);
  const [expandedExpenseDetails, setExpandedExpenseDetails] = useState(false);
  const { bookings } = useBookings();
  const { accounts } = useAccounts();
  const { transactions } = useTransactions();
  const { allocations } = useIncomeAllocations();
  const { categories } = useAccountCategories();
  const { bills } = useBills();

  const fyTxs = useMemo(
    () => transactions.filter((t) => inFY(t.transaction_date, selectedFY) && t.transaction_status !== 'Void'),
    [transactions, selectedFY],
  );

  const totalIncome = fyTxs.filter((t) => t.type === 'Income').reduce((s, t) => s + Number(t.amount), 0);
  const totalExpense = fyTxs.filter((t) => t.type === 'Expense').reduce((s, t) => s + Number(t.amount), 0);
  const totalRefunds = fyTxs.filter((t) => t.type === 'Refund').reduce((s, t) => s + Number(t.amount), 0);

  const totalReceivables = bookings
    .filter((b) => b.status !== 'cancelled' && inFY(b.endDate, selectedFY))
    .reduce((sum, b) => sum + Math.max(0, b.rentFinalized - b.rentReceived), 0);

  const cashBankBalance = accounts
    .filter((a) => a.account_type === APP_CONSTANTS.ACCOUNT_TYPE_DB.CASH_BANK)
    .reduce((s, a) => s + (a.balance || 0), 0);

  // Calculate income breakdown by category
  const fyIncomeTransactionIds = fyTxs
    .filter((t) => t.type === 'Income')
    .map((t) => t.id);
  const fyIncomeAllocations = allocations.filter((a) => fyIncomeTransactionIds.includes(a.transaction_id));
  
  const incomeByCategory = useMemo(() => {
    const breakdown: Record<string, number> = {};
    fyIncomeAllocations.forEach((alloc) => {
      const category = categories.find((c) => c.id === alloc.category_id);
      if (!category) return;
      
      // Skip "Secondary Deposit" — it's the pool, not a final income category
      if (category.name === 'Secondary Deposit') return;
      
      const categoryName = category.name || 'Uncategorized';
      breakdown[categoryName] = (breakdown[categoryName] || 0) + Number(alloc.amount);
    });
    return breakdown;
  }, [fyIncomeAllocations, categories]);

  // Calculate expense breakdown by category
  const fyBills = bills.filter((b) => inFY(b.date, selectedFY));
  const expenseByCategory = useMemo(() => {
    const breakdown: Record<string, number> = {};
    fyBills.forEach((bill) => {
      const category = categories.find((c) => c.id === bill.category_id);
      const categoryName = category?.name || 'Uncategorized';
      breakdown[categoryName] = (breakdown[categoryName] || 0) + Number(bill.amount);
    });
    return breakdown;
  }, [fyBills, categories]);

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <FinancialYearNavigation currentFY={selectedFY} onFYChange={setSelectedFY} />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Total Income</p>
                <p className="text-2xl font-bold text-green-600">{formatINR(totalIncome)}</p>
              </div>
              <div className="flex gap-2">
                <TrendingUp className="h-8 w-8 text-green-600" />
                {Object.keys(incomeByCategory).length > 0 && (
                  <button
                    onClick={() => setExpandedIncomeDetails(!expandedIncomeDetails)}
                    className="hover:bg-gray-100 rounded p-1 transition-colors"
                  >
                    {expandedIncomeDetails ? (
                      <ChevronUp className="h-5 w-5" />
                    ) : (
                      <ChevronDown className="h-5 w-5" />
                    )}
                  </button>
                )}
              </div>
            </div>
            {expandedIncomeDetails && Object.keys(incomeByCategory).length > 0 && (
              <div className="mt-4 pt-4 border-t space-y-2">
                {Object.entries(incomeByCategory).map(([category, amount]) => (
                  <div key={category} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{category}</span>
                    <span className="font-semibold text-green-600">{formatINR(amount)}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Total Expenses</p>
                <p className="text-2xl font-bold text-red-600">{formatINR(totalExpense)}</p>
              </div>
              <div className="flex gap-2">
                <TrendingDown className="h-8 w-8 text-red-600" />
                {Object.keys(expenseByCategory).length > 0 && (
                  <button
                    onClick={() => setExpandedExpenseDetails(!expandedExpenseDetails)}
                    className="hover:bg-gray-100 rounded p-1 transition-colors"
                  >
                    {expandedExpenseDetails ? (
                      <ChevronUp className="h-5 w-5" />
                    ) : (
                      <ChevronDown className="h-5 w-5" />
                    )}
                  </button>
                )}
              </div>
            </div>
            {expandedExpenseDetails && Object.keys(expenseByCategory).length > 0 && (
              <div className="mt-4 pt-4 border-t space-y-2">
                {Object.entries(expenseByCategory).map(([category, amount]) => (
                  <div key={category} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{category}</span>
                    <span className="font-semibold text-red-600">{formatINR(amount)}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Refunds</p>
                <p className="text-2xl font-bold text-orange-600">{formatINR(totalRefunds)}</p>
              </div>
              <Receipt className="h-8 w-8 text-orange-600" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Cash/Bank Balance</p>
                <p className="text-2xl font-bold text-primary">{formatINR(cashBankBalance)}</p>
              </div>
              <Wallet className="h-8 w-8 text-primary" />
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Net Profit</p>
            <p className={`text-3xl font-bold ${totalIncome - totalExpense >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatINR(totalIncome - totalExpense)}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Outstanding Receivables</p>
            <p className="text-3xl font-bold text-blue-600">{formatINR(totalReceivables)}</p>
          </Card>
        </div>
      </div>
    </div>
  );
};
