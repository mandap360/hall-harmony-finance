
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Expense } from "@/hooks/useExpenses";

interface ExpenseCardProps {
  expense: Expense;
}

export const ExpenseCard = ({ expense }: ExpenseCardProps) => {
  const formattedDate = new Date(expense.date).toLocaleDateString();
  
  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{expense.vendorName}</h3>
          <p className="text-sm text-gray-600">Bill #{expense.billNumber}</p>
        </div>
        <Badge variant="secondary" className="text-xs">
          {expense.category}
        </Badge>
      </div>
      
      <div className="flex justify-between items-center mt-3">
        <div className="text-sm text-gray-600">
          {formattedDate}
        </div>
        <div className="text-right">
          <div className="font-semibold text-lg">₹{expense.amount.toLocaleString()}</div>
          <div className="text-xs text-gray-500">
            {expense.includesGST ? 'Inc.' : 'Exc.'} {expense.gstPercentage}% GST
          </div>
        </div>
      </div>
    </Card>
  );
};
