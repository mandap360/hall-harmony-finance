
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAccounts } from "@/hooks/useAccounts";
import type { Expense } from "@/hooks/useExpenses";

interface RecordPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expense: Expense | null;
  onRecordPayment: (expenseId: string, accountId: string, paymentDate: string) => void;
}

export const RecordPaymentDialog = ({ 
  open, 
  onOpenChange, 
  expense, 
  onRecordPayment 
}: RecordPaymentDialogProps) => {
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const { accounts } = useAccounts();
  const paymentAccounts = accounts.filter(acc => acc.account_type === 'cash_bank' || acc.account_type === 'owners_capital');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expense || !selectedAccountId || !paymentDate) return;

    onRecordPayment(expense.id, selectedAccountId, paymentDate);
    setSelectedAccountId("");
    setPaymentDate(new Date().toISOString().split('T')[0]);
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
                <p><strong>Amount:</strong> ₹{expense.totalAmount.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
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
                        {account.name} (₹{account.balance.toLocaleString('en-IN')})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="paymentDate">Payment Date</Label>
                <Input
                  id="paymentDate"
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  required
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={!selectedAccountId || !paymentDate}>
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
