import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AmountInput } from '@/components/ui/amount-input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAccounts } from '@/hooks/useAccounts';
import { useTransactions } from '@/hooks/useTransactions';
import { parseAmount } from '@/utils/validation';

interface AddTransferDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultFromAccountId?: string;
  onSuccess?: () => void;
}

export const AddTransferDialog = ({
  open,
  onOpenChange,
  defaultFromAccountId,
  onSuccess,
}: AddTransferDialogProps) => {
  const { accounts } = useAccounts();
  const { addTransaction } = useTransactions();
  const cashBankAccounts = accounts.filter((a) => a.account_type === 'cash_bank');

  const [amount, setAmount] = useState('');
  const [fromAccountId, setFromAccountId] = useState('');
  const [toAccountId, setToAccountId] = useState('');
  const [transactionDate, setTransactionDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setAmount('');
      setFromAccountId(defaultFromAccountId || '');
      setToAccountId('');
      setTransactionDate(new Date().toISOString().split('T')[0]);
      setDescription('');
    }
  }, [open, defaultFromAccountId]);

  const reset = () => {
    setAmount('');
    setFromAccountId(defaultFromAccountId || '');
    setToAccountId('');
    setTransactionDate(new Date().toISOString().split('T')[0]);
    setDescription('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseAmount(amount);
    if (parsedAmount === null || parsedAmount <= 0 || !fromAccountId || !toAccountId) return;
    if (fromAccountId === toAccountId) return;

    setSubmitting(true);
    try {
      await addTransaction({
        type: 'Transfer',
        amount: parsedAmount,
        from_account_id: fromAccountId,
        to_account_id: toAccountId,
        transaction_date: transactionDate,
        description: description || null,
      });
      reset();
      onOpenChange(false);
      onSuccess?.();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Transfer Between Accounts</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Amount *</Label>
            <AmountInput
              value={amount}
              onChange={setAmount}
              placeholder="0.00"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Date *</Label>
            <Input
              type="date"
              value={transactionDate}
              onChange={(e) => setTransactionDate(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>From Account *</Label>
            <Select value={fromAccountId} onValueChange={setFromAccountId}>
              <SelectTrigger>
                <SelectValue placeholder="Select account" />
              </SelectTrigger>
              <SelectContent>
                {cashBankAccounts.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>To Account *</Label>
            <Select value={toAccountId} onValueChange={setToAccountId}>
              <SelectTrigger>
                <SelectValue placeholder="Select account" />
              </SelectTrigger>
              <SelectContent>
                {cashBankAccounts
                  .filter((a) => a.id !== fromAccountId)
                  .map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Description (optional)</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Notes…"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting || !fromAccountId || !toAccountId || fromAccountId === toAccountId}>
              {submitting ? 'Saving…' : 'Record Transfer'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
