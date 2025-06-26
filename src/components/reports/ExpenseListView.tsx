
import { useState } from "react";
import { ArrowLeft, Calendar, IndianRupee, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  
  const currentFYExpenses = expenses
    .filter((expense) => {
      const expenseDate = new Date(expense.date);
      const expenseYear = expenseDate.getFullYear();
      const expenseMonth = expenseDate.getMonth();
      
      if (expenseMonth >= 3) {
        return expenseYear === currentFY.startYear;
      } else {
        return expenseYear === currentFY.endYear;
      }
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

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

        <h2 className="text-2xl font-bold text-gray-900 mb-6">Expense Entries</h2>

        {currentFYExpenses.length > 0 ? (
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-32">Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="w-32 text-right">Amount</TableHead>
                  <TableHead className="w-20 text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentFYExpenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                        {formatDate(expense.date)}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-700">
                      <div className="flex items-start">
                        <Building className="h-4 w-4 mr-2 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="font-medium">{expense.category}</div>
                          <div className="text-gray-500">
                            Bill #{expense.billNumber} from {expense.vendorName}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end text-red-600 font-semibold">
                        <IndianRupee className="h-4 w-4 mr-1" />
                        ₹{expense.totalAmount.toLocaleString()}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge 
                        variant={expense.isPaid ? "default" : "secondary"} 
                        className={expense.isPaid ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                      >
                        {expense.isPaid ? "Paid" : "Unpaid"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No expense entries found</p>
          </div>
        )}
      </div>
    </div>
  );
};
