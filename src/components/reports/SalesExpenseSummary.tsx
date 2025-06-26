
import { TrendingUp, TrendingDown, BarChart3, MoreHorizontal } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface SalesExpenseSummaryProps {
  totalIncome: number;
  totalExpenses: number;
  profit: number;
  onIncomeClick?: () => void;
  onExpenseClick?: () => void;
  onMoreClick?: () => void;
}

export const SalesExpenseSummary = ({ 
  totalIncome, 
  totalExpenses, 
  profit,
  onIncomeClick,
  onExpenseClick,
  onMoreClick
}: SalesExpenseSummaryProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900 flex items-center">
          <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
          Income & Expense Summary
        </h2>
        <Button
          variant="outline"
          size="sm"
          onClick={onMoreClick}
          className="flex items-center gap-2"
        >
          <MoreHorizontal className="h-4 w-4" />
          More
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card 
          className="bg-gradient-to-r from-green-50 to-green-100 border-green-200 cursor-pointer hover:shadow-md transition-shadow"
          onClick={onIncomeClick}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Total Income</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">
              ₹{totalIncome.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card 
          className="bg-gradient-to-r from-red-50 to-red-100 border-red-200 cursor-pointer hover:shadow-md transition-shadow"
          onClick={onExpenseClick}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-700">Total Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-900">
              ₹{totalExpenses.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
