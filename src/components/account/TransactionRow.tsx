
import { Card } from "@/components/ui/card";

interface Transaction {
  id: string;
  transaction_date: string;
  description?: string;
  transaction_type: 'credit' | 'debit';
  amount: number;
  balanceAfter?: number;
}

interface TransactionRowProps {
  transaction: Transaction;
  runningBalance: number;
  showBalance?: boolean;
}

export const TransactionRow = ({ transaction, runningBalance, showBalance = true }: TransactionRowProps) => {
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const displayAmount = transaction.transaction_type === 'credit' 
    ? transaction.amount 
    : -transaction.amount;

  return (
    <Card className="p-3 md:p-4">
      <div className={`grid gap-2 md:gap-4 items-center ${
        showBalance ? 'grid-cols-4' : 'grid-cols-3'
      }`}>
        <div className="text-xs md:text-sm font-medium text-gray-900">
          {formatDate(transaction.transaction_date)}
        </div>
        <div className="text-xs md:text-sm text-gray-600 truncate">
          {transaction.description || 
            (transaction.transaction_type === 'credit' ? 'Money In' : 'Money Out')}
        </div>
        <div className="text-right">
          <span className={`text-xs md:text-sm font-semibold ${
            transaction.transaction_type === 'credit' ? 'text-green-600' : 'text-red-600'
          }`}>
            {formatAmount(displayAmount)}
          </span>
        </div>
        {showBalance && (
          <div className="text-right">
            <span className="text-xs md:text-sm font-semibold text-gray-900">
              {formatAmount(runningBalance)}
            </span>
          </div>
        )}
      </div>
    </Card>
  );
};
