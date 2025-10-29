
import { Card } from "@/components/ui/card";

interface OpeningBalanceRowProps {
  openingBalance: number;
  showBalance?: boolean;
}

export const OpeningBalanceRow = ({ openingBalance, showBalance = true }: OpeningBalanceRowProps) => {
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Card className="p-3 md:p-4 bg-blue-50 border-blue-200 mb-2">
      <div className={`grid gap-2 md:gap-4 items-center ${
        showBalance ? 'grid-cols-4' : 'grid-cols-3'
      }`}>
        <div className="text-xs md:text-sm font-medium text-blue-900">
          Opening Balance
        </div>
        <div className="text-xs md:text-sm text-blue-700 truncate">
          Starting balance for this account
        </div>
        <div className="text-right">
          <span className={`text-xs md:text-sm font-semibold ${
            openingBalance >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {formatAmount(openingBalance)}
          </span>
        </div>
        {showBalance && (
          <div className="text-right">
            <span className="text-xs md:text-sm font-semibold text-gray-900">
              {formatAmount(openingBalance)}
            </span>
          </div>
        )}
      </div>
    </Card>
  );
};
