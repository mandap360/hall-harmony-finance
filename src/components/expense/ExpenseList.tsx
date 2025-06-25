
import { useState } from "react";
import { Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExpenseCard } from "@/components/ExpenseCard";
import { RecordPaymentDialog } from "./RecordPaymentDialog";
import { useExpenses } from "@/hooks/useExpenses";
import { useTransactions } from "@/hooks/useTransactions";
import type { Expense } from "@/hooks/useExpenses";

interface ExpenseListProps {
  expenses: Expense[];
}

export const ExpenseList = ({ expenses }: ExpenseListProps) => {
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const { markAsPaid } = useExpenses();
  const { addTransaction } = useTransactions();

  const handleRecordPayment = async (expenseId: string, accountId: string, paymentDate: string) => {
    const expense = expenses.find(e => e.id === expenseId);
    if (!expense) return;

    try {
      // Mark expense as paid
      await markAsPaid(expenseId, accountId, paymentDate);
      
      // Add transaction record
      await addTransaction({
        account_id: accountId,
        transaction_type: 'debit',
        amount: expense.totalAmount,
        description: `Expense payment - ${expense.vendorName} - ${expense.category}`,
        reference_type: 'expense',
        reference_id: expenseId,
        transaction_date: paymentDate
      });
    } catch (error) {
      console.error('Error recording payment:', error);
    }
  };

  const openPaymentDialog = (expense: Expense) => {
    setSelectedExpense(expense);
    setShowPaymentDialog(true);
  };

  return (
    <div className="p-4 space-y-4">
      {expenses.map((expense) => (
        <div key={expense.id} className="relative">
          <ExpenseCard expense={expense} />
          
          <div className="absolute top-4 right-4 flex flex-col items-end space-y-2">
            {expense.isPaid ? (
              <Badge variant="default" className="bg-green-100 text-green-800">
                Paid
                {expense.accountName && (
                  <span className="ml-1 text-xs">via {expense.accountName}</span>
                )}
              </Badge>
            ) : (
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="bg-red-100 text-red-800">
                  Unpaid
                </Badge>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openPaymentDialog(expense)}
                  className="h-8 w-8 p-0"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            )}
            
            {/* Category badge positioned below the payment status */}
            <Badge variant="secondary" className="text-xs">
              {expense.category}
            </Badge>
          </div>
        </div>
      ))}

      <RecordPaymentDialog
        open={showPaymentDialog}
        onOpenChange={setShowPaymentDialog}
        expense={selectedExpense}
        onRecordPayment={handleRecordPayment}
      />
    </div>
  );
};
