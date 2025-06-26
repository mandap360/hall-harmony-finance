
import { useState } from "react";
import { ArrowLeft, Calendar, Building, IndianRupee } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useExpenses } from "@/hooks/useExpenses";

interface ExpenseListViewProps {
  onBack: () => void;
}

export const ExpenseListView = ({ onBack }: ExpenseListViewProps) => {
  const { expenses } = useExpenses();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Get current FY expenses
  const getCurrentFY = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    
    if (month >= 3) {
      return { startYear: year, endYear: year + 1 };
    } else {
      return { startYear: year - 1, endYear: year };
    }
  };

  const currentFY = getCurrentFY();
  
  const currentFYExpenses = expenses.filter((expense) => {
    const expenseDate = new Date(expense.date);
    const expenseYear = expenseDate.getFullYear();
    const expenseMonth = expenseDate.getMonth();
    
    if (expenseMonth >= 3) {
      return expenseYear === currentFY.startYear;
    } else {
      return expenseYear === currentFY.endYear;
    }
  });

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            onClick={onBack}
            className="flex items-center text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Reports
          </Button>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-6">Expense Entries</h2>

        <div className="space-y-4">
          {currentFYExpenses.map((expense) => (
            <Card key={expense.id} className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-gray-900 mb-2">
                    {expense.vendorName}
                  </h3>
                  <div className="flex items-center text-gray-600 mb-1">
                    <Building className="h-4 w-4 mr-2" />
                    <span className="text-sm">{expense.category}</span>
                  </div>
                  <div className="flex items-center text-gray-700 mb-3">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span className="text-sm">{formatDate(expense.date)}</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center text-red-600">
                      <IndianRupee className="h-4 w-4 mr-1" />
                      <span className="font-semibold">₹{expense.totalAmount.toLocaleString()}</span>
                    </div>
                    <Badge variant={expense.isPaid ? "default" : "secondary"} 
                           className={expense.isPaid ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                      {expense.isPaid ? "Paid" : "Unpaid"}
                    </Badge>
                  </div>
                </div>
              </div>
            </Card>
          ))}

          {currentFYExpenses.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No expense entries found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
