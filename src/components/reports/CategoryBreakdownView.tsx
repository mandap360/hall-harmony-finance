
import { ArrowLeft, TrendingUp, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CategoryBreakdownViewProps {
  incomeByCategory: Record<string, number>;
  expensesByCategory: Record<string, number>;
  onBack: () => void;
}

export const CategoryBreakdownView = ({
  incomeByCategory,
  expensesByCategory,
  onBack
}: CategoryBreakdownViewProps) => {
  const totalIncome = Object.values(incomeByCategory).reduce((sum, amount) => sum + amount, 0);
  const totalExpenses = Object.values(expensesByCategory).reduce((sum, amount) => sum + amount, 0);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={onBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Category Breakdown</h1>
            <p className="text-gray-600">Detailed income and expense breakdown by category</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Income Categories */}
          <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
            <CardHeader>
              <CardTitle className="text-green-700 flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Income Categories
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(incomeByCategory).map(([category, amount]) => (
                <div key={category} className="flex justify-between items-center border-b border-green-200 pb-2">
                  <span className="text-green-800 font-medium">{category}</span>
                  <span className="text-green-900 font-bold">₹{amount.toLocaleString('en-IN')}</span>
                </div>
              ))}
              
              {Object.keys(incomeByCategory).length === 0 && (
                <p className="text-green-600 text-center py-4">No income recorded</p>
              )}

              {Object.keys(incomeByCategory).length > 0 && (
                <div className="flex justify-between items-center pt-3 border-t-2 border-green-300 font-bold">
                  <span className="text-green-900">Total Income:</span>
                  <span className="text-green-900 text-lg">₹{totalIncome.toLocaleString('en-IN')}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Expense Categories */}
          <Card className="bg-gradient-to-r from-red-50 to-red-100 border-red-200">
            <CardHeader>
              <CardTitle className="text-red-700 flex items-center gap-2">
                <TrendingDown className="h-5 w-5" />
                Expense Categories
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(expensesByCategory).map(([category, amount]) => (
                <div key={category} className="flex justify-between items-center border-b border-red-200 pb-2">
                  <span className="text-red-800 font-medium">{category}</span>
                  <span className="text-red-900 font-bold">₹{amount.toLocaleString('en-IN')}</span>
                </div>
              ))}
              
              {Object.keys(expensesByCategory).length === 0 && (
                <p className="text-red-600 text-center py-4">No expenses recorded</p>
              )}

              {Object.keys(expensesByCategory).length > 0 && (
                <div className="flex justify-between items-center pt-3 border-t-2 border-red-300 font-bold">
                  <span className="text-red-900">Total Expenses:</span>
                  <span className="text-red-900 text-lg">₹{totalExpenses.toLocaleString('en-IN')}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
