import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { useExpenses } from "@/hooks/useExpenses";
import { useBookings } from "@/hooks/useBookings";
import { useAdditionalIncome } from "@/hooks/useAdditionalIncome";
import { useCategories } from "@/hooks/useCategories";
import { format, startOfMonth, endOfMonth } from "date-fns";

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

const TABS = [
  { id: 'stats', label: 'Stats' },
  { id: 'budget', label: 'Budget' },
  { id: 'note', label: 'Note' }
];

export const StatsPage = () => {
  const [activeTab, setActiveTab] = useState('stats');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewType, setViewType] = useState<'income' | 'expenses'>('expenses');
  
  const { expenses } = useExpenses();
  const { bookings } = useBookings();
  const { additionalIncomes } = useAdditionalIncome();
  const { categories } = useCategories();

  // Filter data for current month
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);

  const currentMonthExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    return expenseDate >= monthStart && expenseDate <= monthEnd;
  });

  const currentMonthBookings = bookings.filter(booking => {
    const bookingDate = new Date(booking.startDate);
    return bookingDate >= monthStart && bookingDate <= monthEnd;
  });

  const currentMonthAdditionalIncome = additionalIncomes.filter(income => {
    const incomeDate = new Date(income.created_at);
    return incomeDate >= monthStart && incomeDate <= monthEnd;
  });

  // Calculate expense data by category
  const expensesByCategory = currentMonthExpenses.reduce((acc, expense) => {
    const categoryName = expense.category?.toLowerCase() || 'other';
    acc[categoryName] = (acc[categoryName] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);

  const totalExpenses = Object.values(expensesByCategory).reduce((sum, amount) => sum + amount, 0);

  // Calculate income data
  const rentIncome = currentMonthBookings.reduce((sum, booking) => sum + booking.paidAmount, 0);
  const additionalIncomeTotal = currentMonthAdditionalIncome.reduce((sum, income) => sum + income.amount, 0);
  const totalIncome = rentIncome + additionalIncomeTotal;

  // Prepare chart data
  const chartData = Object.entries(expensesByCategory).map(([category, amount]) => ({
    name: category,
    value: amount,
    percentage: ((amount / totalExpenses) * 100).toFixed(1)
  }));

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const getColorForCategory = (category: string): string => {
    return COLORS[category as keyof typeof COLORS] || COLORS.other;
  };

  const formatCurrency = (amount: number) => {
    return `₹ ${amount.toLocaleString()}`;
  };

  const displayAmount = viewType === 'income' ? totalIncome : totalExpenses;

  return (
    <div className="min-h-screen bg-background">
      {/* Tab Navigation */}
      <div className="flex border-b border-border">
        {TABS.map(tab => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? "default" : "ghost"}
            className={`flex-1 rounded-none border-b-2 ${
              activeTab === tab.id 
                ? 'border-primary text-primary' 
                : 'border-transparent text-muted-foreground'
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {activeTab === 'stats' && (
        <div className="p-4 max-w-4xl mx-auto">
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigateMonth('prev')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <h2 className="text-xl font-semibold">
              {format(currentDate, 'MMM yyyy')}
            </h2>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigateMonth('next')}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Income/Expense Toggle */}
          <div className="flex gap-4 mb-6">
            <Button
              variant={viewType === 'income' ? "default" : "outline"}
              onClick={() => setViewType('income')}
              className="flex-1"
            >
              Income
            </Button>
            <div className="flex items-center px-4 py-2 bg-primary text-primary-foreground rounded">
              <span className="text-sm font-medium">
                {viewType === 'income' ? 'Inc.' : 'Exp.'} {formatCurrency(displayAmount)}
              </span>
            </div>
          </div>

          {/* Pie Chart */}
          {chartData.length > 0 ? (
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ percentage }) => `${percentage}%`}
                        labelLine={false}
                      >
                        {chartData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={getColorForCategory(entry.name)} 
                          />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="h-80 flex items-center justify-center">
                  <p className="text-muted-foreground">No data available for this month</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Category List */}
          <div className="space-y-3">
            {chartData
              .sort((a, b) => b.value - a.value)
              .map((item, index) => {
                const color = getColorForCategory(item.name);
                return (
                  <div key={item.name} className="flex items-center justify-between p-4 bg-card rounded-lg border">
                    <div className="flex items-center gap-3">
                      <Badge 
                        style={{ backgroundColor: color }}
                        className="text-white border-none min-w-[3rem] justify-center"
                      >
                        {item.percentage}%
                      </Badge>
                      <span className="font-medium capitalize">{item.name}</span>
                    </div>
                    <span className="font-semibold">{formatCurrency(item.value)}</span>
                  </div>
                );
              })}
          </div>

          {chartData.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                No {viewType} data available for {format(currentDate, 'MMMM yyyy')}
              </p>
            </div>
          )}
        </div>
      )}

      {(activeTab === 'budget' || activeTab === 'note') && (
        <div className="p-4 max-w-4xl mx-auto">
          <Card>
            <CardContent className="p-8 text-center">
              <h3 className="text-xl font-semibold mb-2 capitalize">{activeTab}</h3>
              <p className="text-muted-foreground">
                {activeTab === 'budget' 
                  ? 'Budget management features coming soon...' 
                  : 'Note-taking features coming soon...'
                }
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};