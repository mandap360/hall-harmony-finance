
import { CreditCard, Banknote } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface BankingSummaryCardProps {
  cashInHand: number;
  bankBalance: number;
  onAccountClick?: (account: any) => void;
  accounts?: any[];
}

export const BankingSummaryCard = ({ 
  cashInHand, 
  bankBalance, 
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card 
          className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200 cursor-pointer hover:from-orange-100 hover:to-orange-200 transition-all"
          onClick={() => cashAccount && onAccountClick?.(cashAccount)}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-800">Cash in Hand</CardTitle>
            <Banknote className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">
              ₹{cashInHand.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card 
          className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200 cursor-pointer hover:from-blue-100 hover:to-blue-200 transition-all"
          onClick={() => bankAccount && onAccountClick?.(bankAccount)}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">Bank Balance</CardTitle>
            <CreditCard className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">
              ₹{bankBalance.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
