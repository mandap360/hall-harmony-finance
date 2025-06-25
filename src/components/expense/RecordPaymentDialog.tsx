
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAccounts } from "@/hooks/useAccounts";
import type { Expense } from "@/hooks/useExpenses";

interface RecordPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expense: Expense | null;
  onRecordPayment: (expenseId: string, accountId: string) => void;
}

export const RecordPaymentDialog = ({ 
  open, 
  onOpenChange, 
  expense, 
  onRecordPayment 
}: RecordPaymentDialogProps) => {
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const { accounts } = useAccounts();
  const paymentAccounts = accounts.filter(acc => acc.account_type === 'operational' || acc.account_type === 'capital');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expense || !selectedAccountId) return;

    onRecordPayment(expense.id, selectedAccountId);
    setSelectedAccountId("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>
        </DialogHeader>
        
        {expense && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="space-y-1">
                <p><strong>Vendor:</strong> {expense.vendorName}</p>
                <p><strong>Bill Number:</strong> {expense.billNumber}</p>
                <p><strong>Amount:</strong> ₹{expense.totalAmount.toFixed(2)}</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="account">Pay From</Label>
                <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select account" />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentAccounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.name} (₹{account.balance.toLocaleString()})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={!selectedAccountId}>
                  Record Payment
                </Button>
              </div>
            </form>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
