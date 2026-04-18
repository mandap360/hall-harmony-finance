import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Wallet, Receipt } from 'lucide-react';
import { useBookings } from '@/hooks/useBookings';
import { useAccounts } from '@/hooks/useAccounts';
import { useTransactions } from '@/hooks/useTransactions';
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
  const { bookings } = useBookings();
  const { accounts } = useAccounts();
  const { transactions } = useTransactions();

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
    .filter((a) => a.account_type === 'cash_bank')
    .reduce((s, a) => s + (a.balance || 0), 0);

  const fmt = (n: number) => `₹${n.toLocaleString('en-IN')}`;

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <FinancialYearNavigation currentFY={selectedFY} onFYChange={setSelectedFY} />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Income</p>
                <p className="text-2xl font-bold text-green-600">{fmt(totalIncome)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Expenses</p>
                <p className="text-2xl font-bold text-red-600">{fmt(totalExpense)}</p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-600" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Refunds</p>
                <p className="text-2xl font-bold text-orange-600">{fmt(totalRefunds)}</p>
              </div>
              <Receipt className="h-8 w-8 text-orange-600" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Cash/Bank Balance</p>
                <p className="text-2xl font-bold text-primary">{fmt(cashBankBalance)}</p>
              </div>
              <Wallet className="h-8 w-8 text-primary" />
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Net Profit</p>
            <p className={`text-3xl font-bold ${totalIncome - totalExpense >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {fmt(totalIncome - totalExpense)}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground mb-1">Outstanding Receivables</p>
            <p className="text-3xl font-bold text-blue-600">{fmt(totalReceivables)}</p>
          </Card>
        </div>
      </div>
    </div>
  );
};
