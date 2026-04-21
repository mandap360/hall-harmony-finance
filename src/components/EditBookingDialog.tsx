import { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
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

const SEC_REFUND_TAG_PREFIX = '[SEC-REFUND]';
const SEC_REFUND_DESC = (bookingId: string) => `${SEC_REFUND_TAG_PREFIX} for booking ${bookingId}`;

interface PaymentRow {
  id: string;
  amount: number;
  date: string;
  to_account_id: string | null;
  description: string | null;
  category_id: string | null;
  category_name: string | null;
}

interface PoolAllocation {
  id: string;
  category_id: string | null;
  category_name: string | null;
  amount: number;
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
  // Payments tab categories: all income categories that are not "true" secondary income.
  // Secondary Deposit is the pool anchor (is_secondary_income=false) and remains selectable here.
  const paymentCategories = categories.filter((c) => c.type === 'income' && !c.is_secondary_income);
  // Secondary Income tab allocation targets: only categories flagged is_secondary_income=true.
  const secondaryCategories = categories.filter((c) => c.type === 'income' && c.is_secondary_income);

  // Anchor pool category — money received into "Secondary Deposit" via the Payments tab.
  const secondaryDepositCategory = categories.find(
    (c) => c.name === 'Secondary Deposit' && c.type === 'income' && !c.is_secondary_income,
  );
  const secondaryDepositCategoryId = secondaryDepositCategory?.id;

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

  // Secondary receipts (pool model)
  const [poolAllocations, setPoolAllocations] = useState<PoolAllocation[]>([]);
  const [poolRefundedAmount, setPoolRefundedAmount] = useState(0);
  const [poolRefundTxs, setPoolRefundTxs] = useState<{ id: string; amount: number; date: string; from_account_id: string | null }[]>([]);
  const [poolTxs, setPoolTxs] = useState<any[]>([]);

  // Allocation form
  const [allocCategoryId, setAllocCategoryId] = useState('');
  const [allocAmount, setAllocAmount] = useState('');

  // Refund form
  const [refundAccountId, setRefundAccountId] = useState('');

  // Secondary receipt form
  const [secReceiptAmount, setSecReceiptAmount] = useState('');
  const [secReceiptDate, setSecReceiptDate] = useState(new Date().toISOString().split('T')[0]);
  const [secReceiptAccountId, setSecReceiptAccountId] = useState('');
  const [secReceiptDescription, setSecReceiptDescription] = useState('');

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

  // Resolve client name even if client is missing from current org list (orphan)
  const selectedClient = clients.find((c) => c.client_id === clientId);
  const displayClientName = selectedClient?.name || booking.clientName || '';

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

    const allTxs = txs || [];
    const txIds = allTxs.map((t) => t.id);
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
      allTxs.map((t) => ({
        id: t.id,
        amount: Number(t.amount),
        date: t.transaction_date,
        to_account_id: t.to_account_id,
        description: t.description,
        category_id: allocMap.get(t.id)?.category_id || null,
        category_name: allocMap.get(t.id)?.category_name || null,
      })),
    );
  }, [booking?.id, profile?.organization_id, secondaryIncomeCategoryId]);

  const loadSecondaryPool = useCallback(async () => {
    if (!booking?.id || !profile?.organization_id || !secondaryIncomeCategoryId) return;

    // 1. All Income txs for this booking
    const { data: txs, error } = await supabase
      .from('Transactions')
      .select('id, amount, transaction_date, to_account_id, from_account_id, description, transaction_status, type')
      .eq('booking_id', booking.id)
      .eq('organization_id', profile.organization_id)
      .neq('transaction_status', 'Void')
      .order('transaction_date', { ascending: false });

    if (error) {
      console.error(error);
      return;
    }

    const all = txs || [];

    // Get all allocations for these txs
    const txIds = all.map((t) => t.id);
    let allocMap = new Map<string, { category_id: string | null }>();
    if (txIds.length > 0) {
      const { data: allocs } = await supabase
        .from('IncomeAllocations')
        .select('transaction_id, category_id')
        .in('transaction_id', txIds);
      allocs?.forEach((a) => {
        allocMap.set(a.transaction_id, { category_id: a.category_id });
      });
    }

    // Pool txs = those allocated to "Secondary Income" category
    const poolTxs = all.filter((t) => allocMap.get(t.id)?.category_id === secondaryIncomeCategoryId);
    setPoolTxs(poolTxs);

    // Refund txs (unchanged)
    const refundTxs = all.filter(
      (t) => t.type === 'Refund' && (t.description || '').startsWith(SEC_REFUND_TAG_PREFIX),
    );

    setPoolRefundTxs(
      refundTxs.map((t) => ({
        id: t.id,
        amount: Number(t.amount),
        date: t.transaction_date,
        from_account_id: t.from_account_id, // assuming from_account_id is selected
      })),
    );

    // Re-fetch refund details if needed (similar to before)
    if (refundTxs.length > 0) {
      const { data: rd } = await supabase
        .from('Transactions')
        .select('id, amount, transaction_date, from_account_id')
        .in('id', refundTxs.map((t) => t.id));
      setPoolRefundTxs(
        (rd || []).map((t) => ({
          id: t.id,
          amount: Number(t.amount),
          date: t.transaction_date,
          from_account_id: t.from_account_id,
        })),
      );
    } else {
      setPoolRefundTxs([]);
    }

    setPoolRefundedAmount(refundTxs.reduce((s, t) => s + Number(t.amount), 0));

    // 2. Allocations from pool txs to secondary categories
    const poolTxIds = poolTxs.map((t) => t.id);
    if (poolTxIds.length > 0) {
      const { data: allocs } = await supabase
        .from('IncomeAllocations')
        .select('id, category_id, amount, AccountCategories(name)')
        .in('transaction_id', poolTxIds)
        .eq('AccountCategories.is_secondary_income', true); // Only secondary categories
      type AllocRow = {
        id: string;
        category_id: string | null;
        amount: number;
        AccountCategories: { name: string } | null;
      };
      // Aggregate per category
      const byCategory = new Map<string, PoolAllocation>();
      (allocs as AllocRow[] | null)?.forEach((a) => {
        const key = a.category_id || 'uncategorized';
        const existing = byCategory.get(key);
        if (existing) {
          existing.amount += Number(a.amount);
          // keep first id; we treat as one logical row per category
        } else {
          byCategory.set(key, {
            id: a.id,
            category_id: a.category_id,
            category_name: a.AccountCategories?.name || null,
            amount: Number(a.amount),
          });
        }
      });
      setPoolAllocations(Array.from(byCategory.values()));
    } else {
      setPoolAllocations([]);
    }
  }, [booking?.id, profile?.organization_id, secondaryIncomeCategoryId]);

  useEffect(() => {
    if (open) {
      loadPayments();
      loadSecondaryPool();
    }
  }, [open, loadPayments, loadSecondaryPool]);

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

  // ── Secondary pool handlers ──

  const secTotalReceived = poolTxs.reduce((s, t) => s + Number(t.amount), 0);
  const secTotalAllocated = poolAllocations.reduce((s, a) => s + a.amount, 0);
  const secUnallocated = secTotalReceived - secTotalAllocated - poolRefundedAmount;

  // Categories already used (each can only be allocated once)
  const usedCategoryIds = new Set(poolAllocations.map((a) => a.category_id).filter(Boolean) as string[]);
  const availableCategories = secondaryCategories.filter((c) => !usedCategoryIds.has(c.id));

  const handleAddSecReceipt = async () => {
    const amt = parseFloat(secReceiptAmount);
    if (!amt || amt <= 0 || !secReceiptAccountId) {
      toast({ title: 'Missing fields', description: 'Amount and account are required', variant: 'destructive' });
      return;
    }
    if (!secondaryIncomeCategoryId) {
      toast({ title: 'Missing category', description: '"Secondary Income" category not found', variant: 'destructive' });
      return;
    }
    try {
      const tx = await addTransaction({
        type: 'Income',
        amount: amt,
        to_account_id: secReceiptAccountId,
        booking_id: booking.id,
        entity_id: booking.clientId,
        transaction_date: secReceiptDate,
        description: secReceiptDescription || null,
      });
      await allocate({ transaction_id: tx.id, category_id: secondaryIncomeCategoryId, amount: amt });
      setSecReceiptAmount('');
      setSecReceiptDescription('');
      setSecReceiptAccountId('');
      await loadSecondaryPool();
      await loadPayments();
      await refetchBookings();
    } catch (e) {
      console.error(e);
    }
  };

  const handleAllocatePool = async () => {
    const amt = parseFloat(allocAmount);
    if (!allocCategoryId || !amt || amt <= 0) {
      toast({ title: 'Missing fields', description: 'Category and amount required', variant: 'destructive' });
      return;
    }
    if (amt > secUnallocated + 0.001) {
      toast({ title: 'Exceeds pool', description: `Max allocatable: ${fmtINR(secUnallocated)}`, variant: 'destructive' });
      return;
    }
    if (usedCategoryIds.has(allocCategoryId)) {
      toast({ title: 'Already allocated', description: 'This category is already allocated', variant: 'destructive' });
      return;
    }
    if (poolTxs.length === 0) {
      toast({ title: 'No pool', description: 'No secondary income payments to allocate from', variant: 'destructive' });
      return;
    }
    // Pool model: attach allocation to the first pool transaction
    const targetTx = poolTxs[0];
    try {
      await allocate({ transaction_id: targetTx.id, category_id: allocCategoryId, amount: amt });
      setAllocCategoryId('');
      setAllocAmount('');
      await loadSecondaryPool();
      await refetchBookings();
    } catch (e) {
      console.error(e);
    }
  };

  const handleRemoveAllocation = async (alloc: PoolAllocation) => {
    if (!confirm(`Remove allocation for ${alloc.category_name}?`)) return;
    try {
      // Remove ALL allocations matching this category across pool txs
      const txIds = poolTxs.map((t) => t.id);
      if (txIds.length > 0) {
        const { data: allocsToRemove } = await supabase
          .from('IncomeAllocations')
          .select('id, transaction_id')
          .in('transaction_id', txIds)
          .eq('category_id', alloc.category_id || '');
        for (const a of allocsToRemove || []) {
          await removeAllocation(a.id, a.transaction_id);
        }
      }
      await loadSecondaryPool();
      await refetchBookings();
    } catch (e) {
      console.error(e);
    }
  };

  const handleRefundPool = async () => {
    if (secUnallocated <= 0) {
      toast({ title: 'Nothing to refund', variant: 'destructive' });
      return;
    }
    if (!refundAccountId) {
      toast({ title: 'Select account', description: 'Choose source account', variant: 'destructive' });
      return;
    }
    try {
      await addTransaction({
        type: 'Refund',
        amount: secUnallocated,
        from_account_id: refundAccountId,
        booking_id: booking.id,
        entity_id: booking.clientId,
        transaction_date: new Date().toISOString().split('T')[0],
        description: SEC_REFUND_DESC(booking.id),
      });
      setRefundAccountId('');
      await loadSecondaryPool();
      await refetchBookings();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteRefund = async (id: string) => {
    if (!confirm('Delete this refund?')) return;
    try {
      await deleteTransaction(id);
      await loadSecondaryPool();
      await refetchBookings();
    } catch (e) {
      console.error(e);
    }
  };

  // ── Summary calcs ──
  const totalPaid = payments.reduce((s, p) => s + p.amount, 0);
  const balance = (parseFloat(rentFinalized) || 0) - totalPaid;

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
                    <SelectValue placeholder={displayClientName || 'Select client'}>
                      {displayClientName || 'Select client'}
                    </SelectValue>
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

          {/* SECONDARY INCOME — pool model */}
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
                <div className="font-semibold text-orange-600">{fmtINR(poolRefundedAmount)}</div>
              </Card>
              <Card className="p-3">
                <div className="text-xs text-muted-foreground">Unallocated</div>
                <div className="font-semibold text-blue-600">{fmtINR(secUnallocated)}</div>
              </Card>
            </div>

            {/* Add secondary receipt */}
            <Card className="p-4 space-y-3">
              <h4 className="font-semibold text-sm">Record Secondary Income Receipt</h4>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">Amount *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={secReceiptAmount}
                    onChange={(e) => setSecReceiptAmount(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Date *</Label>
                  <Input type="date" value={secReceiptDate} onChange={(e) => setSecReceiptDate(e.target.value)} />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">To Account *</Label>
                <Select value={secReceiptAccountId} onValueChange={setSecReceiptAccountId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select account" />
                  </SelectTrigger>
                  <SelectContent>
                    {cashBankAccounts.map((a) => (
                      <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Description</Label>
                <Input value={secReceiptDescription} onChange={(e) => setSecReceiptDescription(e.target.value)} />
              </div>
              <Button type="button" onClick={handleAddSecReceipt} className="w-full" size="sm">
                <Plus className="h-4 w-4 mr-1" /> Add Receipt
              </Button>
            </Card>

            {/* Allocate pool */}
            <Card className="p-4 space-y-3">
              <h4 className="font-semibold text-sm">Allocate to Categories</h4>
              <p className="text-xs text-muted-foreground">
                Pool available: <span className="font-semibold text-blue-600">{fmtINR(secUnallocated)}</span>
                {' · '}Each category can be allocated only once.
              </p>

              {/* Existing allocations */}
              {poolAllocations.length > 0 && (
                <div className="space-y-1 border-t pt-2">
                  {poolAllocations.map((a) => (
                    <div key={a.id} className="flex justify-between items-center text-sm">
                      <span>{a.category_name || 'Uncategorized'}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{fmtINR(a.amount)}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-destructive"
                          onClick={() => handleRemoveAllocation(a)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add allocation */}
              {availableCategories.length > 0 ? (
                <div className="border-t pt-2 space-y-2">
                  <div className="grid grid-cols-[1fr_120px_auto] gap-2 items-end">
                    <Select value={allocCategoryId} onValueChange={setAllocCategoryId}>
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableCategories.map((c) => (
                          <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Amount"
                      value={allocAmount}
                      onChange={(e) => setAllocAmount(e.target.value)}
                      className="h-9"
                    />
                    <Button size="sm" onClick={handleAllocatePool} disabled={secUnallocated <= 0}>
                      Allocate
                    </Button>
                  </div>
                </div>
              ) : secondaryCategories.length > 0 ? (
                <p className="text-xs text-muted-foreground border-t pt-2">
                  All secondary categories already allocated.
                </p>
              ) : (
                <p className="text-xs text-muted-foreground border-t pt-2">
                  No secondary income categories defined. Create one in Settings → Categories.
                </p>
              )}
            </Card>

            {/* Refund pool */}
            <Card className="p-4 space-y-3">
              <h4 className="font-semibold text-sm">Refund Unallocated</h4>
              <div className="grid grid-cols-[1fr_auto] gap-2 items-end">
                <Select value={refundAccountId} onValueChange={setRefundAccountId}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Refund from account" />
                  </SelectTrigger>
                  <SelectContent>
                    {cashBankAccounts.map((a) => (
                      <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button size="sm" variant="outline" onClick={handleRefundPool} disabled={secUnallocated <= 0}>
                  Refund {fmtINR(Math.max(secUnallocated, 0))}
                </Button>
              </div>
            </Card>

            {/* Refund history */}
            {poolRefundTxs.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Refunds</h4>
                {poolRefundTxs.map((r) => {
                  const acc = accounts.find((a) => a.id === r.from_account_id);
                  return (
                    <Card key={r.id} className="p-3 flex justify-between items-center">
                      <div className="flex-1">
                        <div className="font-semibold text-orange-600">{fmtINR(r.amount)}</div>
                        <div className="text-xs text-muted-foreground">
                          {r.date} · from {acc?.name || '—'}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                        onClick={() => handleDeleteRefund(r.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
