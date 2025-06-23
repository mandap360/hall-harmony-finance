
import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTransactions } from "@/hooks/useTransactions";
import { useAccounts, Account } from "@/hooks/useAccounts";
import { AddTransactionDialog } from "@/components/AddTransactionDialog";
import { SetOpeningBalanceDialog } from "@/components/SetOpeningBalanceDialog";
import { AccountHeader } from "@/components/account/AccountHeader";
import { OpeningBalanceDisplay } from "@/components/account/OpeningBalanceDisplay";
import { AccountBalanceCard } from "@/components/account/AccountBalanceCard";
import { TransactionHeaders } from "@/components/account/TransactionHeaders";
import { OpeningBalanceRow } from "@/components/account/OpeningBalanceRow";
import { TransactionRow } from "@/components/account/TransactionRow";

interface AccountTransactionsProps {
  account: Account;
  onBack: () => void;
}

export const AccountTransactions = ({ account, onBack }: AccountTransactionsProps) => {
  const { transactions, loading, addTransaction } = useTransactions(account.id);
  const { refreshAccounts } = useAccounts();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showOpeningBalanceDialog, setShowOpeningBalanceDialog] = useState(false);

  const handleAddTransaction = async (transactionData: any) => {
    await addTransaction({
      ...transactionData,
      account_id: account.id,
    });
    // Refresh accounts to show updated balance
    await refreshAccounts();
    setShowAddDialog(false);
  };

  // Calculate money in and money out totals
  const moneyIn = transactions.reduce((sum, tx) => 
    tx.transaction_type === 'credit' ? sum + tx.amount : sum, 0
  );
  
  const moneyOut = transactions.reduce((sum, tx) => 
    tx.transaction_type === 'debit' ? sum + tx.amount : sum, 0
  );

  // Calculate running balance for each transaction starting from opening balance
  const transactionsWithBalance = transactions.map((transaction, index) => {
    // Start with opening balance
    let runningBalance = account.opening_balance || 0;
    
    // Add all transactions up to current index (transactions are sorted newest first)
    for (let i = transactions.length - 1; i >= index; i--) {
      const tx = transactions[i];
      if (tx.transaction_type === 'credit') {
        runningBalance += tx.amount;
      } else {
        runningBalance -= tx.amount;
      }
    }
    
    return {
      ...transaction,
      balanceAfter: runningBalance
    };
  });

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
        <AccountHeader 
          account={account}
          onBack={onBack}
          onOpeningBalanceClick={() => setShowOpeningBalanceDialog(true)}
        />

        <OpeningBalanceDisplay openingBalance={account.opening_balance || 0} />

        <AccountBalanceCard
          currentBalance={transactionsWithBalance[0]?.balanceAfter || account.opening_balance || 0}
          moneyIn={moneyIn}
          moneyOut={moneyOut}
        />

        {/* Transaction Headers */}
        {(transactions.length > 0 || (account.opening_balance || 0) > 0) && (
          <TransactionHeaders />
        )}

        {/* Opening Balance Row */}
        {(account.opening_balance || 0) > 0 && (
          <OpeningBalanceRow openingBalance={account.opening_balance || 0} />
        )}

        {/* Transactions List */}
        <div className="space-y-2">
          {transactionsWithBalance.map((transaction) => (
            <TransactionRow key={transaction.id} transaction={transaction} />
          ))}
        </div>

        {transactions.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No transactions found</p>
            <p className="text-gray-400 text-sm mt-2">Click the + button to add your first transaction</p>
          </div>
        )}
      </div>

      {/* Fixed + Button at bottom right - Only for operational accounts */}
      {account.account_type === 'operational' && (
        <Button
          onClick={() => setShowAddDialog(true)}
          className="fixed bottom-24 right-4 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
          size="icon"
        >
          <Plus className="h-6 w-6" />
        </Button>
      )}

      <AddTransactionDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSubmit={handleAddTransaction}
      />

      <SetOpeningBalanceDialog
        open={showOpeningBalanceDialog}
        onOpenChange={setShowOpeningBalanceDialog}
        accountId={account.id}
        currentOpeningBalance={account.opening_balance || 0}
      />
    </div>
  );
};
