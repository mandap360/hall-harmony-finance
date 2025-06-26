
import { useState } from "react";
import { Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExpenseCard } from "@/components/ExpenseCard";
import { RecordPaymentDialog } from "./RecordPaymentDialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useExpenses } from "@/hooks/useExpenses";
import { useTransactions } from "@/hooks/useTransactions";
import type { Expense } from "@/hooks/useExpenses";

interface ExpenseListProps {
  expenses: Expense[];
}

export const ExpenseList = ({ expenses }: ExpenseListProps) => {
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const { markAsPaid, deleteExpense, refetch } = useExpenses();
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

      // Refresh the expenses list to show updated status
      await refetch();
      
      setShowPaymentDialog(false);
      setSelectedExpense(null);
    } catch (error) {
      console.error('Error recording payment:', error);
    }
  };

  const handleDeleteExpense = async (expenseId: string) => {
    try {
      await deleteExpense(expenseId);
      await refetch();
    } catch (error) {
      console.error('Error deleting expense:', error);
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
            
            <div className="flex items-center space-x-2">
              {/* Category badge */}
              <Badge variant="secondary" className="text-xs">
                {expense.category}
              </Badge>
              
              {/* Delete button */}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Expense</AlertDialogTitle>
                    <AlertDialogDescription>
                      This entry will be permanently deleted. Do you still wish to proceed?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>No</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleDeleteExpense(expense.id)}>
                      Yes
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
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
