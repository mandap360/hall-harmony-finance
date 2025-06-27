
import { CreditCard, Banknote, Building2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface BankingSummaryCardProps {
  onAccountClick?: (account: any) => void;
  accounts?: any[];
}

export const BankingSummaryCard = ({ 
  onAccountClick,
  accounts = []
}: BankingSummaryCardProps) => {
  // Filter to show only operational accounts
  const operationalAccounts = accounts.filter(acc => acc.account_type === 'operational');

  const getAccountIcon = (subType: string) => {
    switch (subType) {
      case 'cash':
        return Banknote;
      case 'bank':
        return CreditCard;
      default:
        return Building2;
    }
  };

  const getAccountColor = (subType: string) => {
    switch (subType) {
      case 'cash':
        return {
          card: "bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200 hover:from-orange-100 hover:to-orange-200",
          title: "text-orange-800",
          icon: "text-orange-600",
          amount: "text-orange-900"
        };
      case 'bank':
        return {
          card: "bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200 hover:from-blue-100 hover:to-blue-200",
          title: "text-blue-800",
          icon: "text-blue-600",
          amount: "text-blue-900"
        };
      default:
        return {
          card: "bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200 hover:from-gray-100 hover:to-gray-200",
          title: "text-gray-800",
          icon: "text-gray-600",
          amount: "text-gray-900"
        };
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-900 flex items-center">
        <CreditCard className="h-5 w-5 mr-2 text-blue-600" />
        Banking Summary
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {operationalAccounts.map((account) => {
          const Icon = getAccountIcon(account.sub_type);
          const colors = getAccountColor(account.sub_type);
          
          return (
            <Card 
              key={account.id}
              className={`${colors.card} cursor-pointer transition-all`}
              onClick={() => onAccountClick?.(account)}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className={`text-sm font-medium ${colors.title}`}>
                  {account.name}
                </CardTitle>
                <Icon className={`h-4 w-4 ${colors.icon}`} />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${colors.amount}`}>
                  ₹{account.balance.toLocaleString()}
                </div>
                {account.sub_type && (
                  <p className="text-xs text-gray-500 mt-1 capitalize">
                    {account.sub_type}
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      {operationalAccounts.length === 0 && (
        <Card className="p-6 text-center">
          <p className="text-gray-500">No operational accounts found</p>
        </Card>
      )}
    </div>
  );
};
