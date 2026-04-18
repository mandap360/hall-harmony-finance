import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAccounts } from '@/hooks/useAccounts';
import { useClients } from '@/hooks/useClients';
import { useVendors } from '@/hooks/useVendors';
import { useBookings } from '@/hooks/useBookings';
import { useTransactions, type TransactionType } from '@/hooks/useTransactions';

interface AddTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultAccountId?: string;
  onSuccess?: () => void;
}

const TYPE_OPTIONS: TransactionType[] = ['Income', 'Expense', 'Refund', 'Advance Paid', 'Transfer'];

export const AddTransactionDialog = ({
  open,
  onOpenChange,
  defaultAccountId,
  onSuccess,
}: AddTransactionDialogProps) => {
  const { accounts } = useAccounts();
  const { clients } = useClients();
  const { vendors } = useVendors();
  const { bookings } = useBookings();
  const { addTransaction } = useTransactions();

  const cashBankAccounts = accounts.filter((a) => a.account_type === 'cash_bank');

  const [type, setType] = useState<TransactionType>('Income');
  const [amount, setAmount] = useState('');
  const [fromAccountId, setFromAccountId] = useState<string>('');
  const [toAccountId, setToAccountId] = useState<string>(defaultAccountId || '');
  const [bookingId, setBookingId] = useState<string>('');
  const [entityId, setEntityId] = useState<string>('');
  const [transactionDate, setTransactionDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setType('Income');
    setAmount('');
    setFromAccountId('');
    setToAccountId(defaultAccountId || '');
    setBookingId('');
    setEntityId('');
    setTransactionDate(new Date().toISOString().split('T')[0]);
    setDescription('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount <= 0) return;

    setSubmitting(true);
    try {
      await addTransaction({
        type,
        amount: parsedAmount,
        from_account_id: fromAccountId || null,
        to_account_id: toAccountId || null,
        booking_id: bookingId || null,
        entity_id: entityId || null,
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

  // Field visibility based on type
  const showFromAccount = ['Expense', 'Refund', 'Advance Paid', 'Transfer'].includes(type);
  const showToAccount = ['Income', 'Transfer'].includes(type);
  const showBooking = ['Income', 'Refund'].includes(type);
  const entityOptions =
    type === 'Income' || type === 'Refund'
      ? clients.map((c) => ({ id: c.client_id, name: c.name, label: 'Client' }))
      : type === 'Expense' || type === 'Advance Paid'
        ? vendors.map((v) => ({ id: v.vendor_id, name: v.name, label: 'Vendor' }))
        : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Transaction</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Type *</Label>
            <Select value={type} onValueChange={(v) => setType(v as TransactionType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TYPE_OPTIONS.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Amount *</Label>
            <Input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
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

          {showFromAccount && (
            <div className="space-y-2">
              <Label>From Account {type === 'Transfer' ? '*' : ''}</Label>
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
          )}

          {showToAccount && (
            <div className="space-y-2">
              <Label>To Account {type === 'Income' || type === 'Transfer' ? '*' : ''}</Label>
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
          )}

          {entityOptions.length > 0 && (
            <div className="space-y-2">
              <Label>{entityOptions[0].label} (optional)</Label>
              <Select value={entityId} onValueChange={setEntityId}>
                <SelectTrigger>
                  <SelectValue placeholder={`Select ${entityOptions[0].label.toLowerCase()}`} />
                </SelectTrigger>
                <SelectContent>
                  {entityOptions.map((o) => (
                    <SelectItem key={o.id} value={o.id}>
                      {o.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {showBooking && bookings.length > 0 && (
            <div className="space-y-2">
              <Label>Booking (optional)</Label>
              <Select value={bookingId} onValueChange={setBookingId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select booking" />
                </SelectTrigger>
                <SelectContent>
                  {bookings.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.eventName} — {b.clientName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

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
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Saving…' : 'Add Transaction'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
