
import { useState } from "react";
import { Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExpenseCard } from "@/components/ExpenseCard";
import { EditExpenseDialog } from "./EditExpenseDialog";

import { useExpenses } from "@/hooks/useExpenses";
import { useTransactions } from "@/hooks/useTransactions";
import type { Expense } from "@/hooks/useExpenses";

interface ExpenseListProps {
  expenses: Expense[];
  onExpenseUpdated?: () => void;
}

export const ExpenseList = ({ expenses, onExpenseUpdated }: ExpenseListProps) => {
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const { markAsPaid, updateExpense } = useExpenses();
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

      // Trigger refresh
      if (onExpenseUpdated) {
        onExpenseUpdated();
      }
    } catch (error) {
      console.error('Error recording payment:', error);
    }
  };

  const handleUpdateExpense = async (expenseData: any) => {
    try {
      await updateExpense(expenseData);
      // Trigger refresh
      if (onExpenseUpdated) {
        onExpenseUpdated();
      }
    } catch (error) {
      console.error('Error updating expense:', error);
    }
  };


  const openEditDialog = (expense: Expense) => {
    setSelectedExpense(expense);
    setShowEditDialog(true);
  };

  return (
    <div className="p-4 space-y-4">
      {expenses.map((expense) => (
        <div key={expense.id} className="relative">
          <ExpenseCard expense={expense} />
          
          <div className="absolute top-4 right-4 flex items-center space-x-2">
            {expense.isPaid ? (
              <Badge variant="default" className="bg-green-100 text-green-800">
                Completed
                {expense.accountName && (
                  <span className="ml-1 text-xs">via {expense.accountName}</span>
                )}
              </Badge>
            ) : (
              <Badge variant="secondary" className="bg-red-100 text-red-800">
                Pending
              </Badge>
            )}
            

            {/* Edit button */}
            <Button
              size="sm"
              variant="outline"
              onClick={() => openEditDialog(expense)}
              className="h-8 w-8 p-0"
            >
              <Edit className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}

      <EditExpenseDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        expense={selectedExpense}
        onUpdateExpense={handleUpdateExpense}
        onRecordPayment={handleRecordPayment}
      />
    </div>
  );
};
