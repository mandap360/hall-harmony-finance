
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExpenseDetailsForm } from "./ExpenseDetailsForm";
import { PaymentRecordForm } from "./PaymentRecordForm";
import type { Expense } from "@/hooks/useExpenses";

interface EditExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expense: Expense | null;
  onUpdateExpense: (expenseData: any) => void;
  onRecordPayment: (expenseId: string, accountId: string, paymentDate: string) => void;
}

export const EditExpenseDialog = ({ 
  open, 
  onOpenChange, 
  expense, 
  onUpdateExpense,
  onRecordPayment 
}: EditExpenseDialogProps) => {
  if (!expense) return null;

  const handleUpdateExpense = (expenseData: any) => {
    onUpdateExpense(expenseData);
    onOpenChange(false);
  };

  const handleRecordPayment = (expenseId: string, accountId: string, paymentDate: string) => {
    onRecordPayment(expenseId, accountId, paymentDate);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Expense</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">Edit Details</TabsTrigger>
            <TabsTrigger value="payment" disabled={expense.isPaid}>
              {expense.isPaid ? "Already Paid" : "Record Payment"}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="space-y-4">
            <ExpenseDetailsForm
              expense={expense}
              onUpdateExpense={handleUpdateExpense}
              onCancel={() => onOpenChange(false)}
            />
          </TabsContent>

          <TabsContent value="payment" className="space-y-4">
            <PaymentRecordForm
              expense={expense}
              onRecordPayment={handleRecordPayment}
              onCancel={() => onOpenChange(false)}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
