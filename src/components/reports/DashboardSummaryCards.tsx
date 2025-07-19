
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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      {/* Receivables */}
      <Card 
        className="p-6 relative overflow-hidden border-l-4 border-l-blue-600 cursor-pointer hover:shadow-md transition-shadow"
        onClick={onReceivablesClick}
      >
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">Receivables</h3>
          <div className="text-2xl font-bold text-foreground">
            <CurrencyDisplay amount={totalReceivables} displayMode="text-only" />
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
            <CurrencyDisplay amount={totalPayables} displayMode="text-only" />
          </div>
        </div>
      </Card>
    </div>
  );
};
