import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, CalendarDays, Filter, Plus } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { useExpenses } from "@/hooks/useExpenses";
import { useBookings } from "@/hooks/useBookings";

import { useVendors } from "@/hooks/useVendors";
import { useCategories } from "@/hooks/useCategories";
import { ExpenseFilters } from "@/components/expense/ExpenseFilters";
import { MonthNavigation } from "@/components/MonthNavigation";
import { ExpenseCard } from "@/components/ExpenseCard";
import { ExpenseList } from "@/components/expense/ExpenseList";
import { AddExpenseDialog } from "@/components/AddExpenseDialog";
import { AddIncomeDialog } from "@/components/AddIncomeDialog";

import { useAccounts } from "@/hooks/useAccounts";
import { usePayments } from "@/hooks/usePayments";
import { cn } from "@/lib/utils";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, startOfYear, endOfYear, addYears, subYears, addMonths, subMonths } from "date-fns";
import { CurrencyDisplay } from "@/components/ui/currency-display";

const COLORS = {
  household: '#ff6b6b',
  social: '#ffa726', 
  food: '#ffeb3b',
  transport: '#66bb6a',
  utility: '#42a5f5',
  entertainment: '#ab47bc',
  healthcare: '#ef5350',
  education: '#26c6da',
  shopping: '#8d6e63',
  other: '#78909c'
};

const MAIN_TABS = [
  { id: 'income', label: 'Income' },
  { id: 'expense', label: 'Expense' }
];

const PERIOD_OPTIONS = [
  { value: 'monthly', label: 'Monthly', short: 'M' },
  { value: 'yearly', label: 'Yearly', short: 'Y' },
  { value: 'weekly', label: 'Weekly', short: 'W' },
  { value: 'period', label: 'Period', short: 'P' }
];

export const TransactionsPage = () => {
  const [activeTab, setActiveTab] = useState('income');
  const [periodType, setPeriodType] = useState('monthly');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedVendor, setSelectedVendor] = useState('all');
  const [paymentStatus, setPaymentStatus] = useState('all');
  const [selectedIncomeAccount, setSelectedIncomeAccount] = useState('all');
  const [selectedIncomeCategory, setSelectedIncomeCategory] = useState('all');
  const [startDate, setStartDate] = useState<Date>(startOfWeek(new Date()));
  const [endDate, setEndDate] = useState<Date>(endOfWeek(new Date()));
  const [showAddExpenseDialog, setShowAddExpenseDialog] = useState(false);
  const [showAddIncomeDialog, setShowAddIncomeDialog] = useState(false);
  
  const { expenses, addExpense, refetch } = useExpenses();
  const { getExpenseCategories } = useCategories();
  const expenseCategories = getExpenseCategories();
  const { bookings } = useBookings();
  const { vendors } = useVendors();
  const { accounts } = useAccounts();
  const { payments } = usePayments();

  const getDateRange = () => {
    switch (periodType) {
      case 'monthly':
        return { start: startOfMonth(currentDate), end: endOfMonth(currentDate) };
      case 'yearly':
        return { start: startOfYear(currentDate), end: endOfYear(currentDate) };
      case 'weekly':
        return { start: startOfWeek(currentDate), end: endOfWeek(currentDate) };
      case 'period':
        return { start: startDate, end: endDate };
      default:
        return { start: startOfMonth(currentDate), end: endOfMonth(currentDate) };
    }
  };

  const { start: dateStart, end: dateEnd } = getDateRange();

  const filteredExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    return expenseDate >= dateStart && expenseDate <= dateEnd;
  });

  const filteredBookings = bookings.filter(booking => {
    const bookingDate = new Date(booking.startDate);
    return bookingDate >= dateStart && bookingDate <= dateEnd;
  });

  const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const rentIncome = filteredBookings.reduce((sum, booking) => sum + booking.paidAmount, 0);

  const pendingExpenses = expenses.filter(expense => !expense.isPaid);
  const pendingBookings = bookings.filter(booking => booking.paidAmount < booking.rentFinalized);

  const handlePreviousPeriod = () => {
    switch (periodType) {
      case 'monthly':
        setCurrentDate(prev => subMonths(prev, 1));
        break;
      case 'yearly':
        setCurrentDate(prev => subYears(prev, 1));
        break;
      case 'weekly':
        setCurrentDate(prev => addDays(prev, -7));
        break;
    }
  };

  const handleNextPeriod = () => {
    switch (periodType) {
      case 'monthly':
        setCurrentDate(prev => addMonths(prev, 1));
        break;
      case 'yearly':
        setCurrentDate(prev => addYears(prev, 1));
        break;
      case 'weekly':
        setCurrentDate(prev => addDays(prev, 7));
        break;
    }
  };

  const handleAddExpense = async (expenseData: any) => {
    try {
      await addExpense(expenseData);
      setShowAddExpenseDialog(false);
      refetch();
    } catch (error) {
      console.error('Error adding expense:', error);
    }
  };

  const handleIncomeAdded = () => {
    // Trigger a refresh of the data
    refetch();
    window.location.reload(); // Simple refresh to ensure all data is updated
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

    if (periodType === 'weekly') {
      const weekStart = startOfWeek(currentDate);
      const weekEnd = endOfWeek(currentDate);
      return (
        <div className="flex items-center justify-center bg-card border-b border-border px-4 py-3 gap-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePreviousPeriod}
            className="h-10 w-10 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 p-0"
          >
            <Calendar className="h-5 w-5" />
          </Button>
          
          <h2 className="text-xl font-semibold text-foreground min-w-[200px] text-center">
            {format(weekStart, "dd/MM")} ~ {format(weekEnd, "dd/MM/yyyy")}
          </h2>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleNextPeriod}
            className="h-10 w-10 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 p-0"
          >
            <Calendar className="h-5 w-5" />
          </Button>
        </div>
      );
    }

    if (periodType === 'yearly') {
      return (
        <div className="flex items-center justify-center bg-card border-b border-border px-4 py-3 gap-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePreviousPeriod}
            className="h-10 w-10 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 p-0"
          >
            <Calendar className="h-5 w-5" />
          </Button>
          
          <h2 className="text-xl font-semibold text-foreground min-w-[200px] text-center">
            FY {format(startOfYear(currentDate), "yyyy")}-{format(endOfYear(currentDate), "yy")}
          </h2>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleNextPeriod}
            className="h-10 w-10 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 p-0"
          >
            <Calendar className="h-5 w-5" />
          </Button>
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
      <div className="flex items-center justify-between border-b border-border bg-card">
        <div className="flex flex-1">
          {MAIN_TABS.map(tab => (
            <Button
              key={tab.id}
              variant="ghost"
              className={cn(
                "flex-1 rounded-none border-b-2 h-12 font-medium",
                activeTab === tab.id 
                  ? 'border-blue-500 bg-transparent text-orange-600' 
                  : 'border-transparent text-foreground hover:text-foreground hover:bg-muted'
              )}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </Button>
          ))}
        </div>
        
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

      {activeTab === 'expense' && (
        <ExpenseFilters
          selectedCategory={selectedCategory}
          selectedVendor={selectedVendor}
          paymentStatus={paymentStatus}
          startDate={undefined}
          endDate={undefined}
          onCategoryChange={setSelectedCategory}
          onVendorChange={setSelectedVendor}
          onPaymentStatusChange={setPaymentStatus}
          onStartDateChange={() => {}}
          onEndDateChange={() => {}}
          expenseCategories={expenseCategories}
          vendors={vendors}
          showFilters={true}
          onToggleFilters={() => setShowFilters(!showFilters)}
        />
      )}

      {activeTab === 'income' && (
        <div className="bg-white border-b">
          <div className="p-4 flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
            >
              <Filter className="h-4 w-4" />
            </Button>
            
            <div className="flex-1">
              <div className="flex gap-4 overflow-x-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted/30 hover:scrollbar-thumb-muted/50 pb-2">
                <div className="flex-shrink-0 min-w-0 w-full max-w-xs">
                  <Select value={selectedIncomeAccount} onValueChange={setSelectedIncomeAccount}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Accounts" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Accounts</SelectItem>
                      {accounts.map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex-shrink-0 min-w-0 w-full max-w-xs">
                  <Select value={selectedIncomeCategory} onValueChange={setSelectedIncomeCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="rent">Rent</SelectItem>
                      <SelectItem value="Secondary Income">Secondary Income</SelectItem>
                      <SelectItem value="refund">Refund</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        {activeTab === 'income' && (
          <div className="p-4 space-y-4">
            {(() => {
              let filteredPayments = payments.filter(payment => {
                const paymentDate = new Date(payment.date);
                return paymentDate >= dateStart && paymentDate <= dateEnd;
              });

              if (selectedIncomeAccount !== 'all') {
                filteredPayments = filteredPayments.filter(payment => 
                  payment.payment_mode === selectedIncomeAccount
                );
              }

              if (selectedIncomeCategory !== 'all') {
                filteredPayments = filteredPayments.filter(payment => 
                  payment.type === selectedIncomeCategory
                );
              }

              const formatDateRange = (startDate: string, endDate: string) => {
                const startDateOnly = startDate.split('T')[0];
                const endDateOnly = endDate.split('T')[0];
                
                const startDateFormatted = new Date(startDateOnly + 'T00:00:00').toLocaleDateString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric'
                });
                
                const endDateFormatted = new Date(endDateOnly + 'T00:00:00').toLocaleDateString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric'
                });

                const isSameDate = startDateOnly === endDateOnly;
                return isSameDate ? startDateFormatted : `${startDateFormatted} - ${endDateFormatted}`;
              };

              const rentPayments = filteredPayments.filter(p => p.type === 'rent');
              const secondaryPayments = filteredPayments.filter(p => p.type === 'Secondary Income');
              const refundPayments = filteredPayments.filter(p => p.amount < 0);
              
              const totalRent = rentPayments.reduce((sum, p) => sum + p.amount, 0);
              const totalSecondary = secondaryPayments.reduce((sum, p) => sum + p.amount, 0);
              const totalRefunds = refundPayments.reduce((sum, p) => sum + Math.abs(p.amount), 0);
              const netIncome = totalRent + totalSecondary - totalRefunds;

              return (
                <>

                  {filteredPayments.map((payment) => {
                    return (
                      <Card key={payment.id} className="p-4">
                        <div className="space-y-2">
                          <h4 className="font-semibold text-foreground">
                            {payment.description || 'Payment'}
                          </h4>
                          
                          <div className={`text-lg font-bold ${payment.amount < 0 ? 'text-red-600' : 'text-green-600'}`}>
                            <CurrencyDisplay amount={Math.abs(payment.amount)} displayMode="text-only" />
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(payment.date), 'dd MMM yyyy')}
                            </p>
                            <Badge variant="outline" className="px-3 py-1 bg-muted/80 border-muted-foreground/20">
                              {(() => {
                                const account = accounts.find(acc => acc.id === payment.payment_mode);
                                return account ? account.name : 'Cash';
                              })()}
                            </Badge>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                 </>
              );
            })()}
          </div>
        )}

        {activeTab === 'expense' && (
          <div className="p-4 w-full max-w-full">
            {(() => {
              let filteredExpenseData = filteredExpenses;
              
              if (selectedCategory !== 'all') {
                filteredExpenseData = filteredExpenseData.filter(expense => expense.category === selectedCategory);
              }
              
              if (selectedVendor !== 'all') {
                filteredExpenseData = filteredExpenseData.filter(expense => expense.vendorName === selectedVendor);
              }
              
              if (paymentStatus !== 'all') {
                filteredExpenseData = filteredExpenseData.filter(expense => {
                  return paymentStatus === 'paid' ? expense.isPaid : !expense.isPaid;
                });
              }

              return (
                <>
                  <ExpenseList 
                    expenses={filteredExpenseData} 
                    onExpenseUpdated={refetch} 
                  />
                  
                  {filteredExpenseData.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No expenses found for the selected filters.
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        )}
      </div>

      {activeTab === 'income' && (
        <Button
          onClick={() => setShowAddIncomeDialog(true)}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 bg-primary hover:bg-primary/90 text-white z-50"
          size="icon"
        >
          <Plus className="h-6 w-6" />
        </Button>
      )}

      {activeTab === 'expense' && (
        <Button
          onClick={() => setShowAddExpenseDialog(true)}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 bg-primary hover:bg-primary/90 text-white z-50"
          size="icon"
        >
          <Plus className="h-6 w-6" />
        </Button>
      )}

      <AddExpenseDialog
        open={showAddExpenseDialog}
        onOpenChange={setShowAddExpenseDialog}
        onSubmit={handleAddExpense}
      />

      <AddIncomeDialog
        open={showAddIncomeDialog}
        onOpenChange={setShowAddIncomeDialog}
        onIncomeAdded={handleIncomeAdded}
      />
      
    </div>
  );
};
