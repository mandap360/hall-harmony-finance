import { useState, useMemo } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { MonthNavigation } from '@/components/MonthNavigation';
import { useTransactions, type TransactionType } from '@/hooks/useTransactions';
import { useAccounts } from '@/hooks/useAccounts';
import { useClients } from '@/hooks/useClients';
import { useVendors } from '@/hooks/useVendors';
import { AddTransactionDialog } from '@/components/AddTransactionDialog';
import { addMonths, subMonths, format, startOfMonth, endOfMonth } from 'date-fns';
import { cn } from '@/lib/utils';

const TYPE_COLORS: Record<TransactionType, string> = {
  Income: 'bg-green-100 text-green-700 border-green-200',
  Expense: 'bg-red-100 text-red-700 border-red-200',
  Refund: 'bg-orange-100 text-orange-700 border-orange-200',
  'Advance Paid': 'bg-purple-100 text-purple-700 border-purple-200',
  Transfer: 'bg-blue-100 text-blue-700 border-blue-200',
};

export const TransactionsPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showAdd, setShowAdd] = useState(false);
  const { transactions, refreshTransactions } = useTransactions();
  const { accounts } = useAccounts();
  const { clients } = useClients();
  const { vendors } = useVendors();

  const accountMap = useMemo(() => new Map(accounts.map((a) => [a.id, a.name])), [accounts]);
  const entityMap = useMemo(() => {
    const m = new Map<string, string>();
    clients.forEach((c) => m.set(c.client_id, c.name));
    vendors.forEach((v) => m.set(v.vendor_id, v.name));
    return m;
  }, [clients, vendors]);

  const start = startOfMonth(currentDate);
  const end = endOfMonth(currentDate);

  const filtered = transactions.filter((t) => {
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

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card px-4 py-3">
        <h1 className="text-lg font-semibold">Transactions</h1>
      </div>

      <MonthNavigation
        currentDate={currentDate}
        onPreviousMonth={() => setCurrentDate((d) => subMonths(d, 1))}
        onNextMonth={() => setCurrentDate((d) => addMonths(d, 1))}
      />

      <div className="grid grid-cols-12 gap-2 px-4 py-2 bg-muted/50 text-xs font-medium text-muted-foreground border-b">
        <div className="col-span-2">Date</div>
        <div className="col-span-3">From</div>
        <div className="col-span-3">To</div>
        <div className="col-span-2 text-right">Amount</div>
        <div className="col-span-2 text-center">Type</div>
      </div>

      <div className="pb-24">
        {filtered.length === 0 ? (
          <Card className="m-4 p-8 text-center text-muted-foreground">No transactions for this month</Card>
        ) : (
          <div className="divide-y divide-border">
            {filtered.map((t) => {
              const { from, to } = getFromTo(t);
              return (
                <div key={t.id} className="grid grid-cols-12 gap-2 px-4 py-3 hover:bg-muted/30">
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

      <Button
        onClick={() => setShowAdd(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50"
        size="icon"
      >
        <Plus className="h-6 w-6" />
      </Button>

      <AddTransactionDialog open={showAdd} onOpenChange={setShowAdd} onSuccess={refreshTransactions} />
    </div>
  );
};
