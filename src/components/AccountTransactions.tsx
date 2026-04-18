import { useState, useMemo } from 'react';
import { Plus, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useTransactions, type Transaction } from '@/hooks/useTransactions';
import { useAccounts, type Account } from '@/hooks/useAccounts';
import { AddTransactionDialog } from '@/components/AddTransactionDialog';
import { SetOpeningBalanceDialog } from '@/components/SetOpeningBalanceDialog';
import { format } from 'date-fns';

interface AccountTransactionsProps {
  account: Account;
  onBack: () => void;
  showFilters?: boolean;
  showBalance?: boolean;
}

export const AccountTransactions = ({ account, onBack, showBalance = true }: AccountTransactionsProps) => {
  const { transactions, loading, refreshTransactions } = useTransactions(account.id);
  const { refreshAccounts, accounts } = useAccounts();
  const [showAdd, setShowAdd] = useState(false);
  const [showOB, setShowOB] = useState(false);

  const currentAccount = accounts.find((a) => a.id === account.id) || account;

  const sorted = useMemo(
    () =>
      [...transactions].sort((a, b) => {
        const da = new Date(a.transaction_date).getTime();
        const db = new Date(b.transaction_date).getTime();
        if (da !== db) return da - db;
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }),
    [transactions],
  );

  // Compute running balance
  let running = currentAccount.initial_balance || 0;
  const rows = sorted.map((tx) => {
    const isIn = tx.to_account_id === currentAccount.id;
    const amt = Number(tx.amount);
    if (isIn) running += amt;
    else if (tx.from_account_id === currentAccount.id) running -= amt;
    return { tx, balance: running, direction: isIn ? 'in' : ('out' as 'in' | 'out') };
  });

  const moneyIn = transactions.reduce(
    (s, t) => (t.to_account_id === currentAccount.id ? s + Number(t.amount) : s),
    0,
  );
  const moneyOut = transactions.reduce(
    (s, t) => (t.from_account_id === currentAccount.id ? s + Number(t.amount) : s),
    0,
  );
  const currentBalance = (currentAccount.initial_balance || 0) + moneyIn - moneyOut;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const fmt = (n: number) => `₹${n.toLocaleString('en-IN')}`;

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold truncate">{currentAccount.name}</h1>
            <p className="text-xs text-muted-foreground capitalize">
              {currentAccount.account_type.replace('_', '/')}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => setShowOB(true)}>
            Initial: {fmt(currentAccount.initial_balance || 0)}
          </Button>
        </div>

        <Card className="p-4 mb-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xs text-muted-foreground">Current Balance</p>
              <p className="text-lg font-bold text-primary">{fmt(currentBalance)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Money In</p>
              <p className="font-semibold text-green-600">{fmt(moneyIn)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Money Out</p>
              <p className="font-semibold text-red-600">{fmt(moneyOut)}</p>
            </div>
          </div>
        </Card>

        {rows.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No transactions yet</p>
          </Card>
        ) : (
          <div className="space-y-2">
            {[...rows].reverse().map(({ tx, balance, direction }) => (
              <Card key={tx.id} className="p-3">
                <div className={`grid gap-2 items-center ${showBalance ? 'grid-cols-4' : 'grid-cols-3'}`}>
                  <div className="text-sm">{format(new Date(tx.transaction_date), 'dd MMM yyyy')}</div>
                  <div className="text-sm text-muted-foreground truncate">
                    {tx.description || tx.type}
                  </div>
                  <div className="text-right">
                    <span className={`font-semibold text-sm ${direction === 'in' ? 'text-green-600' : 'text-red-600'}`}>
                      {direction === 'in' ? '+' : '-'}
                      {fmt(Number(tx.amount))}
                    </span>
                  </div>
                  {showBalance && (
                    <div className="text-right text-sm font-semibold">{fmt(balance)}</div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {currentAccount.account_type === 'cash_bank' && (
        <Button
          onClick={() => setShowAdd(true)}
          className="fixed bottom-24 right-4 h-14 w-14 rounded-full shadow-lg z-50"
          size="icon"
        >
          <Plus className="h-6 w-6" />
        </Button>
      )}

      <AddTransactionDialog
        open={showAdd}
        onOpenChange={setShowAdd}
        defaultAccountId={currentAccount.id}
        onSuccess={() => {
          refreshTransactions();
          refreshAccounts();
        }}
      />

      <SetOpeningBalanceDialog
        open={showOB}
        onOpenChange={setShowOB}
        accountId={currentAccount.id}
        currentOpeningBalance={currentAccount.initial_balance || 0}
        onSuccess={() => {
          refreshAccounts();
          refreshTransactions();
          setShowOB(false);
        }}
      />
    </div>
  );
};
