
import { useState } from "react";
import { ArrowLeft, Plus, Settings, TrendingUp, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useTransactions } from "@/hooks/useTransactions";
import { useAccounts, Account } from "@/hooks/useAccounts";
import { AddTransactionDialog } from "@/components/AddTransactionDialog";
import { SetOpeningBalanceDialog } from "@/components/SetOpeningBalanceDialog";

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

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatBalance = (balance: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(balance);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
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
            onClick={() => setShowOpeningBalanceDialog(true)}
            className="ml-4"
          >
            <Settings className="h-4 w-4 mr-2" />
            Opening Balance
          </Button>
        </div>

        {/* Account Balance Card with Money In/Out */}
        <Card className="p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-gray-500 mb-1">Current Balance</p>
              <p className={`text-3xl font-bold ${
                (transactionsWithBalance[0]?.balanceAfter || account.opening_balance || 0) >= 0 
                  ? 'text-green-600' 
                  : 'text-red-600'
              }`}>
                {formatBalance(transactionsWithBalance[0]?.balanceAfter || account.opening_balance || 0)}
              </p>
            </div>
            
            <div className="flex items-center">
              <TrendingUp className="h-5 w-5 text-green-600 mr-2" />
              <div>
                <p className="text-sm text-gray-500">Money In</p>
                <p className="text-xl font-semibold text-green-600">
                  {formatBalance(moneyIn)}
                </p>
              </div>
            </div>
            
            <div className="flex items-center">
              <TrendingDown className="h-5 w-5 text-red-600 mr-2" />
              <div>
                <p className="text-sm text-gray-500">Money Out</p>
                <p className="text-xl font-semibold text-red-600">
                  {formatBalance(moneyOut)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="text-right">
              <p className="text-sm text-gray-500">Opening Balance</p>
              <p className="text-xl font-semibold text-gray-900">
                {formatBalance(account.opening_balance || 0)}
              </p>
            </div>
          </div>
        </Card>

        {/* Transaction Headers */}
        {(transactions.length > 0 || (account.opening_balance || 0) > 0) && (
          <div className="grid grid-cols-5 gap-4 p-4 bg-gray-100 rounded-lg mb-4 text-sm font-medium text-gray-700">
            <div>Date</div>
            <div>Description</div>
            <div className="text-right">Money In</div>
            <div className="text-right">Money Out</div>
            <div className="text-right">Balance</div>
          </div>
        )}

        {/* Opening Balance Row */}
        {(account.opening_balance || 0) > 0 && (
          <Card className="p-4 mb-2">
            <div className="grid grid-cols-5 gap-4 items-center">
              <div className="text-sm font-medium text-gray-900">
                Opening
              </div>
              <div className="text-sm text-gray-600">
                Opening Balance
              </div>
              <div className="text-right">
                <span className="text-green-600 font-semibold">
                  +{formatAmount(account.opening_balance || 0)}
                </span>
              </div>
              <div className="text-right">
                -
              </div>
              <div className="text-right">
                <span className="font-semibold text-green-600">
                  {formatAmount(account.opening_balance || 0)}
                </span>
              </div>
            </div>
          </Card>
        )}

        {/* Transactions List */}
        <div className="space-y-2">
          {transactionsWithBalance.map((transaction) => (
            <Card key={transaction.id} className="p-4">
              <div className="grid grid-cols-5 gap-4 items-center">
                <div className="text-sm font-medium text-gray-900">
                  {formatDate(transaction.transaction_date)}
                </div>
                <div className="text-sm text-gray-600">
                  {transaction.description || 
                    (transaction.transaction_type === 'credit' ? 'Money In' : 'Money Out')}
                </div>
                <div className="text-right">
                  {transaction.transaction_type === 'credit' && (
                    <span className="text-green-600 font-semibold">
                      +{formatAmount(transaction.amount)}
                    </span>
                  )}
                </div>
                <div className="text-right">
                  {transaction.transaction_type === 'debit' && (
                    <span className="text-red-600 font-semibold">
                      -{formatAmount(transaction.amount)}
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <span className={`font-semibold ${
                    transaction.balanceAfter >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatAmount(transaction.balanceAfter)}
                  </span>
                </div>
              </div>
            </Card>
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
