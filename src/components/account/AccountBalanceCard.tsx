
import { Plus, Minus } from "lucide-react";
import { Card } from "@/components/ui/card";

interface AccountBalanceCardProps {
  currentBalance: number;
  moneyIn: number;
  moneyOut: number;
}

export const AccountBalanceCard = ({ currentBalance, moneyIn, moneyOut }: AccountBalanceCardProps) => {
  const formatBalance = (balance: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(balance);
  };

  return (
    <Card className="p-4 mb-6">
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <p className="text-xs text-gray-500 mb-1">Current Balance</p>
          <p className={`text-lg sm:text-2xl font-bold ${
            currentBalance >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {formatBalance(currentBalance)}
          </p>
        </div>
        
        <div className="flex flex-col items-center">
          <div className="flex items-center mb-1">
            <Plus className="h-4 w-4 text-green-600 mr-1" />
            <p className="text-xs text-gray-500">Money In</p>
          </div>
          <p className="text-sm sm:text-lg font-semibold text-green-600">
            {formatBalance(moneyIn)}
          </p>
        </div>
        
        <div className="flex flex-col items-center">
          <div className="flex items-center mb-1">
            <Minus className="h-4 w-4 text-red-600 mr-1" />
            <p className="text-xs text-gray-500">Money Out</p>
          </div>
          <p className="text-sm sm:text-lg font-semibold text-red-600">
            {formatBalance(moneyOut)}
          </p>
        </div>
      </div>
    </Card>
  );
};
