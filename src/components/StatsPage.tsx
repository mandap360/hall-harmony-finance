import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, CalendarDays } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { useExpenses } from "@/hooks/useExpenses";
import { useBookings } from "@/hooks/useBookings";
import { useAdditionalIncome } from "@/hooks/useAdditionalIncome";
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
  { id: 'income-expense', label: 'Income & Expense' },
  { id: 'outstandings', label: 'Outstandings' }
];

const PERIOD_OPTIONS = [
  { value: 'monthly', label: 'Monthly', short: 'M' },
  { value: 'yearly', label: 'Yearly', short: 'Y' },
  { value: 'weekly', label: 'Weekly', short: 'W' },
  { value: 'period', label: 'Period', short: 'P' }
];

export const StatsPage = () => {
  const [activeTab, setActiveTab] = useState('income-expense');
  const [periodType, setPeriodType] = useState('monthly');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [subTab, setSubTab] = useState('income');
  const [startDate, setStartDate] = useState<Date>(startOfWeek(new Date()));
  const [endDate, setEndDate] = useState<Date>(endOfWeek(new Date()));
  
  const { expenses } = useExpenses();
  const { bookings } = useBookings();
  const { additionalIncomes } = useAdditionalIncome();

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
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">From:</span>
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
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">To:</span>
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
        <MonthNavigation 
          currentDate={currentDate}
          onPreviousMonth={handlePreviousPeriod}
          onNextMonth={handleNextPeriod}
        />
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
              onClick={() => {
                setActiveTab(tab.id);
                setSubTab(tab.id === 'income-expense' ? 'income' : 'receivables');
              }}
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

      {/* Sub Tabs */}
      <div className="flex border-b border-border bg-background">
        {activeTab === 'income-expense' ? (
          <>
            <Button
              variant="ghost"
              className={cn(
                "flex-1 rounded-none border-b-2 h-12",
                subTab === 'income'
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-transparent text-foreground hover:text-foreground hover:bg-muted'
              )}
              onClick={() => setSubTab('income')}
            >
              Income
            </Button>
            <Button
              variant="ghost"
              className={cn(
                "flex-1 rounded-none border-b-2 h-12",
                subTab === 'expenses'
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-transparent text-foreground hover:text-foreground hover:bg-muted'
              )}
              onClick={() => setSubTab('expenses')}
            >
              Expenses
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="ghost"
              className={cn(
                "flex-1 rounded-none border-b-2 h-12",
                subTab === 'receivables'
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-transparent text-foreground hover:text-foreground hover:bg-muted'
              )}
              onClick={() => setSubTab('receivables')}
            >
              Receivables
            </Button>
            <Button
              variant="ghost"
              className={cn(
                "flex-1 rounded-none border-b-2 h-12",
                subTab === 'payables'
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-transparent text-foreground hover:text-foreground hover:bg-muted'
              )}
              onClick={() => setSubTab('payables')}
            >
              Payables
            </Button>
          </>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'income-expense' && subTab === 'income' && (
          <div className="p-4 space-y-4">
            <div className="mb-4">
              <h3 className="text-lg font-semibold">Income - {formatCurrency(totalIncome)}</h3>
            </div>
            {filteredBookings.map((booking) => (
              <Card key={booking.id} className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold">{booking.eventName}</h4>
                    <p className="text-sm text-muted-foreground">{booking.clientName}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(booking.startDate), 'dd MMM yyyy')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatCurrency(booking.paidAmount)}</p>
                    <Badge variant={booking.paidAmount >= booking.rent ? "default" : "secondary"}>
                      {booking.paidAmount >= booking.rent ? "Completed" : "Pending"}
                    </Badge>
                  </div>
                </div>
              </Card>
            ))}
            {filteredAdditionalIncome.map((income) => (
              <Card key={income.id} className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold">{income.category}</h4>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(income.created_at), 'dd MMM yyyy')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatCurrency(income.amount)}</p>
                    <Badge variant="default">Completed</Badge>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {activeTab === 'income-expense' && subTab === 'expenses' && (
          <div className="p-4 space-y-4">
            <div className="mb-4">
              <h3 className="text-lg font-semibold">Expenses - {formatCurrency(totalExpenses)}</h3>
            </div>
            {filteredExpenses.map((expense) => (
              <div key={expense.id} className="relative">
                <ExpenseCard expense={expense} />
                <div className="absolute top-4 right-4">
                  <Badge variant={expense.isPaid ? "default" : "secondary"}>
                    {expense.isPaid ? "Completed" : "Pending"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'outstandings' && subTab === 'receivables' && (
          <div className="p-4 space-y-4">
            <div className="mb-4">
              <h3 className="text-lg font-semibold">Pending Receivables</h3>
            </div>
            {pendingBookings.map((booking) => (
              <Card key={booking.id} className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold">{booking.eventName}</h4>
                    <p className="text-sm text-muted-foreground">{booking.clientName}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(booking.startDate), 'dd MMM yyyy')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-red-600">
                      {formatCurrency(booking.rent - booking.paidAmount)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Paid: {formatCurrency(booking.paidAmount)} / {formatCurrency(booking.rent)}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {activeTab === 'outstandings' && subTab === 'payables' && (
          <div className="p-4 space-y-4">
            <div className="mb-4">
              <h3 className="text-lg font-semibold">Pending Payables</h3>
            </div>
            {pendingExpenses.map((expense) => (
              <div key={expense.id} className="relative">
                <ExpenseCard expense={expense} />
                <div className="absolute top-4 right-4">
                  <Badge variant="destructive">Pending</Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};