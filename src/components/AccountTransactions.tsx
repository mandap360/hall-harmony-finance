
import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTransactions } from "@/hooks/useTransactions";
import { useAccounts, Account } from "@/hooks/useAccounts";
import { AddTransactionDialog } from "@/components/AddTransactionDialog";
import { SetOpeningBalanceDialog } from "@/components/SetOpeningBalanceDialog";
import { AccountHeader } from "@/components/account/AccountHeader";
import { AccountBalanceCard } from "@/components/account/AccountBalanceCard";
import { TransactionHeaders } from "@/components/account/TransactionHeaders";
import { OpeningBalanceRow } from "@/components/account/OpeningBalanceRow";
import { TransactionRow } from "@/components/account/TransactionRow";
import { TransactionFilter } from "@/components/account/TransactionFilter";

interface AccountTransactionsProps {
  account: Account;
  onBack: () => void;
}

export const AccountTransactions = ({ account, onBack }: AccountTransactionsProps) => {
  const { transactions, loading, addTransaction, refreshTransactions } = useTransactions(account.id);
  const { refreshAccounts, accounts } = useAccounts();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showOpeningBalanceDialog, setShowOpeningBalanceDialog] = useState(false);
  const [currentAccount, setCurrentAccount] = useState(account);
  const [transactionFilter, setTransactionFilter] = useState("all");

  // Update current account when accounts change
  useEffect(() => {
    const updatedAccount = accounts.find(acc => acc.id === account.id);
    if (updatedAccount) {
      setCurrentAccount(updatedAccount);
    }
  }, [accounts, account.id]);

  const handleAddTransaction = async (transactionData: any) => {
    await addTransaction({
      ...transactionData,
      account_id: currentAccount.id,
    });
    // Refresh accounts to show updated balance
    await refreshAccounts();
    setShowAddDialog(false);
  };

  const handleOpeningBalanceUpdate = async () => {
    // Refresh both accounts and transactions after opening balance update
    await refreshAccounts();
    await refreshTransactions();
    setShowOpeningBalanceDialog(false);
  };

  // Filter transactions based on selected filter
  const filteredTransactions = transactions.filter(transaction => {
    if (transactionFilter === "all") return true;
    return transaction.transaction_type === transactionFilter;
  });

  // Calculate money in and money out totals
  const moneyIn = transactions.reduce((sum, tx) => 
    tx.transaction_type === 'credit' ? sum + tx.amount : sum, 0
  );
  
  const moneyOut = transactions.reduce((sum, tx) => 
    tx.transaction_type === 'debit' ? sum + tx.amount : sum, 0
  );

  // Calculate running balance for each transaction starting from opening balance
  const transactionsWithBalance = filteredTransactions.map((transaction, index) => {
    // Start with opening balance
    let runningBalance = currentAccount.opening_balance || 0;
    
    // Add all transactions up to current index (transactions are sorted newest first)
    for (let i = transactions.length - 1; i >= 0; i--) {
      const tx = transactions[i];
      if (tx.transaction_date <= transaction.transaction_date) {
        if (tx.transaction_type === 'credit') {
          runningBalance += tx.amount;
        } else {
          runningBalance -= tx.amount;
        }
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
          account={currentAccount}
          onBack={onBack}
          onOpeningBalanceClick={() => setShowOpeningBalanceDialog(true)}
        />

        <AccountBalanceCard
          currentBalance={transactionsWithBalance[0]?.balanceAfter || currentAccount.opening_balance || 0}
          moneyIn={moneyIn}
          moneyOut={moneyOut}
        />

        {/* Transaction Filter */}
        <TransactionFilter 
          filter={transactionFilter}
          onFilterChange={setTransactionFilter}
        />

        {/* Transaction Headers */}
        {(transactions.length > 0 || (currentAccount.opening_balance || 0) > 0) && (
          <TransactionHeaders />
        )}

        {/* Opening Balance Row */}
        {(currentAccount.opening_balance || 0) > 0 && (
          <OpeningBalanceRow openingBalance={currentAccount.opening_balance || 0} />
        )}

        {/* Transactions List */}
        <div className="space-y-2">
          {transactionsWithBalance.map((transaction) => (
            <TransactionRow key={transaction.id} transaction={transaction} />
          ))}
        </div>

        {filteredTransactions.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No transactions found</p>
            <p className="text-gray-400 text-sm mt-2">
              {transactionFilter === "all" 
                ? "Click the + button to add your first transaction"
                : `No ${transactionFilter === "credit" ? "money in" : "money out"} transactions found`
              }
            </p>
          </div>
        )}
      </div>

      {/* Fixed + Button at bottom right - Only for operational accounts */}
      {currentAccount.account_type === 'operational' && (
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
        accountId={currentAccount.id}
        currentOpeningBalance={currentAccount.opening_balance || 0}
        onSuccess={handleOpeningBalanceUpdate}
      />
    </div>
  );
};
