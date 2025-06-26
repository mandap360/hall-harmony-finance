
import { TrendingUp, TrendingDown, BarChart3, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface SalesExpenseSummaryProps {
  totalIncome: number;
  totalExpenses: number;
  profit: number;
  incomeByCategory: Record<string, number>;
  expensesByCategory: Record<string, number>;
}

export const SalesExpenseSummary = ({ 
  totalIncome, 
  totalExpenses, 
  profit,
  incomeByCategory,
  expensesByCategory
}: SalesExpenseSummaryProps) => {
  const [showIncomeBreakdown, setShowIncomeBreakdown] = useState(false);
  const [showExpenseBreakdown, setShowExpenseBreakdown] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900 flex items-center">
          <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
          Income & Expense Summary
        </h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-700 flex items-center justify-between">
              Total Income
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowIncomeBreakdown(!showIncomeBreakdown)}
                className="h-6 w-6 p-0 hover:bg-green-200"
              >
                {showIncomeBreakdown ? (
                  <ChevronUp className="h-4 w-4 text-green-700" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-green-700" />
                )}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">
              ₹{totalIncome.toLocaleString()}
            </div>
            
            {showIncomeBreakdown && (
              <div className="mt-4 space-y-2 border-t border-green-200 pt-3">
                {Object.entries(incomeByCategory).map(([category, amount]) => (
                  <div key={category} className="flex justify-between items-center text-sm">
                    <span className="text-green-800">{category}</span>
                    <span className="text-green-900 font-medium">₹{amount.toLocaleString()}</span>
                  </div>
                ))}
                {Object.keys(incomeByCategory).length === 0 && (
                  <p className="text-green-600 text-sm">No income recorded</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-red-50 to-red-100 border-red-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-700 flex items-center justify-between">
              Total Expenses
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowExpenseBreakdown(!showExpenseBreakdown)}
                className="h-6 w-6 p-0 hover:bg-red-200"
              >
                {showExpenseBreakdown ? (
                  <ChevronUp className="h-4 w-4 text-red-700" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-red-700" />
                )}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-900">
              ₹{totalExpenses.toLocaleString()}
            </div>
            
            {showExpenseBreakdown && (
              <div className="mt-4 space-y-2 border-t border-red-200 pt-3">
                {Object.entries(expensesByCategory).map(([category, amount]) => (
                  <div key={category} className="flex justify-between items-center text-sm">
                    <span className="text-red-800">{category}</span>
                    <span className="text-red-900 font-medium">₹{amount.toLocaleString()}</span>
                  </div>
                ))}
                {Object.keys(expensesByCategory).length === 0 && (
                  <p className="text-red-600 text-sm">No expenses recorded</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
