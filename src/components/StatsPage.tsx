import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, CalendarDays, Filter } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { useExpenses } from "@/hooks/useExpenses";
import { useBookings } from "@/hooks/useBookings";
import { useAdditionalIncome } from "@/hooks/useAdditionalIncome";
import { useVendors } from "@/hooks/useVendors";
import { useCategories } from "@/hooks/useCategories";
import { ExpenseFilters } from "@/components/expense/ExpenseFilters";
import { MonthNavigation } from "@/components/MonthNavigation";
import { ExpenseCard } from "@/components/ExpenseCard";
import { cn } from "@/lib/utils";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, startOfYear, endOfYear, addYears, subYears, addMonths, subMonths } from "date-fns";

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

export const StatsPage = () => {
  const [activeTab, setActiveTab] = useState('income');
  const [periodType, setPeriodType] = useState('monthly');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedVendor, setSelectedVendor] = useState('all');
  const [paymentStatus, setPaymentStatus] = useState('all');
  const [startDate, setStartDate] = useState<Date>(startOfWeek(new Date()));
  const [endDate, setEndDate] = useState<Date>(endOfWeek(new Date()));
  
  const { expenses } = useExpenses();
  const { getExpenseCategories } = useCategories();
  const expenseCategories = getExpenseCategories();
  const { bookings } = useBookings();
  const { additionalIncomes } = useAdditionalIncome();
  const { vendors } = useVendors();

  // Get date range based on period type
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

  // Filter data for current period
  const filteredExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    return expenseDate >= dateStart && expenseDate <= dateEnd;
  });

  const filteredBookings = bookings.filter(booking => {
    const bookingDate = new Date(booking.startDate);
    return bookingDate >= dateStart && bookingDate <= dateEnd;
  });

  const filteredAdditionalIncome = additionalIncomes.filter(income => {
    const incomeDate = new Date(income.created_at);
    return incomeDate >= dateStart && incomeDate <= dateEnd;
  });

  // Calculate totals
  const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const rentIncome = filteredBookings.reduce((sum, booking) => sum + booking.paidAmount, 0);
  const additionalIncomeTotal = filteredAdditionalIncome.reduce((sum, income) => sum + income.amount, 0);
  const totalIncome = rentIncome + additionalIncomeTotal;

  // Get pending items
  const pendingExpenses = expenses.filter(expense => !expense.isPaid);
  const pendingBookings = bookings.filter(booking => booking.paidAmount < booking.rent);

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

  const formatCurrency = (amount: number) => {
    return `₹ ${amount.toLocaleString()}`;
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
    <div className="min-h-screen bg-background">
      {/* Main Tab Navigation with Period Dropdown */}
      <div className="flex items-center justify-between border-b border-border bg-card">
        <div className="flex flex-1">
          {MAIN_TABS.map(tab => (
            <Button
              key={tab.id}
              variant="ghost"
              className={cn(
                "flex-1 rounded-none border-b-2 h-12 font-medium",
                activeTab === tab.id 
                  ? 'border-primary bg-primary text-primary-foreground' 
                  : 'border-transparent text-foreground hover:text-foreground hover:bg-muted'
              )}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </Button>
          ))}
        </div>
        
        {/* Period Dropdown */}
        <div className="px-4">
          <Select value={periodType} onValueChange={setPeriodType}>
            <SelectTrigger className="w-12 h-8 border-none bg-transparent focus:ring-0">
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

      {/* Period Navigation */}
      {renderPeriodNavigation()}

      {/* Filters */}
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
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters(!showFilters)}
        />
      )}

      {activeTab === 'income' && (
        <div className="bg-white border-b">
          <div className="p-4 flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowFilters(!showFilters)}
              className="h-8 w-8"
            >
              <Filter className="h-4 w-4" />
            </Button>
            
            {showFilters && (
              <div className="flex-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select value={paymentStatus} onValueChange={setPaymentStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="paid">Completed</SelectItem>
                      <SelectItem value="unpaid">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'income' && (
          <div className="p-4 space-y-4">
            {/* Apply income filters */}
            {(() => {
              let filteredIncomeData = [...filteredBookings, ...filteredAdditionalIncome];
              
              if (paymentStatus !== 'all') {
                filteredIncomeData = filteredIncomeData.filter(item => {
                  if ('paidAmount' in item) {
                    // Booking
                    return paymentStatus === 'paid' ? item.paidAmount >= item.rent : item.paidAmount < item.rent;
                  } else {
                    // Additional income - always completed
                    return paymentStatus === 'paid';
                  }
                });
              }

              return (
                <>
                  {filteredIncomeData.map((item) => {
                    if ('eventName' in item) {
                      // Booking
                      return (
                        <Card key={`booking-${item.id}`} className="p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-semibold">{item.eventName}</h4>
                              <p className="text-sm text-muted-foreground">{item.clientName}</p>
                              <p className="text-sm text-muted-foreground">
                                {format(new Date(item.startDate), 'dd MMM yyyy')}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">{formatCurrency(item.paidAmount)}</p>
                              <Badge variant={item.paidAmount >= item.rent ? "default" : "secondary"}>
                                {item.paidAmount >= item.rent ? "Completed" : "Pending"}
                              </Badge>
                            </div>
                          </div>
                        </Card>
                      );
                    } else {
                      // Additional income
                      return (
                        <Card key={`income-${item.id}`} className="p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-semibold">{item.category}</h4>
                              <p className="text-sm text-muted-foreground">
                                {format(new Date(item.created_at), 'dd MMM yyyy')}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">{formatCurrency(item.amount)}</p>
                              <Badge variant="default">Completed</Badge>
                            </div>
                          </div>
                        </Card>
                      );
                    }
                  })}
                </>
              );
            })()}
          </div>
        )}

        {activeTab === 'expense' && (
          <div className="p-4 space-y-4">
            {/* Apply expense filters */}
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

              return filteredExpenseData.map((expense) => (
                <div key={expense.id} className="relative">
                  <ExpenseCard expense={expense} />
                  <div className="absolute top-4 right-4">
                    <Badge variant={expense.isPaid ? "default" : "secondary"}>
                      {expense.isPaid ? "Completed" : "Pending"}
                    </Badge>
                  </div>
                </div>
              ));
            })()}
          </div>
        )}
      </div>

    </div>
  );
};