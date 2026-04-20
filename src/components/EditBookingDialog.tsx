import { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus } from 'lucide-react';
import { useClients } from '@/hooks/useClients';
import { useAccounts } from '@/hooks/useAccounts';
import { useAccountCategories } from '@/hooks/useAccountCategories';
import { useTransactions } from '@/hooks/useTransactions';
import { useIncomeAllocations } from '@/hooks/useIncomeAllocations';
import { useBookings, type Booking } from '@/hooks/useBookings';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface EditBookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking: Booking;
  onSubmit: (id: string, data: {
    eventName: string;
    clientId: string;
    startDate: string;
    endDate: string;
    rentFinalized: number;
    notes?: string;
  }) => void;
}

const splitDateTime = (dt: string) => {
  const [date, timePart = '10:00:00'] = dt.split('T');
  return { date, time: timePart.substring(0, 5) };
};

const fmtINR = (n: number) =>
  `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const SEC_PREFIX = '[SEC] ';
const SEC_REFUND_TAG = (txId: string) => `[SEC-REFUND] for receipt ${txId}`;

interface PaymentRow {
  id: string;
  amount: number;
  date: string;
  to_account_id: string | null;
  description: string | null;
  category_id: string | null;
  category_name: string | null;
}

interface SecReceiptAllocation {
  id: string;
  category_id: string | null;
  category_name: string | null;
  amount: number;
}

interface SecReceipt {
  id: string;
  amount: number;
  date: string;
  to_account_id: string | null;
  description: string | null; // displayed without prefix
  status: string;
  allocations: SecReceiptAllocation[];
  refundedAmount: number;
}

export const EditBookingDialog = ({ open, onOpenChange, booking, onSubmit }: EditBookingDialogProps) => {
  const { clients } = useClients();
  const { accounts } = useAccounts();
  const { categories } = useAccountCategories();
  const { addTransaction, deleteTransaction } = useTransactions();
  const { allocate, removeAllocation } = useIncomeAllocations();
  const { refetch: refetchBookings } = useBookings();
  const { profile } = useAuth();
  const { toast } = useToast();

  const cashBankAccounts = accounts.filter((a) => a.account_type === 'cash_bank');
  const paymentCategories = categories.filter((c) => c.type === 'income' && !c.is_secondary_income);
  const secondaryCategories = categories.filter((c) => c.type === 'income' && c.is_secondary_income);

  // Details
  const [eventName, setEventName] = useState('');
  const [clientId, setClientId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('');
  const [rentFinalized, setRentFinalized] = useState('');
  const [notes, setNotes] = useState('');

  // Payments
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [payAmount, setPayAmount] = useState('');
  const [payDate, setPayDate] = useState(new Date().toISOString().split('T')[0]);
  const [payAccountId, setPayAccountId] = useState('');
  const [payCategoryId, setPayCategoryId] = useState('');
  const [payDescription, setPayDescription] = useState('');

  // Secondary receipts
  const [secReceipts, setSecReceipts] = useState<SecReceipt[]>([]);
  const [secRecAmount, setSecRecAmount] = useState('');
  const [secRecDate, setSecRecDate] = useState(new Date().toISOString().split('T')[0]);
  const [secRecAccountId, setSecRecAccountId] = useState('');
  const [secRecDescription, setSecRecDescription] = useState('');

  // Per-receipt allocation/refund draft state
  const [allocDraft, setAllocDraft] = useState<Record<string, { categoryId: string; amount: string }>>({});
  const [refundDraft, setRefundDraft] = useState<Record<string, { accountId: string }>>({});

  useEffect(() => {
    if (booking && open) {
      const start = splitDateTime(booking.startDate);
      const end = splitDateTime(booking.endDate);
      setEventName(booking.eventName);
      setClientId(booking.clientId || '');
      setStartDate(start.date);
      setStartTime(start.time);
      setEndDate(end.date);
      setEndTime(end.time);
      setRentFinalized(String(booking.rentFinalized));
      setNotes(booking.notes || '');
    }
  }, [booking, open]);

  const loadPayments = useCallback(async () => {
    if (!booking?.id || !profile?.organization_id) return;
    const { data: txs, error } = await supabase
      .from('Transactions')
      .select('id, amount, transaction_date, to_account_id, description')
      .eq('booking_id', booking.id)
      .eq('organization_id', profile.organization_id)
      .eq('type', 'Income')
      .neq('transaction_status', 'Void')
      .order('transaction_date', { ascending: false });

    if (error) {
      console.error(error);
      return;
    }

    // Filter out secondary receipts from primary payments tab
    const primaryTxs = (txs || []).filter((t) => !(t.description || '').startsWith(SEC_PREFIX));
    const txIds = primaryTxs.map((t) => t.id);

    const allocMap = new Map<string, { category_id: string | null; category_name: string | null }>();
    if (txIds.length > 0) {
      const { data: allocs } = await supabase
        .from('IncomeAllocations')
        .select('transaction_id, category_id, AccountCategories(name)')
        .in('transaction_id', txIds);
      type AllocRow = {
        transaction_id: string;
        category_id: string | null;
        AccountCategories: { name: string } | null;
      };
      (allocs as AllocRow[] | null)?.forEach((a) => {
        allocMap.set(a.transaction_id, {
          category_id: a.category_id,
          category_name: a.AccountCategories?.name || null,
        });
      });
    }

    setPayments(
      primaryTxs.map((t) => ({
        id: t.id,
        amount: Number(t.amount),
        date: t.transaction_date,
        to_account_id: t.to_account_id,
        description: t.description,
        category_id: allocMap.get(t.id)?.category_id || null,
        category_name: allocMap.get(t.id)?.category_name || null,
      })),
    );
  }, [booking?.id, profile?.organization_id]);

  const loadSecondaryReceipts = useCallback(async () => {
    if (!booking?.id || !profile?.organization_id) return;

    const { data: txs, error } = await supabase
      .from('Transactions')
      .select('id, amount, transaction_date, to_account_id, description, transaction_status')
      .eq('booking_id', booking.id)
      .eq('organization_id', profile.organization_id)
      .eq('type', 'Income')
      .neq('transaction_status', 'Void')
      .order('transaction_date', { ascending: false });

    if (error) {
      console.error(error);
      return;
    }

    const secTxs = (txs || []).filter((t) => (t.description || '').startsWith(SEC_PREFIX));
    const txIds = secTxs.map((t) => t.id);

    // Allocations
    const allocsByTx = new Map<string, SecReceiptAllocation[]>();
    if (txIds.length > 0) {
      const { data: allocs } = await supabase
        .from('IncomeAllocations')
        .select('id, transaction_id, category_id, amount, AccountCategories(name)')
        .in('transaction_id', txIds);
      type AllocRow = {
        id: string;
        transaction_id: string;
        category_id: string | null;
        amount: number;
        AccountCategories: { name: string } | null;
      };
      (allocs as AllocRow[] | null)?.forEach((a) => {
        const list = allocsByTx.get(a.transaction_id) || [];
        list.push({
          id: a.id,
          category_id: a.category_id,
          category_name: a.AccountCategories?.name || null,
          amount: Number(a.amount),
        });
        allocsByTx.set(a.transaction_id, list);
      });
    }

    // Refunds tagged per receipt
    const { data: refunds } = await supabase
      .from('Transactions')
      .select('amount, description')
      .eq('booking_id', booking.id)
      .eq('organization_id', profile.organization_id)
      .eq('type', 'Refund');

    const refundByTx = new Map<string, number>();
    (refunds || []).forEach((r) => {
      const m = (r.description || '').match(/\[SEC-REFUND\] for receipt ([0-9a-f-]+)/);
      if (m) {
        refundByTx.set(m[1], (refundByTx.get(m[1]) || 0) + Number(r.amount));
      }
    });

    setSecReceipts(
      secTxs.map((t) => ({
        id: t.id,
        amount: Number(t.amount),
        date: t.transaction_date,
        to_account_id: t.to_account_id,
        description: (t.description || '').replace(SEC_PREFIX, ''),
        status: t.transaction_status,
        allocations: allocsByTx.get(t.id) || [],
        refundedAmount: refundByTx.get(t.id) || 0,
      })),
    );
  }, [booking?.id, profile?.organization_id]);

  useEffect(() => {
    if (open) {
      loadPayments();
      loadSecondaryReceipts();
    }
  }, [open, loadPayments, loadSecondaryReceipts]);

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(booking.id, {
      eventName,
      clientId,
      startDate: `${startDate}T${startTime}:00`,
      endDate: `${endDate}T${endTime}:00`,
      rentFinalized: parseFloat(rentFinalized) || 0,
      notes: notes || undefined,
    });
  };

  // ── Primary payments handlers ──
  const handleAddPayment = async () => {
    const amt = parseFloat(payAmount);
    if (!amt || amt <= 0 || !payAccountId || !payCategoryId) {
      toast({ title: 'Missing fields', description: 'Amount, account, and category are required', variant: 'destructive' });
      return;
    }
    try {
      const tx = await addTransaction({
        type: 'Income',
        amount: amt,
        to_account_id: payAccountId,
        booking_id: booking.id,
        entity_id: booking.clientId,
        transaction_date: payDate,
        description: payDescription || null,
      });
      await allocate({ transaction_id: tx.id, category_id: payCategoryId, amount: amt });
      setPayAmount('');
      setPayDescription('');
      setPayCategoryId('');
      await loadPayments();
      await refetchBookings();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeletePayment = async (id: string) => {
    if (!confirm('Delete this payment?')) return;
    try {
      await supabase.from('IncomeAllocations').delete().eq('transaction_id', id);
      await deleteTransaction(id);
      await loadPayments();
      await refetchBookings();
    } catch (e) {
      console.error(e);
    }
  };

  // ── Secondary receipt handlers ──
  const handleAddSecondaryReceipt = async () => {
    const amt = parseFloat(secRecAmount);
    if (!amt || amt <= 0 || !secRecAccountId) {
      toast({ title: 'Missing fields', description: 'Amount and account are required', variant: 'destructive' });
      return;
    }
    try {
      await addTransaction({
        type: 'Income',
        amount: amt,
        to_account_id: secRecAccountId,
        booking_id: booking.id,
        entity_id: booking.clientId,
        transaction_date: secRecDate,
        description: SEC_PREFIX + (secRecDescription || ''),
      });
      setSecRecAmount('');
      setSecRecDescription('');
      await loadSecondaryReceipts();
      await refetchBookings();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteSecondaryReceipt = async (id: string) => {
    if (!confirm('Delete this secondary receipt and its allocations/refunds?')) return;
    try {
      await supabase.from('IncomeAllocations').delete().eq('transaction_id', id);
      // Delete tagged refunds
      const { data: refunds } = await supabase
        .from('Transactions')
        .select('id')
        .like('description', `%${SEC_REFUND_TAG(id)}%`);
      for (const r of refunds || []) {
        await supabase.from('Transactions').delete().eq('id', r.id);
      }
      await deleteTransaction(id);
      await loadSecondaryReceipts();
      await refetchBookings();
    } catch (e) {
      console.error(e);
    }
  };

  const handleAllocateSec = async (receipt: SecReceipt) => {
    const draft = allocDraft[receipt.id];
    const amt = parseFloat(draft?.amount || '');
    if (!draft?.categoryId || !amt || amt <= 0) {
      toast({ title: 'Missing fields', description: 'Category and amount required', variant: 'destructive' });
      return;
    }
    const allocated = receipt.allocations.reduce((s, a) => s + a.amount, 0);
    const remaining = receipt.amount - allocated - receipt.refundedAmount;
    if (amt > remaining + 0.001) {
      toast({ title: 'Exceeds balance', description: `Max allocatable: ${fmtINR(remaining)}`, variant: 'destructive' });
      return;
    }
    try {
      await allocate({ transaction_id: receipt.id, category_id: draft.categoryId, amount: amt });
      setAllocDraft((prev) => ({ ...prev, [receipt.id]: { categoryId: '', amount: '' } }));
      await loadSecondaryReceipts();
      await refetchBookings();
    } catch (e) {
      console.error(e);
    }
  };

  const handleRemoveAllocation = async (receiptId: string, allocId: string) => {
    if (!confirm('Remove this allocation?')) return;
    try {
      await removeAllocation(allocId, receiptId);
      await loadSecondaryReceipts();
      await refetchBookings();
    } catch (e) {
      console.error(e);
    }
  };

  const handleRefundSec = async (receipt: SecReceipt) => {
    const allocated = receipt.allocations.reduce((s, a) => s + a.amount, 0);
    const remaining = receipt.amount - allocated - receipt.refundedAmount;
    if (remaining <= 0) {
      toast({ title: 'Nothing to refund', variant: 'destructive' });
      return;
    }
    const fromAccount = refundDraft[receipt.id]?.accountId;
    if (!fromAccount) {
      toast({ title: 'Select account', description: 'Choose source account for refund', variant: 'destructive' });
      return;
    }
    try {
      await addTransaction({
        type: 'Refund',
        amount: remaining,
        from_account_id: fromAccount,
        booking_id: booking.id,
        entity_id: booking.clientId,
        transaction_date: new Date().toISOString().split('T')[0],
        description: SEC_REFUND_TAG(receipt.id),
      });
      // Recompute status: after refund + allocations, receipt is fully covered
      await supabase
        .from('Transactions')
        .update({ transaction_status: 'Fully Allocated' })
        .eq('id', receipt.id);
      setRefundDraft((prev) => ({ ...prev, [receipt.id]: { accountId: '' } }));
      await loadSecondaryReceipts();
      await refetchBookings();
    } catch (e) {
      console.error(e);
    }
  };

  // ── Summary calcs ──
  const totalPaid = payments.reduce((s, p) => s + p.amount, 0);
  const balance = (parseFloat(rentFinalized) || 0) - totalPaid;

  const secTotalReceived = secReceipts.reduce((s, r) => s + r.amount, 0);
  const secTotalAllocated = secReceipts.reduce(
    (s, r) => s + r.allocations.reduce((x, a) => x + a.amount, 0),
    0,
  );
  const secTotalRefunded = secReceipts.reduce((s, r) => s + r.refundedAmount, 0);
  const secUnallocated = secTotalReceived - secTotalAllocated - secTotalRefunded;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[640px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Booking</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="details">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="secondary">Secondary Income</TabsTrigger>
          </TabsList>

          {/* DETAILS */}
          <TabsContent value="details">
            <form onSubmit={handleDetailsSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Event Name *</Label>
                <Input value={eventName} onChange={(e) => setEventName(e.target.value)} required />
              </div>

              <div className="space-y-2">
                <Label>Client *</Label>
                <Select value={clientId} onValueChange={setClientId}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((c) => (
                      <SelectItem key={c.client_id} value={c.client_id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Start Date *</Label>
                  <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label>Start Time *</Label>
                  <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>End Date *</Label>
                  <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label>End Time *</Label>
                  <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} required />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Rent Finalized *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={rentFinalized}
                  onChange={(e) => setRentFinalized(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button type="submit">Update Booking</Button>
              </div>
            </form>
          </TabsContent>

          {/* PAYMENTS */}
          <TabsContent value="payments" className="space-y-4">
            <div className="grid grid-cols-3 gap-2 text-sm">
              <Card className="p-3">
                <div className="text-xs text-muted-foreground">Finalized</div>
                <div className="font-semibold">{fmtINR(parseFloat(rentFinalized) || 0)}</div>
              </Card>
              <Card className="p-3">
                <div className="text-xs text-muted-foreground">Received</div>
                <div className="font-semibold text-green-600">{fmtINR(totalPaid)}</div>
              </Card>
              <Card className="p-3">
                <div className="text-xs text-muted-foreground">Balance</div>
                <div className="font-semibold text-orange-600">{fmtINR(balance)}</div>
              </Card>
            </div>

            <Card className="p-4 space-y-3">
              <h4 className="font-semibold text-sm">Add Payment</h4>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">Amount *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={payAmount}
                    onChange={(e) => setPayAmount(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Date *</Label>
                  <Input type="date" value={payDate} onChange={(e) => setPayDate(e.target.value)} />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">To Account *</Label>
                <Select value={payAccountId} onValueChange={setPayAccountId}>
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
              <div className="space-y-1">
                <Label className="text-xs">Category *</Label>
                <Select value={payCategoryId} onValueChange={setPayCategoryId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select income category" />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentCategories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Description</Label>
                <Input value={payDescription} onChange={(e) => setPayDescription(e.target.value)} />
              </div>
              <Button type="button" onClick={handleAddPayment} className="w-full" size="sm">
                <Plus className="h-4 w-4 mr-1" /> Add Payment
              </Button>
            </Card>

            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Payment History</h4>
              {payments.length === 0 ? (
                <p className="text-sm text-muted-foreground">No payments yet</p>
              ) : (
                payments.map((p) => {
                  const acc = accounts.find((a) => a.id === p.to_account_id);
                  return (
                    <Card key={p.id} className="p-3 flex justify-between items-center">
                      <div className="flex-1">
                        <div className="font-semibold text-green-600">{fmtINR(p.amount)}</div>
                        <div className="text-xs text-muted-foreground">
                          {p.date} · {acc?.name || '—'} · {p.category_name || 'Uncategorized'}
                        </div>
                        {p.description && <div className="text-xs">{p.description}</div>}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                        onClick={() => handleDeletePayment(p.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </Card>
                  );
                })
              )}
            </div>
          </TabsContent>

          {/* SECONDARY INCOME */}
          <TabsContent value="secondary" className="space-y-4">
            <div className="grid grid-cols-4 gap-2 text-sm">
              <Card className="p-3">
                <div className="text-xs text-muted-foreground">Received</div>
                <div className="font-semibold text-green-600">{fmtINR(secTotalReceived)}</div>
              </Card>
              <Card className="p-3">
                <div className="text-xs text-muted-foreground">Allocated</div>
                <div className="font-semibold">{fmtINR(secTotalAllocated)}</div>
              </Card>
              <Card className="p-3">
                <div className="text-xs text-muted-foreground">Refunded</div>
                <div className="font-semibold text-orange-600">{fmtINR(secTotalRefunded)}</div>
              </Card>
              <Card className="p-3">
                <div className="text-xs text-muted-foreground">Unallocated</div>
                <div className="font-semibold text-blue-600">{fmtINR(secUnallocated)}</div>
              </Card>
            </div>

            <Card className="p-4 space-y-3">
              <h4 className="font-semibold text-sm">Record Secondary Receipt</h4>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">Amount *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={secRecAmount}
                    onChange={(e) => setSecRecAmount(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Date *</Label>
                  <Input type="date" value={secRecDate} onChange={(e) => setSecRecDate(e.target.value)} />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">To Account *</Label>
                <Select value={secRecAccountId} onValueChange={setSecRecAccountId}>
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
              <div className="space-y-1">
                <Label className="text-xs">Description</Label>
                <Input
                  value={secRecDescription}
                  onChange={(e) => setSecRecDescription(e.target.value)}
                  placeholder="e.g. Decoration advance"
                />
              </div>
              <Button type="button" onClick={handleAddSecondaryReceipt} className="w-full" size="sm">
                <Plus className="h-4 w-4 mr-1" /> Record Receipt
              </Button>
            </Card>

            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Receipts</h4>
              {secReceipts.length === 0 ? (
                <p className="text-sm text-muted-foreground">No secondary receipts yet</p>
              ) : (
                secReceipts.map((r) => {
                  const acc = accounts.find((a) => a.id === r.to_account_id);
                  const allocated = r.allocations.reduce((s, a) => s + a.amount, 0);
                  const remaining = r.amount - allocated - r.refundedAmount;
                  const draft = allocDraft[r.id] || { categoryId: '', amount: '' };
                  const refDraft = refundDraft[r.id] || { accountId: '' };
                  return (
                    <Card key={r.id} className="p-3 space-y-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="font-semibold text-green-600">{fmtINR(r.amount)}</div>
                          <div className="text-xs text-muted-foreground">
                            {r.date} · {acc?.name || '—'}
                          </div>
                          {r.description && <div className="text-xs">{r.description}</div>}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">{r.status}</Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive"
                            onClick={() => handleDeleteSecondaryReceipt(r.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Allocations */}
                      <div className="space-y-1 border-t pt-2">
                        <div className="text-xs font-semibold text-muted-foreground">Allocations</div>
                        {r.allocations.length === 0 ? (
                          <div className="text-xs text-muted-foreground">None yet</div>
                        ) : (
                          r.allocations.map((a) => (
                            <div key={a.id} className="flex justify-between items-center text-sm">
                              <span>{a.category_name || 'Uncategorized'}</span>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{fmtINR(a.amount)}</span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 text-destructive"
                                  onClick={() => handleRemoveAllocation(r.id, a.id)}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      {/* Add allocation */}
                      {remaining > 0 && (
                        <div className="border-t pt-2 space-y-2">
                          <div className="text-xs">
                            Unallocated: <span className="font-semibold text-blue-600">{fmtINR(remaining)}</span>
                          </div>
                          <div className="grid grid-cols-[1fr_100px_auto] gap-2 items-end">
                            <Select
                              value={draft.categoryId}
                              onValueChange={(v) =>
                                setAllocDraft((prev) => ({ ...prev, [r.id]: { ...draft, categoryId: v } }))
                              }
                            >
                              <SelectTrigger className="h-9">
                                <SelectValue placeholder="Category" />
                              </SelectTrigger>
                              <SelectContent>
                                {secondaryCategories.length === 0 ? (
                                  <div className="px-2 py-1.5 text-sm text-muted-foreground">
                                    No secondary categories
                                  </div>
                                ) : (
                                  secondaryCategories.map((c) => (
                                    <SelectItem key={c.id} value={c.id}>
                                      {c.name}
                                    </SelectItem>
                                  ))
                                )}
                              </SelectContent>
                            </Select>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="Amount"
                              value={draft.amount}
                              onChange={(e) =>
                                setAllocDraft((prev) => ({ ...prev, [r.id]: { ...draft, amount: e.target.value } }))
                              }
                              className="h-9"
                            />
                            <Button size="sm" onClick={() => handleAllocateSec(r)}>
                              Allocate
                            </Button>
                          </div>

                          {/* Refund */}
                          <div className="grid grid-cols-[1fr_auto] gap-2 items-end pt-1">
                            <Select
                              value={refDraft.accountId}
                              onValueChange={(v) =>
                                setRefundDraft((prev) => ({ ...prev, [r.id]: { accountId: v } }))
                              }
                            >
                              <SelectTrigger className="h-9">
                                <SelectValue placeholder="Refund from account" />
                              </SelectTrigger>
                              <SelectContent>
                                {cashBankAccounts.map((a) => (
                                  <SelectItem key={a.id} value={a.id}>
                                    {a.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Button size="sm" variant="outline" onClick={() => handleRefundSec(r)}>
                              Refund {fmtINR(remaining)}
                            </Button>
                          </div>
                        </div>
                      )}
                    </Card>
                  );
                })
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
