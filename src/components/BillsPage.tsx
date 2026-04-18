import { useState, useMemo, useEffect } from 'react';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useBills, type Bill, type BillStatus } from '@/hooks/useBills';
import { useVendors } from '@/hooks/useVendors';
import { useAccountCategories } from '@/hooks/useAccountCategories';
import { useTransactions } from '@/hooks/useTransactions';
import { format } from 'date-fns';

const statusColors: Record<BillStatus, string> = {
  unpaid: 'bg-red-100 text-red-700 border-red-200',
  partial: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  paid: 'bg-green-100 text-green-700 border-green-200',
};

const AddBillDialog = ({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) => {
  const { addBill } = useBills();
  const { vendors } = useVendors();
  const { expenseCategories } = useAccountCategories();
  const [vendorId, setVendorId] = useState('');
  const [billNumber, setBillNumber] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [amount, setAmount] = useState('');

  useEffect(() => {
    if (open) {
      setVendorId('');
      setBillNumber('');
      setCategoryId('');
      setDate(new Date().toISOString().split('T')[0]);
      setAmount('');
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorId || !amount) return;
    await addBill({
      vendor_id: vendorId,
      bill_number: billNumber || undefined,
      category_id: categoryId || null,
      date,
      amount: parseFloat(amount),
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Bill</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Vendor *</Label>
            <Select value={vendorId} onValueChange={setVendorId}>
              <SelectTrigger>
                <SelectValue placeholder="Select vendor" />
              </SelectTrigger>
              <SelectContent>
                {vendors.map((v) => (
                  <SelectItem key={v.vendor_id} value={v.vendor_id}>
                    {v.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Bill Number</Label>
            <Input value={billNumber} onChange={(e) => setBillNumber(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {expenseCategories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Date *</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label>Amount *</Label>
            <Input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Bill</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const AllocateBillDialog = ({
  open,
  onOpenChange,
  bill,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  bill: Bill | null;
}) => {
  const { allocateToBill, allocations } = useBills();
  const { transactions } = useTransactions();
  const [transactionId, setTransactionId] = useState('');
  const [amount, setAmount] = useState('');

  // Available payments: Advance Paid / Expense type, not Void
  const availableTxs = transactions.filter(
    (t) =>
      (t.type === 'Advance Paid' || t.type === 'Expense') &&
      t.transaction_status !== 'Void' &&
      t.transaction_status !== 'Fully Allocated',
  );

  useEffect(() => {
    if (open) {
      setTransactionId('');
      setAmount(bill ? String(bill.amount) : '');
    }
  }, [open, bill]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bill || !transactionId) return;
    await allocateToBill({
      transaction_id: transactionId,
      bill_id: bill.id,
      amount_applied: parseFloat(amount),
    });
    onOpenChange(false);
  };

  if (!bill) return null;

  const totalAllocated = allocations
    .filter((a) => a.bill_id === bill.id)
    .reduce((s, a) => s + Number(a.amount_applied), 0);
  const remaining = Number(bill.amount) - totalAllocated;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Allocate Payment to Bill</DialogTitle>
        </DialogHeader>
        <div className="text-sm text-muted-foreground mb-2">
          Bill amount: ₹{Number(bill.amount).toLocaleString('en-IN')} • Remaining: ₹
          {remaining.toLocaleString('en-IN')}
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Source Transaction *</Label>
            <Select value={transactionId} onValueChange={setTransactionId}>
              <SelectTrigger>
                <SelectValue placeholder="Pick a payment transaction" />
              </SelectTrigger>
              <SelectContent>
                {availableTxs.length === 0 && (
                  <SelectItem value="none" disabled>
                    No available transactions
                  </SelectItem>
                )}
                {availableTxs.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.type} — ₹{Number(t.amount).toLocaleString('en-IN')} —{' '}
                    {format(new Date(t.transaction_date), 'dd MMM yyyy')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Amount to Apply *</Label>
            <Input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Apply</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export const BillsPage = () => {
  const { bills, loading, deleteBill } = useBills();
  const { vendors } = useVendors();
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [allocBill, setAllocBill] = useState<Bill | null>(null);

  const vendorMap = useMemo(() => new Map(vendors.map((v) => [v.vendor_id, v.name])), [vendors]);

  const filtered = bills.filter((b) => {
    const vendor = vendorMap.get(b.vendor_id) || '';
    return (
      vendor.toLowerCase().includes(search.toLowerCase()) ||
      (b.bill_number || '').toLowerCase().includes(search.toLowerCase())
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-foreground mb-6">Bills</h1>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search bills…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {filtered.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No bills yet</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {filtered.map((b) => (
              <Card key={b.id} className="p-4">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground">
                        {vendorMap.get(b.vendor_id) || 'Unknown vendor'}
                      </h3>
                      <Badge className={statusColors[b.status]}>{b.status}</Badge>
                    </div>
                    {b.bill_number && (
                      <p className="text-sm text-muted-foreground">Bill #: {b.bill_number}</p>
                    )}
                    <p className="text-sm text-muted-foreground">
                      Date: {format(new Date(b.date), 'dd MMM yyyy')}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <p className="font-bold text-lg">₹{Number(b.amount).toLocaleString('en-IN')}</p>
                    <div className="flex gap-1">
                      {b.status !== 'paid' && (
                        <Button size="sm" variant="outline" onClick={() => setAllocBill(b)}>
                          Apply Payment
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                        onClick={() => {
                          if (confirm('Delete this bill?')) deleteBill(b.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Button
        onClick={() => setShowAdd(true)}
        className="fixed bottom-24 right-4 h-14 w-14 rounded-full shadow-lg z-50"
        size="icon"
      >
        <Plus className="h-6 w-6" />
      </Button>

      <AddBillDialog open={showAdd} onOpenChange={setShowAdd} />
      <AllocateBillDialog
        open={!!allocBill}
        onOpenChange={(o) => !o && setAllocBill(null)}
        bill={allocBill}
      />
    </div>
  );
};
