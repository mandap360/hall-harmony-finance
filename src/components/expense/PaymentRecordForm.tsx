
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAccounts } from "@/hooks/useAccounts";
import type { Expense } from "@/hooks/useExpenses";

interface PaymentRecordFormProps {
  expense: Expense;
  onRecordPayment: (expenseId: string, accountId: string, paymentDate: string) => void;
  onCancel: () => void;
}

export const PaymentRecordForm = ({ expense, onRecordPayment, onCancel }: PaymentRecordFormProps) => {
  const [paymentData, setPaymentData] = useState({
    accountId: "",
    paymentDate: new Date().toISOString().split('T')[0],
  });

  const { accounts } = useAccounts();
  const paymentAccounts = accounts.filter(acc => acc.account_type === 'cash_bank' || acc.account_type === 'owners_capital');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentData.accountId || !paymentData.paymentDate) return;

    onRecordPayment(expense.id, paymentData.accountId, paymentData.paymentDate);
    setPaymentData({
      accountId: "",
      paymentDate: new Date().toISOString().split('T')[0],
    });
  };

  return (
    <>
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
          <Select value={paymentData.accountId} onValueChange={(value) => setPaymentData({ ...paymentData, accountId: value })}>
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
            value={paymentData.paymentDate}
            onChange={(e) => setPaymentData({ ...paymentData, paymentDate: e.target.value })}
            required
          />
        </div>

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={!paymentData.accountId || !paymentData.paymentDate}>
            Record Payment
          </Button>
        </div>
      </form>
    </>
  );
};
