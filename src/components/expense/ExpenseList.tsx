
import { useState } from "react";
import { Edit, Trash2, Eye } from "lucide-react";
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
  onExpenseUpdated?: () => void;
}

export const ExpenseList = ({ expenses, onExpenseUpdated }: ExpenseListProps) => {
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showViewDetails, setShowViewDetails] = useState(false);
  const { markAsPaid, deleteExpense } = useExpenses();
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
      
      setShowPaymentDialog(false);
      setSelectedExpense(null);
    } catch (error) {
      console.error('Error recording payment:', error);
    }
  };

  const handleDeleteExpense = async (expenseId: string) => {
    try {
      await deleteExpense(expenseId);
      // Trigger refresh
      if (onExpenseUpdated) {
        onExpenseUpdated();
      }
    } catch (error) {
      console.error('Error deleting expense:', error);
    }
  };

  const openPaymentDialog = (expense: Expense) => {
    setSelectedExpense(expense);
    setShowPaymentDialog(true);
  };

  const handleEditClick = (expense: Expense) => {
    if (expense.isPaid) {
      // Show view-only details for paid expenses
      setSelectedExpense(expense);
      setShowViewDetails(true);
    } else {
      // Open edit dialog for unpaid expenses
      openPaymentDialog(expense);
    }
  };

  return (
    <div className="p-4 space-y-4">
      {expenses.map((expense) => (
        <div key={expense.id} className="relative">
          <ExpenseCard expense={expense} />
          
          <div className="absolute top-4 right-4 flex items-center space-x-2">
            {expense.isPaid ? (
              <Badge variant="default" className="bg-green-100 text-green-800">
                Paid
                {expense.accountName && (
                  <span className="ml-1 text-xs">via {expense.accountName}</span>
                )}
              </Badge>
            ) : (
              <Badge variant="secondary" className="bg-red-100 text-red-800">
                Unpaid
              </Badge>
            )}
            
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

            {/* Edit/View button */}
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleEditClick(expense)}
              className="h-8 w-8 p-0"
            >
              {expense.isPaid ? <Eye className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      ))}

      <RecordPaymentDialog
        open={showPaymentDialog}
        onOpenChange={setShowPaymentDialog}
        expense={selectedExpense}
        onRecordPayment={handleRecordPayment}
      />

      {/* View Details Dialog for paid expenses */}
      {showViewDetails && selectedExpense && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Expense Details</h3>
            <div className="space-y-2 text-sm">
              <p><strong>Payee:</strong> {selectedExpense.vendorName}</p>
              <p><strong>Category:</strong> {selectedExpense.category}</p>
              <p><strong>Date:</strong> {new Date(selectedExpense.date).toLocaleDateString('en-IN')}</p>
              <p><strong>Amount:</strong> ₹{selectedExpense.totalAmount.toLocaleString()}</p>
              <p><strong>Status:</strong> Paid</p>
              {selectedExpense.accountName && (
                <p><strong>Paid via:</strong> {selectedExpense.accountName}</p>
              )}
            </div>
            <div className="flex justify-end mt-4">
              <Button onClick={() => setShowViewDetails(false)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
