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

interface PaymentRow {
  id: string;
  amount: number;
  date: string;
  to_account_id: string | null;
  description: string | null;
  category_id: string | null;
  category_name: string | null;
}

interface SecondaryIncomeRow {
  id: string;
  amount: number;
  category_id: string | null;
  category_name: string | null;
  created_at: string;
}

export const EditBookingDialog = ({ open, onOpenChange, booking, onSubmit }: EditBookingDialogProps) => {
  const { clients } = useClients();
  const { accounts } = useAccounts();
  const { categories } = useAccountCategories();
  const { addTransaction, deleteTransaction } = useTransactions();
  const { allocate } = useIncomeAllocations();
  const { refetch: refetchBookings } = useBookings();
  const { profile } = useAuth();
  const { toast } = useToast();

  const cashBankAccounts = accounts.filter((a) => a.account_type === 'cash_bank');
  const paymentCategories = categories.filter((c) => c.type === 'income' && !c.is_secondary_income);
  const secondaryCategories = categories.filter((c) => c.type === 'income' && c.is_secondary_income);

  // Details tab state
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

  // Secondary income
  const [secIncomes, setSecIncomes] = useState<SecondaryIncomeRow[]>([]);
  const [secAmount, setSecAmount] = useState('');
  const [secCategoryId, setSecCategoryId] = useState('');

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

    const txIds = (txs || []).map((t) => t.id);
    let allocMap = new Map<string, { category_id: string | null; category_name: string | null }>();
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
      (txs || []).map((t) => ({
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

  const loadSecondaryIncome = useCallback(async () => {
    if (!booking?.id || !profile?.organization_id) return;
    const { data, error } = await supabase
      .from('SecondaryIncome')
      .select('id, amount, category_id, created_at, AccountCategories(name)')
      .eq('booking_id', booking.id)
      .eq('organization_id', profile.organization_id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error(error);
      return;
    }
    type SecRow = {
      id: string;
      amount: number;
      category_id: string | null;
      created_at: string;
      AccountCategories: { name: string } | null;
    };
    setSecIncomes(
      ((data as SecRow[] | null) || []).map((s) => ({
        id: s.id,
        amount: Number(s.amount),
        category_id: s.category_id,
        category_name: s.AccountCategories?.name || null,
        created_at: s.created_at,
      })),
    );
  }, [booking?.id, profile?.organization_id]);

  useEffect(() => {
    if (open) {
      loadPayments();
      loadSecondaryIncome();
    }
  }, [open, loadPayments, loadSecondaryIncome]);

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
      // Delete allocations first (no cascade)
      await supabase.from('IncomeAllocations').delete().eq('transaction_id', id);
      await deleteTransaction(id);
      await loadPayments();
      await refetchBookings();
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddSecondaryIncome = async () => {
    const amt = parseFloat(secAmount);
    if (!amt || amt <= 0 || !secCategoryId || !profile?.organization_id) {
      toast({ title: 'Missing fields', description: 'Amount and category are required', variant: 'destructive' });
      return;
    }
    try {
      const { error } = await supabase.from('SecondaryIncome').insert([
        {
          booking_id: booking.id,
          amount: amt,
          category_id: secCategoryId,
          organization_id: profile.organization_id,
        },
      ]);
      if (error) throw error;
      setSecAmount('');
      setSecCategoryId('');
      toast({ title: 'Success', description: 'Secondary income added' });
      await loadSecondaryIncome();
      await refetchBookings();
    } catch (e) {
      console.error(e);
      toast({ title: 'Error', description: 'Failed to add secondary income', variant: 'destructive' });
    }
  };

  const handleDeleteSecondaryIncome = async (id: string) => {
    if (!confirm('Delete this secondary income?')) return;
    try {
      const { error } = await supabase.from('SecondaryIncome').delete().eq('id', id);
      if (error) throw error;
      toast({ title: 'Deleted' });
      await loadSecondaryIncome();
      await refetchBookings();
    } catch (e) {
      console.error(e);
    }
  };

  const totalPaid = payments.reduce((s, p) => s + p.amount, 0);
  const totalSecondary = secIncomes.reduce((s, p) => s + p.amount, 0);
  const balance = (parseFloat(rentFinalized) || 0) - totalPaid;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
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
            <Card className="p-3">
              <div className="text-xs text-muted-foreground">Total Secondary Income</div>
              <div className="font-semibold">{fmtINR(totalSecondary)}</div>
            </Card>

            <Card className="p-4 space-y-3">
              <h4 className="font-semibold text-sm">Add Secondary Income</h4>
              <div className="space-y-1">
                <Label className="text-xs">Amount *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={secAmount}
                  onChange={(e) => setSecAmount(e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Category *</Label>
                <Select value={secCategoryId} onValueChange={setSecCategoryId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select secondary income category" />
                  </SelectTrigger>
                  <SelectContent>
                    {secondaryCategories.length === 0 ? (
                      <div className="px-2 py-1.5 text-sm text-muted-foreground">
                        No secondary income categories. Add one in Settings → Categories.
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
              </div>
              <Button type="button" onClick={handleAddSecondaryIncome} className="w-full" size="sm">
                <Plus className="h-4 w-4 mr-1" /> Add
              </Button>
            </Card>

            <div className="space-y-2">
              <h4 className="font-semibold text-sm">History</h4>
              {secIncomes.length === 0 ? (
                <p className="text-sm text-muted-foreground">No secondary income yet</p>
              ) : (
                secIncomes.map((s) => (
                  <Card key={s.id} className="p-3 flex justify-between items-center">
                    <div className="flex-1">
                      <div className="font-semibold">{fmtINR(s.amount)}</div>
                      <div className="text-xs text-muted-foreground">
                        {s.category_name || 'Uncategorized'} · {s.created_at.split('T')[0]}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive"
                      onClick={() => handleDeleteSecondaryIncome(s.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
