import { useState, useMemo } from 'react';
import { Plus, CreditCard, TrendingUp, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { MonthNavigation } from '@/components/MonthNavigation';
import { useAccounts, type Account } from '@/hooks/useAccounts';
import { useTransactions, type TransactionType } from '@/hooks/useTransactions';
import { useClients } from '@/hooks/useClients';
import { useVendors } from '@/hooks/useVendors';
import { AddAccountDialog } from '@/components/AddAccountDialog';
import { AddTransactionDialog } from '@/components/AddTransactionDialog';
import { AccountTransactions } from '@/components/AccountTransactions';
import { addMonths, subMonths, format, startOfMonth, endOfMonth } from 'date-fns';
import { cn } from '@/lib/utils';

const TYPE_COLORS: Record<TransactionType, string> = {
  Income: 'bg-green-100 text-green-700 border-green-200',
  Expense: 'bg-red-100 text-red-700 border-red-200',
  Refund: 'bg-orange-100 text-orange-700 border-orange-200',
  'Advance Paid': 'bg-purple-100 text-purple-700 border-purple-200',
  Transfer: 'bg-blue-100 text-blue-700 border-blue-200',
};

export const BankingPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);

  const { accounts, loading, addAccount, refreshAccounts } = useAccounts();
  const { transactions, refreshTransactions } = useTransactions();
  const { clients } = useClients();
  const { vendors } = useVendors();

  const accountMap = useMemo(() => new Map(accounts.map((a) => [a.id, a.name])), [accounts]);
  const entityMap = useMemo(() => {
    const m = new Map<string, string>();
    clients.forEach((c) => m.set(c.client_id, c.name));
    vendors.forEach((v) => m.set(v.vendor_id, v.name));
    return m;
  }, [clients, vendors]);

  const formatBalance = (balance: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(balance);

  const start = startOfMonth(currentDate);
  const end = endOfMonth(currentDate);

  const filteredTransactions = transactions.filter((t) => {
    const d = new Date(t.transaction_date);
    return d >= start && d <= end && t.transaction_status !== 'Void';
  });

  const getFromTo = (t: typeof transactions[number]) => {
    const fromAcc = t.from_account_id ? accountMap.get(t.from_account_id) : null;
    const toAcc = t.to_account_id ? accountMap.get(t.to_account_id) : null;
    const entity = t.entity_id ? entityMap.get(t.entity_id) : null;
    return {
      from: fromAcc || entity || '-',
      to: toAcc || entity || '-',
    };
  };

  const handleAddAccount = async (data: {
    name: string;
    account_type: Account['account_type'];
    initial_balance?: number;
    is_default?: boolean;
  }) => {
    await addAccount(data);
    setShowAddAccount(false);
  };

  const cashBankAccounts = accounts.filter((a) => a.account_type === 'cash_bank');
  const capitalAccounts = accounts.filter((a) => a.account_type === 'owners_capital');
  const totalBalance = accounts.reduce((sum, a) => sum + (a.balance || 0), 0);

  if (selectedAccount) {
    return (
      <AccountTransactions
        account={selectedAccount}
        onBack={() => {
          refreshAccounts();
          setSelectedAccount(null);
        }}
        showBalance
      />
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-border bg-card">
        <div className="px-4 py-4">
          <h1 className="text-2xl font-bold">Banking</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage accounts and transactions</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Summary Card */}
        {accounts.length > 0 && (
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700 font-medium">Total Balance</p>
                <p className="text-3xl font-bold text-blue-900 mt-1">{formatBalance(totalBalance)}</p>
              </div>
              <Wallet className="h-12 w-12 text-blue-300" />
            </div>
          </Card>
        )}

        {/* Accounts Section */}
        {accounts.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Accounts</h2>
              <Button
                onClick={() => setShowAddAccount(true)}
                size="sm"
                variant="outline"
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Account
              </Button>
            </div>

            {/* Cash/Bank Accounts */}
            {cashBankAccounts.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-medium text-muted-foreground mb-3">Cash & Bank</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {cashBankAccounts.map((account) => (
                    <Card
                      key={account.id}
                      className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => setSelectedAccount(account)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-muted-foreground">{account.name}</p>
                          <p className="text-xl font-bold mt-2">{formatBalance(account.balance || 0)}</p>
                        </div>
                        <CreditCard className="h-5 w-5 text-blue-500 flex-shrink-0" />
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Capital Accounts */}
            {capitalAccounts.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-3">Owner's Capital</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {capitalAccounts.map((account) => (
                    <Card
                      key={account.id}
                      className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => setSelectedAccount(account)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-muted-foreground">{account.name}</p>
                          <p className="text-xl font-bold mt-2">{formatBalance(account.balance || 0)}</p>
                        </div>
                        <TrendingUp className="h-5 w-5 text-green-500 flex-shrink-0" />
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Transactions Section */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Recent Transactions</h2>

          <MonthNavigation
            currentDate={currentDate}
            onPreviousMonth={() => setCurrentDate((d) => subMonths(d, 1))}
            onNextMonth={() => setCurrentDate((d) => addMonths(d, 1))}
          />

          {/* Table Header */}
          <div className="grid grid-cols-12 gap-2 px-4 py-3 bg-muted/50 text-xs font-medium text-muted-foreground border-b rounded-t-lg mb-0">
            <div className="col-span-2">Date</div>
            <div className="col-span-3">From</div>
            <div className="col-span-3">To</div>
            <div className="col-span-2 text-right">Amount</div>
            <div className="col-span-2 text-center">Type</div>
          </div>

          {/* Transactions List */}
          {filteredTransactions.length === 0 ? (
            <Card className="p-8 text-center text-muted-foreground rounded-b-lg">
              No transactions for {format(currentDate, 'MMMM yyyy')}
            </Card>
          ) : (
            <div className="divide-y divide-border border rounded-b-lg overflow-hidden">
              {filteredTransactions.map((t) => {
                const { from, to } = getFromTo(t);
                return (
                  <div key={t.id} className="grid grid-cols-12 gap-2 px-4 py-3 hover:bg-muted/30 transition-colors">
                    <div className="col-span-2 text-sm">{format(new Date(t.transaction_date), 'dd/MM')}</div>
                    <div className="col-span-3 text-sm truncate" title={from}>
                      {from}
                    </div>
                    <div className="col-span-3 text-sm truncate" title={to}>
                      {to}
                    </div>
                    <div className="col-span-2 text-right font-medium text-sm">
                      ₹{Number(t.amount).toLocaleString('en-IN')}
                    </div>
                    <div className="col-span-2 flex justify-center">
                      <Badge variant="outline" className={cn('text-xs', TYPE_COLORS[t.type])}>
                        {t.type}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* FAB Button for Adding Transaction */}
      <Button
        onClick={() => setShowAddTransaction(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50 gap-2"
        size="icon"
      >
        <Plus className="h-6 w-6" />
      </Button>

      {/* Dialogs */}
      <AddAccountDialog
        open={showAddAccount}
        onOpenChange={setShowAddAccount}
        onSubmit={handleAddAccount}
      />
      <AddTransactionDialog
        open={showAddTransaction}
        onOpenChange={setShowAddTransaction}
        onSuccess={() => {
          setShowAddTransaction(false);
          refreshTransactions();
        }}
      />
    </div>
  );
};
