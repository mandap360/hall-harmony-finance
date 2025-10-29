
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Account } from "@/hooks/useAccounts";
import backButtonIcon from "@/assets/back-button.png";

interface AccountHeaderProps {
  account: Account;
  onBack: () => void;
  onOpeningBalanceClick: () => void;
}

export const AccountHeader = ({ account, onBack, onOpeningBalanceClick }: AccountHeaderProps) => {
  const formatBalance = (balance: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(balance);
  };

  return (
    <div className="flex items-center mb-6 gap-2">
      <button
        onClick={onBack}
        className="flex-shrink-0"
      >
        <img src={backButtonIcon} alt="Back" className="h-10 w-10 md:h-12 md:w-12" />
      </button>
      <div className="flex-1 min-w-0">
        <h1 className="text-lg md:text-2xl font-bold text-gray-900 truncate">{account.name}</h1>
        <p className="text-xs md:text-sm text-gray-600 capitalize">{account.account_type} Account</p>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={onOpeningBalanceClick}
        className="flex-shrink-0 text-xs md:text-sm px-2 md:px-4"
      >
        <Settings className="h-3 w-3 md:h-4 md:w-4 mr-1" />
        <span className="hidden md:inline">Opening Balance</span>
        <span className="md:hidden">OB</span>
        <span className="ml-1">{formatBalance(account.opening_balance || 0)}</span>
      </Button>
    </div>
  );
};
