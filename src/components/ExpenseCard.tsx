
import { Calendar, IndianRupee, Building } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { Expense } from "@/hooks/useExpenses";

interface ExpenseCardProps {
  expense: Expense;
}

export const ExpenseCard = ({ expense }: ExpenseCardProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <Card className="p-6 border-l-4 border-l-red-500">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center text-gray-600 mb-2">
            <Building className="h-4 w-4 mr-2" />
            <span className="text-sm">{expense.category}</span>
          </div>
          
          <h3 className="font-semibold text-lg text-gray-900 mb-2">
            {expense.vendorName}
          </h3>
          
          <div className="text-sm text-gray-600 mb-2">
            Invoice: {expense.billNumber || 'N/A'}
          </div>
          
          <div className="flex items-center text-gray-500 mb-3">
            <Calendar className="h-4 w-4 mr-2" />
            <span className="text-sm">{formatDate(expense.date)}</span>
          </div>
          
          <div className="flex items-center text-red-600">
            <IndianRupee className="h-4 w-4 mr-1" />
            <span className="font-semibold">{expense.totalAmount.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>
    </Card>
  );
};
