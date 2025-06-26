
import { useState } from "react";
import { ArrowLeft, Calendar, IndianRupee, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useExpenses } from "@/hooks/useExpenses";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

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
  
  // Only show paid expenses
  const currentFYPaidExpenses = expenses
    .filter((expense) => {
      const expenseDate = new Date(expense.date);
      const expenseYear = expenseDate.getFullYear();
      const expenseMonth = expenseDate.getMonth();
      
      let isCurrentFY = false;
      if (expenseMonth >= 3) {
        isCurrentFY = expenseYear === currentFY.startYear;
      } else {
        isCurrentFY = expenseYear === currentFY.endYear;
      }
      
      return isCurrentFY && expense.isPaid;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const totalExpense = currentFYPaidExpenses.reduce((sum, expense) => sum + expense.totalAmount, 0);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
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

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Expense</h2>
          <div className="flex items-center text-red-600">
            <IndianRupee className="h-5 w-5 mr-1" />
            <span className="font-bold text-xl">₹{totalExpense.toLocaleString()}</span>
          </div>
        </div>

        {currentFYPaidExpenses.length > 0 ? (
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-32">Date</TableHead>
                  <TableHead>Payee</TableHead>
                  <TableHead>Expense Category</TableHead>
                  <TableHead className="w-32 text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentFYPaidExpenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                        {formatDate(expense.date)}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-700">
                      <div className="font-medium">{expense.vendorName}</div>
                      <div className="text-gray-500 text-xs">
                        Bill #{expense.billNumber}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-700">
                      <div className="flex items-center">
                        <Building className="h-4 w-4 mr-2 text-gray-400" />
                        {expense.category}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end text-red-600 font-semibold">
                        <IndianRupee className="h-4 w-4 mr-1" />
                        ₹{expense.totalAmount.toLocaleString()}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No paid expense entries found</p>
          </div>
        )}
      </div>
    </div>
  );
};
