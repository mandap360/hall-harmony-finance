
import { Card } from "@/components/ui/card";
import { Plus, Minus } from "lucide-react";
import { formatBalance } from "@/utils/currency";

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
    return formatBalance(amount);
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
      <div className={`grid gap-4 items-center ${
        showBalance ? 'grid-cols-5' : 'grid-cols-4'
      }`}>
        <div className="text-sm font-medium text-gray-900">
          {formatDate(transaction.transaction_date)}
        </div>
        <div className="text-sm text-gray-600">
          {transaction.description || 
            (transaction.transaction_type === 'credit' ? 'Money In' : 'Money Out')}
        </div>
        <div className="text-right">
          {transaction.transaction_type === 'credit' && (
            <div className="flex items-center justify-end">
              <Plus className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-green-600 font-semibold">
                {formatAmount(transaction.amount)}
              </span>
            </div>
          )}
        </div>
        <div className="text-right">
          {transaction.transaction_type === 'debit' && (
            <div className="flex items-center justify-end">
              <Minus className="h-4 w-4 text-red-600 mr-1" />
              <span className="text-red-600 font-semibold">
                {formatAmount(transaction.amount)}
              </span>
            </div>
          )}
        </div>
        {showBalance && (
          <div className="text-right">
            <span className={`font-semibold ${
              runningBalance >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {formatAmount(runningBalance)}
            </span>
          </div>
        )}
      </div>
    </Card>
  );
};
