
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
    <Card className="p-4 bg-blue-50 border-blue-200 mb-2">
      <div className={`grid gap-4 items-center ${
        showBalance ? 'grid-cols-5' : 'grid-cols-4'
      }`}>
        <div className="text-sm font-medium text-blue-900">
          Opening Balance
        </div>
        <div className="text-sm text-blue-700">
          Starting balance for this account
        </div>
        <div className="text-right">
          {/* Empty for Money In column */}
        </div>
        <div className="text-right">
          {/* Empty for Money Out column */}
        </div>
        {showBalance && (
          <div className="text-right">
            <span className="font-semibold text-blue-600">
              {formatAmount(openingBalance)}
            </span>
          </div>
        )}
      </div>
    </Card>
  );
};
