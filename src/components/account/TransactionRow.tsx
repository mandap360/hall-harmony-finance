
import { Card } from "@/components/ui/card";

interface Transaction {
  id: string;
  transaction_date: string;
  description?: string;
  transaction_type: 'credit' | 'debit';
  amount: number;
  balanceAfter: number;
}

interface TransactionRowProps {
  transaction: Transaction;
}

export const TransactionRow = ({ transaction }: TransactionRowProps) => {
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

  return (
    <Card className="p-4">
      <div className="grid grid-cols-5 gap-4 items-center">
        <div className="text-sm font-medium text-gray-900">
          {formatDate(transaction.transaction_date)}
        </div>
        <div className="text-sm text-gray-600">
          {transaction.description || 
            (transaction.transaction_type === 'credit' ? 'Money In' : 'Money Out')}
        </div>
        <div className="text-right">
          {transaction.transaction_type === 'credit' && (
            <span className="text-green-600 font-semibold">
              +{formatAmount(transaction.amount)}
            </span>
          )}
        </div>
        <div className="text-right">
          {transaction.transaction_type === 'debit' && (
            <span className="text-red-600 font-semibold">
              -{formatAmount(transaction.amount)}
            </span>
          )}
        </div>
        <div className="text-right">
          <span className={`font-semibold ${
            transaction.balanceAfter >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {formatAmount(transaction.balanceAfter)}
          </span>
        </div>
      </div>
    </Card>
  );
};
