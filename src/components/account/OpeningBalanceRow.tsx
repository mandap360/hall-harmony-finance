
import { Card } from "@/components/ui/card";

interface OpeningBalanceRowProps {
  openingBalance: number;
}

export const OpeningBalanceRow = ({ openingBalance }: OpeningBalanceRowProps) => {
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Card className="p-4 mb-2">
      <div className="grid grid-cols-5 gap-4 items-center">
        <div className="text-sm font-medium text-gray-900">
          Opening
        </div>
        <div className="text-sm text-gray-600">
          Opening Balance
        </div>
        <div className="text-right">
          <span className="text-green-600 font-semibold">
            +{formatAmount(openingBalance)}
          </span>
        </div>
        <div className="text-right">
          -
        </div>
        <div className="text-right">
          <span className="font-semibold text-green-600">
            {formatAmount(openingBalance)}
          </span>
        </div>
      </div>
    </Card>
  );
};
