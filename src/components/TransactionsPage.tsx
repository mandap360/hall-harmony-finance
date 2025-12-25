import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Plus } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { MonthNavigation } from "@/components/MonthNavigation";
import { useAccounts } from "@/hooks/useAccounts";
import { cn } from "@/lib/utils";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addMonths, subMonths } from "date-fns";
import { CurrencyDisplay } from "@/components/ui/currency-display";
import { VoucherTypeDialog, VoucherType } from "@/components/VoucherTypeDialog";
import { VoucherFormDialog } from "@/components/voucher/VoucherFormDialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface FinancialTransaction {
  id: string;
  voucher_date: string;
  amount: number;
  voucher_type: string;
  party_type: string | null;
  party_id: string | null;
  payment_method: string | null;
  from_account_id: string | null;
  to_account_id: string | null;
  description: string | null;
}

const PERIOD_OPTIONS = [
  { value: 'monthly', label: 'Monthly', short: 'M' },
  { value: 'period', label: 'Period', short: 'P' }
];

const VOUCHER_TYPE_COLORS: Record<string, string> = {
  'payment': 'bg-red-100 text-red-700 border-red-200',
  'receipt': 'bg-green-100 text-green-700 border-green-200',
  'fund_transfer': 'bg-blue-100 text-blue-700 border-blue-200'
};

const VOUCHER_TYPE_LABELS: Record<string, string> = {
  'payment': 'Payment',
  'receipt': 'Receipt',
  'fund_transfer': 'Transfer'
};

export const TransactionsPage = () => {
  const { toast } = useToast();
  const [periodType, setPeriodType] = useState('monthly');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [startDate, setStartDate] = useState<Date>(startOfWeek(new Date()));
  const [endDate, setEndDate] = useState<Date>(endOfWeek(new Date()));
  const [showVoucherDialog, setShowVoucherDialog] = useState(false);
  const [selectedVoucherType, setSelectedVoucherType] = useState<VoucherType | null>(null);
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  
  const { accounts } = useAccounts();

  const fetchFinancialTransactions = async () => {
    try {
      setLoading(true);
      const { start, end } = getDateRange();
      
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('is_financial_transaction', true)
        .gte('voucher_date', format(start, 'yyyy-MM-dd'))
        .lte('voucher_date', format(end, 'yyyy-MM-dd'))
        .order('voucher_date', { ascending: false });

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast({ title: "Error", description: "Failed to fetch transactions", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const getDateRange = () => {
    switch (periodType) {
      case 'monthly':
        return { start: startOfMonth(currentDate), end: endOfMonth(currentDate) };
      case 'period':
        return { start: startDate, end: endDate };
      default:
        return { start: startOfMonth(currentDate), end: endOfMonth(currentDate) };
    }
  };

  useEffect(() => {
    fetchFinancialTransactions();
  }, [currentDate, periodType, startDate, endDate]);

  const handlePreviousPeriod = () => {
    if (periodType === 'monthly') {
      setCurrentDate(prev => subMonths(prev, 1));
    }
  };

  const handleNextPeriod = () => {
    if (periodType === 'monthly') {
      setCurrentDate(prev => addMonths(prev, 1));
    }
  };

  const handleAddTransaction = () => {
    setShowVoucherDialog(true);
  };

  const handleVoucherSelect = (type: VoucherType) => {
    setShowVoucherDialog(false);
    setSelectedVoucherType(type);
  };

  const handleVoucherFormClose = () => {
    setSelectedVoucherType(null);
  };

  const handleVoucherSuccess = () => {
    setSelectedVoucherType(null);
    fetchFinancialTransactions();
  };

  const getAccountName = (accountId: string | null) => {
    if (!accountId) return '-';
    const account = accounts.find(a => a.id === accountId);
    return account?.name || '-';
  };

  const getFromTo = (transaction: FinancialTransaction) => {
    switch (transaction.voucher_type) {
      case 'payment':
        return {
          from: getAccountName(transaction.from_account_id),
          to: transaction.description?.replace('Payment to ', '') || '-'
        };
      case 'receipt':
        return {
          from: transaction.description?.replace('Receipt', '').trim() || 'Customer',
          to: getAccountName(transaction.to_account_id)
        };
      case 'fund_transfer':
        return {
          from: getAccountName(transaction.from_account_id),
          to: getAccountName(transaction.to_account_id)
        };
      default:
        return { from: '-', to: '-' };
    }
  };

  const renderPeriodNavigation = () => {
    if (periodType === 'period') {
      return (
        <div className="flex items-center justify-center bg-card border-b border-border px-4 py-3 gap-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-32 justify-start text-left font-normal">
                <CalendarDays className="mr-2 h-4 w-4" />
                {format(startDate, "dd/MM/yyyy")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                mode="single"
                selected={startDate}
                onSelect={(date) => date && setStartDate(date)}
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
          
          <span className="text-sm text-muted-foreground">~</span>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-32 justify-start text-left font-normal">
                <CalendarDays className="mr-2 h-4 w-4" />
                {format(endDate, "dd/MM/yyyy")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                mode="single"
                selected={endDate}
                onSelect={(date) => date && setEndDate(date)}
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
      );
    }

    return (
      <MonthNavigation 
        currentDate={currentDate}
        onPreviousMonth={handlePreviousPeriod}
        onNextMonth={handleNextPeriod}
      />
    );
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border bg-card px-4 py-3">
        <h1 className="text-lg font-semibold text-foreground">Financial Transactions</h1>
        <div className="pl-1">
          <Select value={periodType} onValueChange={setPeriodType}>
            <SelectTrigger className="w-16 h-8 border-none bg-transparent focus:ring-0 px-1 gap-0 justify-start">
              <SelectValue>
                {PERIOD_OPTIONS.find(option => option.value === periodType)?.short}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {PERIOD_OPTIONS.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {renderPeriodNavigation()}

      {/* Transaction Table Header */}
      <div className="grid grid-cols-12 gap-2 px-4 py-2 bg-muted/50 text-xs font-medium text-muted-foreground border-b">
        <div className="col-span-2">Date</div>
        <div className="col-span-3">From</div>
        <div className="col-span-3">To</div>
        <div className="col-span-2 text-right">Amount</div>
        <div className="col-span-2 text-center">Type</div>
      </div>

      {/* Transaction List */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden pb-24">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground">Loading...</div>
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No financial transactions found for this period.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {transactions.map((transaction) => {
              const { from, to } = getFromTo(transaction);
              return (
                <div 
                  key={transaction.id} 
                  className="grid grid-cols-12 gap-2 px-4 py-3 hover:bg-muted/30 transition-colors"
                >
                  <div className="col-span-2 text-sm">
                    {format(new Date(transaction.voucher_date), 'dd/MM')}
                  </div>
                  <div className="col-span-3 text-sm truncate" title={from}>
                    {from}
                  </div>
                  <div className="col-span-3 text-sm truncate" title={to}>
                    {to}
                  </div>
                  <div className="col-span-2 text-right">
                    <span className={cn(
                      "text-sm font-medium",
                      transaction.voucher_type === 'receipt' ? 'text-green-600' : 'text-red-600'
                    )}>
                      <CurrencyDisplay amount={transaction.amount} displayMode="text-only" />
                    </span>
                  </div>
                  <div className="col-span-2 flex justify-center">
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "text-xs",
                        VOUCHER_TYPE_COLORS[transaction.voucher_type] || 'bg-gray-100'
                      )}
                    >
                      {VOUCHER_TYPE_LABELS[transaction.voucher_type] || transaction.voucher_type}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* FAB */}
      <Button
        onClick={handleAddTransaction}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 bg-primary hover:bg-primary/90 text-white z-50"
        size="icon"
      >
        <Plus className="h-6 w-6" />
      </Button>

      {/* Voucher Type Selection Dialog */}
      <VoucherTypeDialog
        open={showVoucherDialog}
        onOpenChange={setShowVoucherDialog}
        onSelectVoucher={handleVoucherSelect}
      />

      {/* Voucher Form Dialog */}
      {selectedVoucherType && (
        <VoucherFormDialog
          open={!!selectedVoucherType}
          onOpenChange={(open) => !open && handleVoucherFormClose()}
          voucherType={selectedVoucherType}
          onBack={() => {
            setSelectedVoucherType(null);
            setShowVoucherDialog(true);
          }}
          onSuccess={handleVoucherSuccess}
        />
      )}
    </div>
  );
};
