
import { ArrowLeft, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Account } from "@/hooks/useAccounts";
import { formatBalance } from "@/utils/currency";

interface AccountHeaderProps {
  account: Account;
  onBack: () => void;
  onOpeningBalanceClick: () => void;
}

export const AccountHeader = ({ account, onBack, onOpeningBalanceClick }: AccountHeaderProps) => {
  const formatBalanceDisplay = (balance: number) => {
    return formatBalance(balance);
  };

  return (
    <div className="flex items-center mb-6">
      <Button
        variant="ghost"
        size="sm"
        onClick={onBack}
        className="mr-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>
      <div className="flex-1">
        <h1 className="text-2xl font-bold text-gray-900">{account.name}</h1>
        <p className="text-gray-600 capitalize">{account.account_type} Account</p>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={onOpeningBalanceClick}
        className="ml-4"
      >
        <Settings className="h-4 w-4 mr-2" />
        Opening Balance {formatBalanceDisplay(account.opening_balance || 0)}
      </Button>
    </div>
  );
};
