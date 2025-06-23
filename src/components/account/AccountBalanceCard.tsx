
import { TrendingUp, TrendingDown } from "lucide-react";
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
    <Card className="p-6 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <p className="text-sm text-gray-500 mb-1">Current Balance</p>
          <p className={`text-3xl font-bold ${
            currentBalance >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {formatBalance(currentBalance)}
          </p>
        </div>
        
        <div className="flex items-center">
          <TrendingUp className="h-5 w-5 text-green-600 mr-2" />
          <div>
            <p className="text-sm text-gray-500">Money In</p>
            <p className="text-xl font-semibold text-green-600">
              {formatBalance(moneyIn)}
            </p>
          </div>
        </div>
        
        <div className="flex items-center">
          <TrendingDown className="h-5 w-5 text-red-600 mr-2" />
          <div>
            <p className="text-sm text-gray-500">Money Out</p>
            <p className="text-xl font-semibold text-red-600">
              {formatBalance(moneyOut)}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};
