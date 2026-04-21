import { useState } from 'react';
import { useAccounts, type Account } from '@/hooks/useAccounts';
import { AddAccountDialog } from '@/components/AddAccountDialog';
import { AccountTransactions } from '@/components/AccountTransactions';
import { AccountSection } from '@/components/banking/AccountSection';
import { BankingActionButtons } from '@/components/banking/BankingActionButtons';
import { BankingEmptyState } from '@/components/banking/BankingEmptyState';

export const AccountsPage = () => {
  const { accounts, loading, addAccount, refreshAccounts } = useAccounts();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);

  const handleAddAccount = async (data: {
    name: string;
    account_type: Account['account_type'];
    initial_balance?: number;
    is_default?: boolean;
  }) => {
    await addAccount(data);
    setShowAddDialog(false);
  };

  const formatBalance = (balance: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(balance);

  const getAccountTypeDisplay = (account: Account) => {
    if (account.account_type === 'cash_bank') return 'Cash/Bank';
    return "Owner's Capital";
  };

  const cashBankAccounts = accounts.filter((a) => a.account_type === 'cash_bank');
  const capitalAccounts = accounts.filter((a) => a.account_type === 'owners_capital');

  if (selectedAccount) {
    return (
      <AccountTransactions
        account={selectedAccount}
        onBack={() => {
          refreshAccounts();
          setSelectedAccount(null);
        }}
        showBalance
      />
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (accounts.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <BankingEmptyState onAddAccount={() => setShowAddDialog(true)} />
        <AddAccountDialog open={showAddDialog} onOpenChange={setShowAddDialog} onSubmit={handleAddAccount} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <AccountSection
          title="Cash/Bank"
          accounts={cashBankAccounts}
          onAccountClick={setSelectedAccount}
          formatBalance={formatBalance}
          getAccountTypeDisplay={getAccountTypeDisplay}
        />
        <AccountSection
          title="Owner's Capital"
          accounts={capitalAccounts}
          onAccountClick={setSelectedAccount}
          formatBalance={formatBalance}
          getAccountTypeDisplay={getAccountTypeDisplay}
        />
      </div>

      <BankingActionButtons onAddAccount={() => setShowAddDialog(true)} />
      <AddAccountDialog open={showAddDialog} onOpenChange={setShowAddDialog} onSubmit={handleAddAccount} />
    </div>
  );
};
