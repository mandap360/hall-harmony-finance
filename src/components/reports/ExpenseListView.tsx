
import { useState } from "react";
import { ArrowLeft, Calendar, IndianRupee, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useExpenses } from "@/hooks/useExpenses";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FinancialYear, getCurrentFinancialYear, isInFinancialYear } from "@/utils/financialYear";

interface ExpenseListViewProps {
  onBack: () => void;
  financialYear?: FinancialYear;
}

export const ExpenseListView = ({ onBack, financialYear }: ExpenseListViewProps) => {
  const { expenses } = useExpenses();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Use the provided financial year or default to current
  const targetFY = financialYear || getCurrentFinancialYear();
  
  // Only show paid expenses for the target financial year
  const currentFYPaidExpenses = currentFYExpenses
    .filter((expense) => expense.isPaid)
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
                  <TableHead>Party</TableHead>
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
