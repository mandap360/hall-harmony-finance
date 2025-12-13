
import { useState } from "react";
import { Edit, Building, Calendar, IndianRupee } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EditExpenseDialog } from "./EditExpenseDialog";

import { useExpenses } from "@/hooks/useExpenses";
import { useTransactions } from "@/hooks/useTransactions";
import { useCategories } from "@/hooks/useCategories";
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
  const { getExpenseCategories } = useCategories();

  const expenseCategories = getExpenseCategories();

  const getCategoryDisplayName = (categoryName: string) => {
    const category = expenseCategories.find(cat => cat.name === categoryName);
    if (!category) return categoryName;
    
    if (category.parent_id) {
      const parentCategory = expenseCategories.find(cat => cat.id === category.parent_id);
      return parentCategory ? `${parentCategory.name} / ${category.name}` : category.name;
    }
    
    return category.name;
  };

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
    <div className="space-y-4 w-full">
      {expenses.map((expense) => (
        <div key={expense.id} className="bg-card rounded-lg border p-6 border-l-4 border-l-red-500 w-full overflow-hidden">
          <div className="flex justify-between items-start gap-4 w-full">
            <div className="flex-1 min-w-0 max-w-[calc(100%-120px)]">
              <div className="flex items-center text-muted-foreground mb-2">
                <Building className="h-4 w-4 mr-2 flex-shrink-0" />
                <span className="text-sm">{getCategoryDisplayName(expense.category)}</span>
              </div>
              
              <h3 className="font-semibold text-lg text-foreground mb-2 truncate">
                {expense.vendorName}
              </h3>
              
              <div className="flex items-center text-muted-foreground mb-3">
                <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                <span className="text-sm">
                  {new Date(expense.date).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                  })}
                </span>
              </div>
              
              <div className="flex items-center text-red-600">
                <IndianRupee className="h-4 w-4 mr-1 flex-shrink-0" />
                <span className="font-semibold">{expense.totalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>
            
            <div className="flex flex-col items-end gap-2 flex-shrink-0 w-auto min-w-[100px]">
              {expense.isPaid ? (
                <Badge variant="outline" className="px-3 py-1 bg-green-50 text-green-700 border-green-200">
                  Completed
                  {expense.accountName && (
                    <span className="ml-1 text-xs">via {expense.accountName}</span>
                  )}
                </Badge>
              ) : (
                <Badge variant="outline" className="px-3 py-1 bg-red-50 text-red-700 border-red-200">
                  Pending
                </Badge>
              )}
              
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
