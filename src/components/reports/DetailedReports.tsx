
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DetailedReportsProps {
  incomeBreakdown: {
    rent: number;
    additionalCategory: number;
  };
  totalIncome: number;
  expensesByCategory: Record<string, number>;
  totalExpenses: number;
  additionalIncomeCategories: Array<{ category: string; amount: number }>;
}

export const DetailedReports = ({ 
  incomeBreakdown, 
  totalIncome, 
  expensesByCategory, 
  totalExpenses,
  additionalIncomeCategories
}: DetailedReportsProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Income Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-green-700">Income Summary (Received)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center border-b pb-2">
            <span className="text-gray-600">Rent Payments:</span>
            <span className="font-semibold text-green-600">₹{incomeBreakdown.rent.toLocaleString('en-IN')}</span>
          </div>
          
          {/* Show individual income categories */}
          {additionalIncomeCategories.map((category) => (
            <div key={category.category} className="flex justify-between items-center border-b pb-2">
              <span className="text-gray-600">{category.category}:</span>
              <span className="font-semibold text-green-600">₹{category.amount.toLocaleString('en-IN')}</span>
            </div>
          ))}
          

          <div className="flex justify-between items-center pt-2 border-t font-bold">
            <span className="text-gray-900">Total:</span>
            <span className="text-green-600">₹{totalIncome.toLocaleString('en-IN')}</span>
          </div>
        </CardContent>
      </Card>

      {/* Expense Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-red-700">Expense Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Object.entries(expensesByCategory).map(([category, amount]) => (
            <div key={category} className="flex justify-between items-center border-b pb-2">
              <span className="text-gray-600">{category}:</span>
              <span className="font-semibold text-red-600">₹{amount.toLocaleString('en-IN')}</span>
            </div>
          ))}
          
          {Object.keys(expensesByCategory).length === 0 && (
            <p className="text-gray-500 text-center py-4">No expenses recorded</p>
          )}

          {Object.keys(expensesByCategory).length > 0 && (
            <div className="flex justify-between items-center pt-2 border-t font-bold">
              <span className="text-gray-900">Total:</span>
              <span className="text-red-600">₹{totalExpenses.toLocaleString('en-IN')}</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
