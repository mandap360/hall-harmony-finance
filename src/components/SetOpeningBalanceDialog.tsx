import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AmountInput } from '@/components/ui/amount-input';
import { Label } from '@/components/ui/label';
import { useAccounts } from '@/hooks/useAccounts';
import { isValidAmount, parseAmount } from '@/utils/validation';

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  accountId: string;
  currentOpeningBalance: number;
  onSuccess?: () => void;
}

export const SetOpeningBalanceDialog = ({ open, onOpenChange, accountId, currentOpeningBalance, onSuccess }: Props) => {
  const [value, setValue] = useState(String(currentOpeningBalance));
  const [submitting, setSubmitting] = useState(false);
  const { updateAccount } = useAccounts();

  useEffect(() => {
    if (open) {
      setValue(String(currentOpeningBalance));
      setSubmitting(false);
    }
  }, [open, currentOpeningBalance]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    if (!isValidAmount(value, 0)) return;

    setSubmitting(true);
    try {
      await updateAccount(accountId, { initial_balance: parseAmount(value) ?? 0 });
      onSuccess ? onSuccess() : onOpenChange(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Set Initial Balance</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Initial Balance (₹)</Label>
            <AmountInput value={value} onChange={setValue} required disabled={submitting} />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Updating…' : 'Update'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
