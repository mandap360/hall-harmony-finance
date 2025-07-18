import { TrendingUp, TrendingDown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { CurrencyDisplay } from "@/components/ui/currency-display";

interface DashboardSummaryCardsProps {
  totalIncome: number;
  totalExpenses: number;
  totalReceivables: number;
  totalPayables: number;
  onReceivablesClick?: () => void;
  onPayablesClick?: () => void;
}

export const DashboardSummaryCards = ({
  totalIncome,
  totalExpenses,
  totalReceivables,
  totalPayables,
  onReceivablesClick,
  onPayablesClick
}: DashboardSummaryCardsProps) => {
  // Mock percentage changes - in a real app these would be calculated from historical data
  const incomeChange = 8.2;
  const expenseChange = -3.1;
  const receivablesChange = 12.5;
  const payablesChange = -5.3;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Total Income */}
      <Card className="p-6 relative overflow-hidden border-l-4 border-l-blue-500">
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">Total Income</h3>
          <div className="text-2xl font-bold text-foreground">
            <CurrencyDisplay amount={totalIncome} />
          </div>
          <div className="flex items-center text-sm">
            <TrendingUp className="h-4 w-4 text-blue-500 mr-1" />
            <span className="text-blue-500 font-medium">{incomeChange}% from last month</span>
          </div>
        </div>
      </Card>

      {/* Total Expenses */}
      <Card className="p-6 relative overflow-hidden border-l-4 border-l-red-500">
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">Total Expenses</h3>
          <div className="text-2xl font-bold text-foreground">
            <CurrencyDisplay amount={totalExpenses} />
          </div>
          <div className="flex items-center text-sm">
            <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
            <span className="text-red-500 font-medium">{Math.abs(expenseChange)}% from last month</span>
          </div>
        </div>
      </Card>

      {/* Receivables */}
      <Card 
        className="p-6 relative overflow-hidden border-l-4 border-l-blue-600 cursor-pointer hover:shadow-md transition-shadow"
        onClick={onReceivablesClick}
      >
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">Receivables</h3>
          <div className="text-2xl font-bold text-foreground">
            <CurrencyDisplay amount={totalReceivables} />
          </div>
          <div className="flex items-center text-sm">
            <TrendingUp className="h-4 w-4 text-blue-600 mr-1" />
            <span className="text-blue-600 font-medium">{receivablesChange}% from last month</span>
          </div>
        </div>
      </Card>

      {/* Payables */}
      <Card 
        className="p-6 relative overflow-hidden border-l-4 border-l-orange-500 cursor-pointer hover:shadow-md transition-shadow"
        onClick={onPayablesClick}
      >
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">Payables</h3>
          <div className="text-2xl font-bold text-foreground">
            <CurrencyDisplay amount={totalPayables} />
          </div>
          <div className="flex items-center text-sm">
            <TrendingDown className="h-4 w-4 text-orange-500 mr-1" />
            <span className="text-orange-500 font-medium">{Math.abs(payablesChange)}% from last month</span>
          </div>
        </div>
      </Card>
    </div>
  );
};