
import { useState, useEffect } from "react";
import { Plus, CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useTransactions } from "@/hooks/useTransactions";
import { useAccounts, Account } from "@/hooks/useAccounts";
import { AddTransactionDialog } from "@/components/AddTransactionDialog";
import { SetOpeningBalanceDialog } from "@/components/SetOpeningBalanceDialog";
import { AccountHeader } from "@/components/account/AccountHeader";
import { TransactionHeaders } from "@/components/account/TransactionHeaders";
import { OpeningBalanceRow } from "@/components/account/OpeningBalanceRow";
import { TransactionRow } from "@/components/account/TransactionRow";
import { TransactionFilter } from "@/components/account/TransactionFilter";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface AccountTransactionsProps {
  account: Account;
  onBack: () => void;
  showFilters?: boolean;
  showBalance?: boolean;
}

export const AccountTransactions = ({ 
  account, 
  onBack, 
  showFilters = true, 
  showBalance = true 
}: AccountTransactionsProps) => {
  const { transactions, loading, addTransaction, refreshTransactions } = useTransactions(account.id);
  const { refreshAccounts, accounts } = useAccounts();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showOpeningBalanceDialog, setShowOpeningBalanceDialog] = useState(false);
  const [currentAccount, setCurrentAccount] = useState(account);
  const [transactionFilter, setTransactionFilter] = useState("all");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);

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

  // Calculate running balances for all transactions chronologically
  const calculateRunningBalances = () => {
    // Sort all transactions chronologically (oldest first)
    const sortedTransactions = [...transactions].sort((a, b) => {
      const dateA = new Date(a.transaction_date);
      const dateB = new Date(b.transaction_date);
      if (dateA.getTime() === dateB.getTime()) {
        // If same date, sort by created_at
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }
      return dateA.getTime() - dateB.getTime();
    });

    // Calculate running balance for each transaction
    let runningBalance = currentAccount.opening_balance || 0;
    const transactionsWithBalance = sortedTransactions.map(transaction => {
      // Apply this transaction to the running balance
      if (transaction.transaction_type === 'credit') {
        runningBalance += transaction.amount;
      } else {
        runningBalance -= transaction.amount;
      }
      
      return {
        transaction,
        runningBalance
      };
    });

    return transactionsWithBalance;
  };

  // Get transactions with running balances
  const transactionsWithBalance = calculateRunningBalances();

  // Filter transactions based on selected filter and date range
  const filteredTransactionsWithBalance = transactionsWithBalance.filter(({ transaction }) => {
    if (transactionFilter !== "all" && transaction.transaction_type !== transactionFilter) {
      return false;
    }
    
    const transactionDate = new Date(transaction.transaction_date);
    if (startDate && transactionDate < startDate) return false;
    if (endDate && transactionDate > endDate) return false;
    
    return true;
  }).reverse(); // Show newest first in the UI

  // Calculate money in and money out totals
  const moneyIn = transactions.reduce((sum, tx) => 
    tx.transaction_type === 'credit' ? sum + tx.amount : sum, 0
  );
  
  const moneyOut = transactions.reduce((sum, tx) => 
    tx.transaction_type === 'debit' ? sum + tx.amount : sum, 0
  );

  // Get current balance (latest transaction's running balance or opening balance)
  const currentBalance = transactionsWithBalance.length > 0 
    ? transactionsWithBalance[transactionsWithBalance.length - 1].runningBalance 
    : (currentAccount.opening_balance || 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-2 md:p-4">
      <div className="max-w-4xl mx-auto">
        <AccountHeader
          account={currentAccount}
          onBack={onBack}
          onOpeningBalanceClick={() => setShowOpeningBalanceDialog(true)}
        />

        {/* Combined Filter and Balance Row */}
        <div className="bg-white rounded-lg shadow-sm border p-3 md:p-4 mb-6 overflow-x-hidden">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {showFilters && (
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 overflow-x-auto">
                <div className="flex-shrink-0">
                  <TransactionFilter 
                    filter={transactionFilter}
                    onFilterChange={setTransactionFilter}
                  />
                </div>
                
                {/* Date Range Filter */}
                <div className="flex items-center gap-2 flex-wrap">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className={cn(
                          "justify-start text-left font-normal text-xs md:text-sm",
                          !startDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-1 h-3 w-3 md:h-4 md:w-4" />
                        <span className="hidden sm:inline">{startDate ? format(startDate, "PP") : "Start date"}</span>
                        <span className="sm:hidden">{startDate ? format(startDate, "dd/MM") : "Start"}</span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={setStartDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>

                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className={cn(
                          "justify-start text-left font-normal text-xs md:text-sm",
                          !endDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-1 h-3 w-3 md:h-4 md:w-4" />
                        <span className="hidden sm:inline">{endDate ? format(endDate, "PP") : "End date"}</span>
                        <span className="sm:hidden">{endDate ? format(endDate, "dd/MM") : "End"}</span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={setEndDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>

                  {(startDate || endDate) && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs md:text-sm"
                      onClick={() => {
                        setStartDate(undefined);
                        setEndDate(undefined);
                      }}
                    >
                      Clear
                    </Button>
                  )}
                </div>
              </div>
            )}
            
            <div className="flex items-center justify-between sm:justify-end gap-3 md:gap-6 text-xs md:text-sm">
              <div className="text-center">
                <div className="text-gray-500 text-xs">Current Balance</div>
                <div className="font-bold text-lg md:text-xl text-blue-600">
                  ₹{currentBalance.toLocaleString('en-IN')}
                </div>
              </div>
              <div className="text-center">
                <div className="text-gray-500 text-xs">Money In</div>
                <div className="font-semibold text-green-600">
                  ₹{moneyIn.toLocaleString('en-IN')}
                </div>
              </div>
              <div className="text-center">
                <div className="text-gray-500 text-xs">Money Out</div>
                <div className="font-semibold text-red-600">
                  ₹{moneyOut.toLocaleString('en-IN')}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Transaction Headers */}
        {(transactions.length > 0 || (currentAccount.opening_balance || 0) > 0) && (
          <TransactionHeaders showBalance={showBalance} />
        )}

        {/* Opening Balance Row */}
        {(currentAccount.opening_balance || 0) > 0 && (
          <OpeningBalanceRow 
            openingBalance={currentAccount.opening_balance || 0} 
            showBalance={showBalance}
          />
        )}

        {/* Transactions List */}
        <div className="space-y-2">
          {filteredTransactionsWithBalance.map(({ transaction, runningBalance }) => (
            <TransactionRow 
              key={transaction.id} 
              transaction={transaction} 
              runningBalance={runningBalance}
              showBalance={showBalance}
            />
          ))}
        </div>

        {filteredTransactionsWithBalance.length === 0 && (
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

      {/* Fixed + Button at bottom right - Only for cash/bank accounts */}
      {currentAccount.account_type === 'cash_bank' && (
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
