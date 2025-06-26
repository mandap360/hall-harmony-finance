
import { CreditCard, Banknote, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface BankingSummaryCardProps {
  cashInHand: number;
  bankBalance: number;
  totalBalance: number;
  onAccountClick?: (account: any) => void;
  accounts?: any[];
}

export const BankingSummaryCard = ({ 
  cashInHand, 
  bankBalance, 
  totalBalance, 
  onAccountClick,
  accounts = []
}: BankingSummaryCardProps) => {
  const cashAccount = accounts.find(acc => acc.sub_type === 'cash' && acc.is_default);
  const bankAccount = accounts.find(acc => acc.sub_type === 'bank' && acc.is_default);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-900 flex items-center">
        <CreditCard className="h-5 w-5 mr-2 text-blue-600" />
        Banking Summary
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card 
          className="bg-gradient-to-r from-green-500 to-green-600 text-white cursor-pointer hover:from-green-600 hover:to-green-700 transition-all"
          onClick={() => cashAccount && onAccountClick?.(cashAccount)}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Cash in Hand</CardTitle>
            <Banknote className="h-4 w-4 opacity-90" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{cashInHand.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card 
          className="bg-gradient-to-r from-blue-500 to-blue-600 text-white cursor-pointer hover:from-blue-600 hover:to-blue-700 transition-all"
          onClick={() => bankAccount && onAccountClick?.(bankAccount)}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Bank Balance</CardTitle>
            <CreditCard className="h-4 w-4 opacity-90" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{bankBalance.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Total Balance</CardTitle>
            <DollarSign className="h-4 w-4 opacity-90" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{totalBalance.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
