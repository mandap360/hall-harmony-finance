import { useState } from "react";
import { useAccounts, Account } from "@/hooks/useAccounts";
import { AddAccountDialog } from "@/components/AddAccountDialog";
import { AccountTransactions } from "@/components/AccountTransactions";
import { TransferDialog } from "@/components/TransferDialog";
import { AccountSection } from "@/components/banking/AccountSection";
import { BankingActionButtons } from "@/components/banking/BankingActionButtons";
import { BankingEmptyState } from "@/components/banking/BankingEmptyState";

export const AccountsPage = () => {
  const { accounts, loading, addAccount, transferAmount, refreshAccounts } = useAccounts();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showTransferDialog, setShowTransferDialog] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);

  const handleAddAccount = async (accountData: any) => {
    await addAccount(accountData);
    setShowAddDialog(false);
  };

  const handleAccountBack = () => {
    // Refresh accounts when returning from transaction view
    refreshAccounts();
    setSelectedAccount(null);
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
        onBack={handleAccountBack}
        showFilters={false}
        showBalance={true}
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

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <AccountSection
          title="Operational Accounts"
          accounts={operationalAccounts}
          onAccountClick={setSelectedAccount}
          formatBalance={formatBalance}
          getAccountTypeDisplay={getAccountTypeDisplay}
        />

        <AccountSection
          title="Capital Accounts"
          accounts={capitalAccounts}
          onAccountClick={setSelectedAccount}
          formatBalance={formatBalance}
          getAccountTypeDisplay={getAccountTypeDisplay}
        />

        <AccountSection
          title="Other Accounts"
          accounts={otherAccounts}
          onAccountClick={setSelectedAccount}
          formatBalance={formatBalance}
          getAccountTypeDisplay={getAccountTypeDisplay}
        />

        {accounts.length === 0 && <BankingEmptyState />}
      </div>

      <BankingActionButtons
        onAddAccount={() => setShowAddDialog(true)}
        onTransfer={() => setShowTransferDialog(true)}
      />

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