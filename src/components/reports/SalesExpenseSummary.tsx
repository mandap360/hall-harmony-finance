
import { TrendingUp, TrendingDown, BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SalesExpenseSummaryProps {
  totalIncome: number;
  totalExpenses: number;
  profit: number;
  onIncomeClick?: () => void;
  onExpenseClick?: () => void;
}

export const SalesExpenseSummary = ({ 
  totalIncome, 
  totalExpenses, 
  profit,
  onIncomeClick,
  onExpenseClick
}: SalesExpenseSummaryProps) => {
  return (
    <div className="space-y-4">
      {/* Income and Expense Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card 
          className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200 cursor-pointer hover:shadow-md transition-shadow"
          onClick={onIncomeClick}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">Total Income</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">
              ₹{totalIncome.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card 
          className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200 cursor-pointer hover:shadow-md transition-shadow"
          onClick={onExpenseClick}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-orange-700">Total Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">
              ₹{totalExpenses.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Note about tax exclusion */}
      <div className="text-center">
        <p className="text-sm text-gray-500 italic">
          Income and expense values displayed are exclusive of taxes
        </p>
      </div>
    </div>
  );
};
