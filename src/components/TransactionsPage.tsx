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
import { ExpenseList } from "@/components/expense/ExpenseList";
import { AddExpenseDialog } from "@/components/AddExpenseDialog";
import { AddIncomeDialog } from "@/components/AddIncomeDialog";
import { useAccounts } from "@/hooks/useAccounts";
import { useIncome } from "@/hooks/useIncome";
import { cn } from "@/lib/utils";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addMonths, subMonths } from "date-fns";
import { CurrencyDisplay } from "@/components/ui/currency-display";

const MAIN_TABS = [  
  { id: 'expense', label: 'Expense' },
  { id: 'income', label: 'Income' }
];

const PERIOD_OPTIONS = [
  { value: 'monthly', label: 'Monthly', short: 'M' },
  { value: 'period', label: 'Period', short: 'P' }
];

export const TransactionsPage = () => {
  const [activeTab, setActiveTab] = useState('expense');
  const [periodType, setPeriodType] = useState('monthly');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedVendors, setSelectedVendors] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
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
  const { income } = useIncome();

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

  const { start: dateStart, end: dateEnd } = getDateRange();

  const filteredExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    return expenseDate >= dateStart && expenseDate <= dateEnd;
  });

  const filteredBookings = bookings.filter(booking => {
    const bookingDate = new Date(booking.startDate);
    return bookingDate >= dateStart && bookingDate <= dateEnd;
  });

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
    refetch();
    window.location.reload();
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
          selectedCategories={selectedCategories}
          selectedVendors={selectedVendors}
          selectedStatuses={selectedStatuses}
          onCategoriesChange={setSelectedCategories}
          onVendorsChange={setSelectedVendors}
          onStatusesChange={setSelectedStatuses}
          expenseCategories={expenseCategories}
          vendors={vendors}
          showFilters={true}
          onToggleFilters={() => {}}
          onApplyFilters={() => {}}
          onClearFilters={() => {
            setSelectedCategories([]);
            setSelectedVendors([]);
            setSelectedStatuses([]);
          }}
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
              let filteredIncome = income.filter(payment => {
                const paymentDate = new Date(payment.date);
                return paymentDate >= dateStart && paymentDate <= dateEnd;
              });

              if (selectedIncomeAccount !== 'all') {
                filteredIncome = filteredIncome.filter(payment => 
                  payment.payment_mode === selectedIncomeAccount
                );
              }

              if (selectedIncomeCategory !== 'all') {
                filteredIncome = filteredIncome.filter(payment => 
                  payment.type === selectedIncomeCategory
                );
              }

              return (
                <>
                  {filteredIncome.map((payment) => {
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
              
              if (selectedCategories.length > 0) {
                filteredExpenseData = filteredExpenseData.filter(expense => selectedCategories.includes(expense.category));
              }
              
              if (selectedVendors.length > 0) {
                filteredExpenseData = filteredExpenseData.filter(expense => selectedVendors.includes(expense.vendorName));
              }
              
              if (selectedStatuses.length > 0) {
                filteredExpenseData = filteredExpenseData.filter(expense => {
                  return selectedStatuses.some(status => 
                    status === 'paid' ? expense.isPaid : !expense.isPaid
                  );
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
