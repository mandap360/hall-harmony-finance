
import { useState } from "react";
import { ArrowLeft, Plus, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useTransactions } from "@/hooks/useTransactions";
import { Account } from "@/hooks/useAccounts";
import { AddTransactionDialog } from "@/components/AddTransactionDialog";

interface AccountTransactionsProps {
  account: Account;
  onBack: () => void;
}

export const AccountTransactions = ({ account, onBack }: AccountTransactionsProps) => {
  const { transactions, loading, addTransaction } = useTransactions(account.id);
  const [showAddDialog, setShowAddDialog] = useState(false);

  const handleAddTransaction = async (transactionData: any) => {
    await addTransaction({
      ...transactionData,
      account_id: account.id,
    });
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
        </div>

        {/* Account Balance Card */}
        <Card className="p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500 mb-1">Current Balance</p>
              <p className={`text-3xl font-bold ${account.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatBalance(account.balance)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Total Transactions</p>
              <p className="text-xl font-semibold text-gray-900">{transactions.length}</p>
            </div>
          </div>
        </Card>

        {/* Transactions List */}
        <div className="space-y-3">
          {transactions.map((transaction) => (
            <Card key={transaction.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-full ${
                    transaction.transaction_type === 'credit' 
                      ? 'bg-green-100 text-green-600' 
                      : 'bg-red-100 text-red-600'
                  }`}>
                    {transaction.transaction_type === 'credit' ? (
                      <ArrowDownRight className="h-4 w-4" />
                    ) : (
                      <ArrowUpRight className="h-4 w-4" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {transaction.description || 
                        (transaction.transaction_type === 'credit' ? 'Money In' : 'Money Out')}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatDate(transaction.transaction_date)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${
                    transaction.transaction_type === 'credit' 
                      ? 'text-green-600' 
                      : 'text-red-600'
                  }`}>
                    {transaction.transaction_type === 'credit' ? '+' : '-'}
                    {formatAmount(transaction.amount)}
                  </p>
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

      {/* Fixed + Button at bottom right */}
      <Button
        onClick={() => setShowAddDialog(true)}
        className="fixed bottom-24 right-4 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
        size="icon"
      >
        <Plus className="h-6 w-6" />
      </Button>

      <AddTransactionDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSubmit={handleAddTransaction}
      />
    </div>
  );
};
