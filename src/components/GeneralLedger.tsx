import { useState, useEffect } from "react";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useAccounts } from "@/hooks/useAccounts";
import { supabase } from "@/integrations/supabase/client";
import { TransactionHeaders } from "@/components/account/TransactionHeaders";
import { TransactionFilter } from "@/components/account/TransactionFilter";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import backButtonIcon from "@/assets/back-button.png";

interface Transaction {
  id: string;
  account_id: string;
  transaction_type: 'credit' | 'debit';
  amount: number;
  description?: string;
  reference_type?: string;
  reference_id?: string;
  transaction_date: string;
  created_at: string;
  account_name?: string;
}

interface GeneralLedgerProps {
  onBack: () => void;
}

export const GeneralLedger = ({ onBack }: GeneralLedgerProps) => {
  const { accounts } = useAccounts();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [transactionFilter, setTransactionFilter] = useState("all");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);

  useEffect(() => {
    fetchAllTransactions();
  }, []);

  const fetchAllTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('transaction_date', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTransactions(data as Transaction[] || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get account name by id
  const getAccountName = (accountId: string) => {
    const account = accounts.find(acc => acc.id === accountId);
    return account?.name || 'Unknown Account';
  };

  // Filter transactions based on selected filter and date range
  const filteredTransactions = transactions.filter((transaction) => {
    if (transactionFilter !== "all" && transaction.transaction_type !== transactionFilter) {
      return false;
    }
    
    const transactionDate = new Date(transaction.transaction_date);
    if (startDate && transactionDate < startDate) return false;
    if (endDate && transactionDate > endDate) return false;
    
    return true;
  });

  // Calculate money in and money out totals
  const moneyIn = filteredTransactions.reduce((sum, tx) => 
    tx.transaction_type === 'credit' ? sum + tx.amount : sum, 0
  );
  
  const moneyOut = filteredTransactions.reduce((sum, tx) => 
    tx.transaction_type === 'debit' ? sum + tx.amount : sum, 0
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'dd MMM yyyy');
  };

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
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-3 md:p-4 mb-4">
          <div className="flex items-center gap-2">
            <button onClick={onBack} className="flex-shrink-0">
              <img src={backButtonIcon} alt="Back" className="h-6 w-6" />
            </button>
            <h1 className="text-lg md:text-xl font-bold text-gray-900">General Ledger</h1>
          </div>
        </div>

        {/* Combined Filter and Balance Row */}
        <div className="bg-white rounded-lg shadow-sm border p-3 md:p-4 mb-6 overflow-x-hidden">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
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
            
            <div className="flex items-center justify-between sm:justify-end gap-3 md:gap-6 text-xs md:text-sm">
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

        {/* Transaction Headers - Modified for General Ledger */}
        {filteredTransactions.length > 0 && (
          <div className="bg-gray-100 rounded-lg p-2 md:p-3 mb-2">
            <div className="grid grid-cols-4 gap-1 md:gap-4 text-xs md:text-sm font-medium text-gray-600">
              <div>Date</div>
              <div>Account</div>
              <div>Description</div>
              <div className="text-right">Amount</div>
            </div>
          </div>
        )}

        {/* Transactions List */}
        <div className="space-y-2">
          {filteredTransactions.map((transaction) => (
            <div 
              key={transaction.id} 
              className="bg-white rounded-lg shadow-sm border p-2 md:p-3"
            >
              <div className="grid grid-cols-4 gap-1 md:gap-4 items-center text-xs md:text-sm">
                <div className="text-gray-600">
                  {formatDate(transaction.transaction_date)}
                </div>
                <div className="text-gray-900 font-medium truncate">
                  {getAccountName(transaction.account_id)}
                </div>
                <div className="text-gray-600 truncate">
                  {transaction.description || '-'}
                </div>
                <div className={cn(
                  "text-right font-semibold",
                  transaction.transaction_type === 'credit' ? 'text-green-600' : 'text-red-600'
                )}>
                  {transaction.transaction_type === 'debit' ? '-' : ''}₹{transaction.amount.toLocaleString('en-IN')}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredTransactions.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No transactions found</p>
            <p className="text-gray-400 text-sm mt-2">
              {transactionFilter === "all" 
                ? "No transactions available"
                : `No ${transactionFilter === "credit" ? "money in" : "money out"} transactions found`
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
