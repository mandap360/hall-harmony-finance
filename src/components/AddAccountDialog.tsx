import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { AmountInput } from '@/components/ui/amount-input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { isValidAmount, parseAmount } from '@/utils/validation';
import { DialogFormFooter } from '@/components/shared/DialogFormFooter';
import { useSubmitGuard } from '@/hooks/useSubmitGuard';

interface AddAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    name: string;
    account_type: 'cash_bank' | 'owners_capital';
    initial_balance?: number;
    is_default?: boolean;
  }) => void | Promise<void>;
}

export const AddAccountDialog = ({ open, onOpenChange, onSubmit }: AddAccountDialogProps) => {
  const [name, setName] = useState('');
  const [accountType, setAccountType] = useState<'cash_bank' | 'owners_capital'>('cash_bank');
  const [initialBalance, setInitialBalance] = useState('');
  const { submitting, reset, run } = useSubmitGuard();

  useEffect(() => {
    if (open) {
      setName('');
      setAccountType('cash_bank');
      setInitialBalance('');
      reset();
    }
  }, [open, reset]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const balance = initialBalance.trim() ? parseAmount(initialBalance) ?? 0 : 0;
    if (initialBalance.trim() && !isValidAmount(initialBalance, 0)) return;

    await run(async () => {
      await onSubmit({
        name,
        account_type: accountType,
        initial_balance: balance,
      });
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Account</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Account Name *</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} required disabled={submitting} />
          </div>
          <div className="space-y-2">
            <Label>Account Type *</Label>
            <Select value={accountType} onValueChange={(v) => setAccountType(v as typeof accountType)} disabled={submitting}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash_bank">Cash/Bank</SelectItem>
                <SelectItem value="owners_capital">Owner's Capital</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Initial Balance</Label>
            <AmountInput
              value={initialBalance}
              onChange={setInitialBalance}
              placeholder="0.00"
              disabled={submitting}
            />
          </div>
          <DialogFormFooter
            onCancel={() => onOpenChange(false)}
            submitLabel="Add Account"
            submitting={submitting}
            submittingLabel="Adding…"
          />
        </form>
      </DialogContent>
    </Dialog>
  );
};
