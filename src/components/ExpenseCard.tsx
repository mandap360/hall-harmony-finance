
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Expense } from "@/hooks/useExpenses";

interface ExpenseCardProps {
  expense: Expense;
}

export const ExpenseCard = ({ expense }: ExpenseCardProps) => {
  const formattedDate = new Date(expense.date).toLocaleDateString();
  const totalGST = (expense.cgstAmount || 0) + (expense.sgstAmount || 0);
  
  return (
    <Card className="p-4 hover:shadow-md transition-shadow border-gray-100">
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{expense.vendorName}</h3>
          <p className="text-sm text-gray-600">Bill #{expense.billNumber}</p>
        </div>
        <Badge variant="secondary" className="text-xs">
          {expense.category}
        </Badge>
      </div>
      
      <div className="space-y-2 mt-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Bill Amount:</span>
          <span className="font-medium">₹{expense.amount.toLocaleString()}</span>
        </div>
        
        {totalGST > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">GST:</span>
            <span className="font-medium">₹{totalGST.toLocaleString()}</span>
          </div>
        )}
        
        <div className="flex justify-between items-center pt-2 border-t">
          <div className="text-sm text-gray-600">
            {formattedDate}
          </div>
          <div className="text-right">
            <div className="font-semibold text-lg">₹{(expense.totalAmount || expense.amount).toLocaleString()}</div>
            <div className="text-xs text-gray-500">Total Amount</div>
          </div>
        </div>
      </div>
    </Card>
  );
};
