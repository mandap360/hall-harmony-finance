import { useState } from "react";
import { Plus, ArrowRightLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAccounts, Account } from "@/hooks/useAccounts";
import { AddAccountDialog } from "@/components/AddAccountDialog";
import { AccountTransactions } from "@/components/AccountTransactions";
import { TransferDialog } from "@/components/TransferDialog";

export const BankingPage = () => {
  const { accounts, loading, addAccount, transferAmount } = useAccounts();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showTransferDialog, setShowTransferDialog] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);

  const handleAddAccount = async (accountData: any) => {
    await addAccount(accountData);
    setShowAddDialog(false);
  };

  const formatBalance = (balance: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(balance);
  };

  const getAccountTypeDisplay = (account: Account) => {
    if (account.account_type === 'operational') {
      return 'Operational Account';
    } else if (account.account_type === 'capital') {
      return 'Capital Account';
    } else {
      return 'Other Account';
    }
  };

  const operationalAccounts = accounts.filter(acc => acc.account_type === 'operational');
  const capitalAccounts = accounts.filter(acc => acc.account_type === 'capital');
  const otherAccounts = accounts.filter(acc => acc.account_type === 'other');

  if (selectedAccount) {
    return (
      <AccountTransactions 
        account={selectedAccount} 
        onBack={() => setSelectedAccount(null)} 
      />
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const renderAccountSection = (title: string, accounts: Account[]) => (
    <div className="mb-8">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {accounts.map((account) => (
          <Card 
            key={account.id} 
            className="p-6 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setSelectedAccount(account)}
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

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Banking</h1>
          <p className="text-gray-600">Manage your cash and bank accounts</p>
        </div>

        {/* Operational Accounts */}
        {renderAccountSection("Operational Accounts", operationalAccounts)}

        {/* Capital Accounts */}
        {renderAccountSection("Capital Accounts", capitalAccounts)}

        {/* Other Accounts */}
        {renderAccountSection("Other Accounts", otherAccounts)}

        {accounts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No accounts found</p>
            <p className="text-gray-400 text-sm mt-2">Click the + button to add your first account</p>
          </div>
        )}
      </div>

      {/* Fixed Action Buttons */}
      <div className="fixed bottom-24 right-4 flex flex-col space-y-3">
        <Button
          onClick={() => setShowTransferDialog(true)}
          className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white"
          size="icon"
        >
          <ArrowRightLeft className="h-6 w-6" />
        </Button>
        
        <Button
          onClick={() => setShowAddDialog(true)}
          className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
          size="icon"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>

      <AddAccountDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSubmit={handleAddAccount}
      />

      <TransferDialog
        open={showTransferDialog}
        onOpenChange={setShowTransferDialog}
        accounts={accounts}
        onTransfer={transferAmount}
      />
    </div>
  );
};
