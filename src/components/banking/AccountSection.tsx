
import { Card } from "@/components/ui/card";
import { Account } from "@/hooks/useAccounts";

interface AccountSectionProps {
  title: string;
  accounts: Account[];
  onAccountClick: (account: Account) => void;
  formatBalance: (balance: number) => string;
  getAccountTypeDisplay: (account: Account) => string;
}

export const AccountSection = ({ 
  title, 
  accounts, 
  onAccountClick, 
  formatBalance, 
  getAccountTypeDisplay 
}: AccountSectionProps) => {
  if (accounts.length === 0) return null;

  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {accounts.map((account) => (
          <Card 
            key={account.id} 
            className="p-6 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => onAccountClick(account)}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-semibold text-lg text-gray-900">{account.name}</h3>
                <p className="text-sm text-gray-500">{getAccountTypeDisplay(account)}</p>
              </div>
              {account.is_default && (
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                  Default
                </span>
              )}
            </div>
            
            <div className="mt-4">
              <p className="text-sm text-gray-500 mb-1">Balance</p>
              <p className={`text-2xl font-bold ${account.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatBalance(account.balance)}
              </p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
