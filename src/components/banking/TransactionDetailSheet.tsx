import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Transaction, TransactionType } from '@/hooks/useTransactions';
import { cn } from '@/lib/utils';

const TYPE_COLORS: Record<TransactionType, string> = {
  Income: 'bg-green-100 text-green-700 border-green-200',
  Expense: 'bg-red-100 text-red-700 border-red-200',
  Refund: 'bg-orange-100 text-orange-700 border-orange-200',
  'Advance Paid': 'bg-purple-100 text-purple-700 border-purple-200',
  Transfer: 'bg-blue-100 text-blue-700 border-blue-200',
};

interface TransactionDetailSheetProps {
  transaction: Transaction | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accountMap: Map<string, string>;
  entityMap: Map<string, string>;
}

export const TransactionDetailSheet = ({
  transaction,
  open,
  onOpenChange,
  accountMap,
  entityMap,
}: TransactionDetailSheetProps) => {
  if (!transaction) return null;

  const fromName = transaction.from_account_id
    ? accountMap.get(transaction.from_account_id)
    : transaction.entity_id
      ? entityMap.get(transaction.entity_id)
      : null;
  const toName = transaction.to_account_id
    ? accountMap.get(transaction.to_account_id)
    : transaction.entity_id
      ? entityMap.get(transaction.entity_id)
      : null;

  const sourceLink =
    transaction.type === 'Expense' || transaction.type === 'Advance Paid'
      ? { to: '/expenses', label: 'View on Expenses' }
      : transaction.type === 'Income' || transaction.type === 'Refund'
        ? { to: '/bookings', label: 'View on Bookings' }
        : null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            Transaction Details
            <Badge variant="outline" className={cn('text-xs', TYPE_COLORS[transaction.type])}>
              {transaction.type}
            </Badge>
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          <div>
            <p className="text-xs text-muted-foreground">Amount</p>
            <p className="text-2xl font-bold">₹{Number(transaction.amount).toLocaleString('en-IN')}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Date</p>
              <p className="text-sm font-medium">
                {format(new Date(transaction.transaction_date), 'dd MMM yyyy')}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Status</p>
              <p className="text-sm font-medium">{transaction.transaction_status}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">From</p>
              <p className="text-sm font-medium">{fromName || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">To</p>
              <p className="text-sm font-medium">{toName || '—'}</p>
            </div>
          </div>

          {transaction.description && (
            <div>
              <p className="text-xs text-muted-foreground">Description</p>
              <p className="text-sm">{transaction.description}</p>
            </div>
          )}

          {sourceLink && (
            <Button asChild variant="outline" className="w-full">
              <Link to={sourceLink.to} onClick={() => onOpenChange(false)}>
                {sourceLink.label}
              </Link>
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
