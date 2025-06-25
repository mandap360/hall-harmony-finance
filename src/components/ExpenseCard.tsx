
import { Card } from "@/components/ui/card";
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
      </div>
      
      <div className="space-y-2 mt-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Base Amount:</span>
          <span>₹{expense.amount.toLocaleString()}</span>
        </div>
        
        {(expense.cgstAmount > 0 || expense.sgstAmount > 0) && (
          <>
            {expense.cgstAmount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">CGST ({expense.cgstPercentage}%):</span>
                <span>₹{expense.cgstAmount.toLocaleString()}</span>
              </div>
            )}
            {expense.sgstAmount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">SGST ({expense.sgstPercentage}%):</span>
                <span>₹{expense.sgstAmount.toLocaleString()}</span>
              </div>
            )}
          </>
        )}
        
        <div className="border-t pt-2">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {formattedDate}
            </div>
            <div className="text-right">
              <div className="font-semibold text-lg">₹{expense.totalAmount.toLocaleString()}</div>
              <div className="text-xs text-gray-500">Total Amount</div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
