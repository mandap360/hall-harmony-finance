import { useState, useMemo, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, ChevronDown, ChevronUp, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useBills, type Bill, type BillStatus, type BillAllocation } from '@/hooks/useBills';
import { useVendors } from '@/hooks/useVendors';
import { useAccountCategories } from '@/hooks/useAccountCategories';
import { useTransactions } from '@/hooks/useTransactions';
import { useAccounts } from '@/hooks/useAccounts';
import { format } from 'date-fns';

const statusColors: Record<BillStatus, string> = {
  unpaid: 'bg-red-100 text-red-700 border-red-200',
  partial: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  paid: 'bg-green-100 text-green-700 border-green-200',
};

const txTypeColors = (type?: string) => {
  switch (type) {
    case 'Income':
      return 'bg-green-50 text-green-700';
    case 'Advance Paid':
      return 'bg-purple-50 text-purple-700';
    case 'Expense':
      return 'bg-red-50 text-red-700';
    case 'Refund':
      return 'bg-orange-50 text-orange-700';
    case 'Transfer':
      return 'bg-slate-50 text-slate-700';
    default:
      return 'bg-gray-50 text-gray-700';
  }
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

const QuickPayBillDialog = ({
  open,
  onOpenChange,
  bill,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  bill: Bill | null;
}) => {
  const { allocateToBill, allocations } = useBills();
  const { addTransaction } = useTransactions();
  const { accounts } = useAccounts();
  const { vendors } = useVendors();
  const [amount, setAmount] = useState('');
  const [fromAccountId, setFromAccountId] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open && bill) {
      const totalAllocated = allocations
        .filter((a) => a.bill_id === bill.id)
        .reduce((s, a) => s + Number(a.amount_applied), 0);
      const remaining = Number(bill.amount) - totalAllocated;
      setAmount(remaining.toString());
      setPaymentDate(new Date().toISOString().split('T')[0]);
      setDescription('');
      setFromAccountId(accounts.find((a) => a.is_default)?.id || '');
    }
  }, [open, bill, allocations, accounts]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bill || !fromAccountId || !amount) return;

    setIsLoading(true);
    try {
      // 1. Create Expense transaction
      const tx = await addTransaction({
        type: 'Expense',
        amount: parseFloat(amount),
        from_account_id: fromAccountId,
        entity_id: bill.vendor_id,
        transaction_date: paymentDate,
        description: description || `Payment for Bill #${bill.bill_number || bill.id}`,
        transaction_status: 'Available',
      });

      // 2. Allocate transaction to bill
      await allocateToBill({
        transaction_id: tx.id,
        bill_id: bill.id,
        amount_applied: parseFloat(amount),
      });

      onOpenChange(false);
    } catch (error) {
      console.error('Error in quick pay:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!bill) return null;

  const vendor = vendors.find((v) => v.vendor_id === bill.vendor_id);
  const totalAllocated = allocations
    .filter((a) => a.bill_id === bill.id)
    .reduce((s, a) => s + Number(a.amount_applied), 0);
  const remaining = Number(bill.amount) - totalAllocated;
  const cashBankAccounts = accounts.filter((a) => a.account_type === 'cash_bank');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            Pay Bill
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-600 font-medium">{vendor?.name}</p>
            <p className="text-xs text-blue-500 mt-1">Bill #: {bill.bill_number || bill.id}</p>
            <div className="grid grid-cols-3 gap-2 mt-3 text-xs">
              <div>
                <p className="text-blue-500">Total</p>
                <p className="font-bold text-blue-700">₹{Number(bill.amount).toLocaleString('en-IN')}</p>
              </div>
              <div>
                <p className="text-blue-500">Paid</p>
                <p className="font-bold text-green-600">₹{totalAllocated.toLocaleString('en-IN')}</p>
              </div>
              <div>
                <p className="text-blue-500">Balance</p>
                <p className="font-bold text-red-600">₹{remaining.toLocaleString('en-IN')}</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Payment Amount * (₹)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                placeholder="0.00"
              />
              {remaining > 0 && (
                <p className="text-xs text-muted-foreground">
                  {parseFloat(amount) > remaining
                    ? `⚠️ Exceeds balance by ₹${(parseFloat(amount) - remaining).toLocaleString('en-IN')}`
                    : `Remaining balance: ₹${remaining.toLocaleString('en-IN')}`}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="account">Pay From Account *</Label>
              <Select value={fromAccountId} onValueChange={setFromAccountId}>
                <SelectTrigger id="account">
                  <SelectValue placeholder="Select cash/bank account" />
                </SelectTrigger>
                <SelectContent>
                  {cashBankAccounts.length === 0 ? (
                    <SelectItem value="none" disabled>
                      No cash/bank accounts available
                    </SelectItem>
                  ) : (
                    cashBankAccounts.map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.name} (₹{a.balance.toLocaleString('en-IN')})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Payment Date *</Label>
              <Input
                id="date"
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g., Check #123, Online transfer"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading} className="bg-green-600 hover:bg-green-700">
                {isLoading ? 'Recording...' : 'Record Payment'}
              </Button>
            </div>
          </form>
        </div>
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
  const { vendors } = useVendors();
  const [transactionId, setTransactionId] = useState('');
  const [amount, setAmount] = useState('');

  // Reset form when dialog opens/bill changes - THIS MUST BE AT TOP LEVEL
  useEffect(() => {
    if (open && bill) {
      setTransactionId('');
      setAmount('');
    }
  }, [open, bill?.id]);

  // Handle empty state - don't render anything if no bill
  if (!open || !bill) {
    return null;
  }

  // Get vendor for this bill (defensive: handle missing vendor)
  const vendor = vendors?.find?.((v) => v?.vendor_id === bill.vendor_id);

  // Calculate bill's remaining amount
  const totalAllocated = (allocations || [])
    .filter((a) => a?.bill_id === bill.id)
    .reduce((s, a) => s + Number(a?.amount_applied || 0), 0);
  const remaining = Math.max(0, Number(bill.amount || 0) - totalAllocated);

  // **ONLY Advance Paid transactions to THIS vendor, not Void**
  const vendorAdvances = (transactions || []).filter(
    (t) =>
      t?.type === 'Advance Paid' &&
      t?.entity_id === bill.vendor_id &&
      t?.transaction_status !== 'Void',
  );

  // Calculate remaining balance for each advance (amount - allocated)
  const advancesWithBalance = vendorAdvances
    .map((tx) => {
      const allocated = (allocations || [])
        .filter((a) => a?.transaction_id === tx.id)
        .reduce((s, a) => s + Number(a?.amount_applied || 0), 0);
      const txRemaining = Math.max(0, Number(tx.amount || 0) - allocated);
      return { ...tx, remainingBalance: txRemaining };
    })
    .filter((tx) => tx.remainingBalance > 0);

  // Calculate vendor's total advance balance
  const vendorAdvanceBalance = advancesWithBalance.reduce((sum, tx) => sum + tx.remainingBalance, 0);

  // Get selected transaction and its remaining balance
  const selectedTx = advancesWithBalance.find((tx) => tx?.id === transactionId);
  const maxAdvanceBalance = selectedTx?.remainingBalance || 0;
  
  // Can't allocate more than: (1) remaining advance balance OR (2) remaining bill amount
  const maxAllowableAmount = Math.min(maxAdvanceBalance, remaining);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bill || !transactionId || !selectedTx) return;
    const allocAmount = parseFloat(amount);
    if (allocAmount > maxAllowableAmount) {
      return;
    }
    await allocateToBill({
      transaction_id: transactionId,
      bill_id: bill.id,
      amount_applied: allocAmount,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Allocate Advance to Bill</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="bg-blue-50 p-3 rounded text-sm">
            <p className="font-semibold text-blue-900">{vendor?.name || 'Unknown vendor'}</p>
            <p className="text-blue-700">Bill: ₹{Number(bill.amount).toLocaleString('en-IN')}</p>
            <p className="text-blue-700">Paid: ₹{totalAllocated.toLocaleString('en-IN')}</p>
            <p className="text-blue-700 font-semibold">Remaining: ₹{remaining.toLocaleString('en-IN')}</p>
          </div>

          {vendorAdvanceBalance > 0 && (
            <div className="bg-purple-50 p-3 rounded text-sm">
              <p className="font-semibold text-purple-900">Available Advances</p>
              <p className="text-purple-700">
                ₹{vendorAdvanceBalance.toLocaleString('en-IN')} ready to allocate to bills
              </p>
            </div>
          )}

          {advancesWithBalance.length === 0 && (
            <div className="bg-amber-50 p-3 rounded text-sm">
              <p className="text-amber-700 font-semibold">No Advances Available</p>
              <p className="text-amber-600">This vendor has no unallocated advance payments.</p>
            </div>
          )}

          {advancesWithBalance.length > 0 && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Select Advance Payment *</Label>
                <Select value={transactionId} onValueChange={setTransactionId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pick an advance payment" />
                  </SelectTrigger>
                  <SelectContent>
                    {advancesWithBalance.map((tx) => (
                      <SelectItem key={tx.id} value={tx.id}>
                        {format(new Date(tx.transaction_date), 'dd MMM yyyy')} — ₹
                        {Number(tx.remainingBalance).toLocaleString('en-IN')} available
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedTx && (
                <div className="bg-slate-50 p-3 rounded text-sm">
                  <p className="text-slate-600">
                    <strong>Advance Available:</strong> ₹{Number(maxAdvanceBalance).toLocaleString('en-IN')}
                  </p>
                  <p className="text-slate-600">
                    <strong>Bill Remaining:</strong> ₹{remaining.toLocaleString('en-IN')}
                  </p>
                  <p className="text-slate-600 font-semibold text-blue-600 mt-1">
                    <strong>Max Allocable:</strong> ₹{Number(maxAllowableAmount).toLocaleString('en-IN')}
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="allocate-amount">Amount to Allocate *</Label>
                <Input
                  id="allocate-amount"
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  placeholder="0.00"
                  max={maxAllowableAmount}
                />
                {amount && parseFloat(amount) > maxAllowableAmount && (
                  <p className="text-xs text-red-600">
                    ⚠️ Amount exceeds maximum allocable (₹{Number(maxAllowableAmount).toLocaleString('en-IN')})
                  </p>
                )}
                {selectedTx && amount && parseFloat(amount) <= maxAllowableAmount && (
                  <p className="text-xs text-green-600">
                    ✓ After allocation: ₹{Number(maxAllowableAmount - parseFloat(amount)).toLocaleString('en-IN')} will remain
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={!selectedTx || !amount || parseFloat(amount) > maxAllowableAmount}
                >
                  Allocate
                </Button>
              </div>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export const BillsPage = () => {
  const { bills, allocations, loading, deleteBill } = useBills();
  const { vendors } = useVendors();
  const { transactions } = useTransactions();
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [allocBill, setAllocBill] = useState<Bill | null>(null);
  const [quickPayBill, setQuickPayBill] = useState<Bill | null>(null);
  const [expandedBill, setExpandedBill] = useState<string | null>(null);

  const vendorMap = useMemo(() => new Map(vendors.map((v) => [v.vendor_id, v.name])), [vendors]);

  const filtered = bills.filter((b) => {
    const vendor = vendorMap.get(b.vendor_id) || '';
    return (
      vendor.toLowerCase().includes(search.toLowerCase()) ||
      (b.bill_number || '').toLowerCase().includes(search.toLowerCase())
    );
  });

  // Calculate vendor summary
  const vendorSummary = useMemo(() => {
    const summary = new Map<
      string,
      { totalBills: number; totalPaid: number; totalRemaining: number; advanceBalance: number }
    >();

    bills.forEach((bill) => {
      const paid = allocations
        .filter((a) => a.bill_id === bill.id)
        .reduce((s, a) => s + Number(a.amount_applied), 0);
      const remaining = Number(bill.amount) - paid;

      const current = summary.get(bill.vendor_id) || {
        totalBills: 0,
        totalPaid: 0,
        totalRemaining: 0,
        advanceBalance: 0,
      };
      current.totalBills += Number(bill.amount);
      current.totalPaid += paid;
      current.totalRemaining += remaining;
      summary.set(bill.vendor_id, current);
    });

    // Calculate advance balance per vendor
    vendors.forEach((v) => {
      const vendorAdvances = transactions.filter(
        (t) => t.type === 'Advance Paid' && t.entity_id === v.vendor_id && t.transaction_status !== 'Void',
      );
      const advanceBalance = vendorAdvances.reduce((sum, tx) => {
        const allocated = allocations
          .filter((a) => a.transaction_id === tx.id)
          .reduce((s, a) => s + Number(a.amount_applied), 0);
        const remaining = Number(tx.amount) - allocated;
        return sum + (remaining > 0 ? remaining : 0);
      }, 0);

      const current = summary.get(v.vendor_id) || {
        totalBills: 0,
        totalPaid: 0,
        totalRemaining: 0,
        advanceBalance: 0,
      };
      current.advanceBalance = advanceBalance;
      summary.set(v.vendor_id, current);
    });

    return summary;
  }, [bills, allocations, vendors, transactions]);

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

        {/* Vendor Summary Section */}
        {vendors.length > 0 && (
          <Card className="p-4 mb-6 bg-slate-50">
            <h3 className="font-semibold text-sm text-slate-700 mb-3">Vendor Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {vendors.map((v) => {
                const summary = vendorSummary.get(v.vendor_id) || {
                  totalBills: 0,
                  totalPaid: 0,
                  totalRemaining: 0,
                  advanceBalance: 0,
                };
                return (
                  <div
                    key={v.vendor_id}
                    className="bg-white p-3 rounded border border-slate-200 text-sm"
                  >
                    <p className="font-semibold text-foreground">{v.name}</p>
                    <div className="text-xs text-muted-foreground space-y-1 mt-2">
                      <p>Bills: ₹{summary.totalBills.toLocaleString('en-IN')}</p>
                      <p className="text-green-600">Paid: ₹{summary.totalPaid.toLocaleString('en-IN')}</p>
                      <p className="text-red-600">Owed: ₹{summary.totalRemaining.toLocaleString('en-IN')}</p>
                      {summary.advanceBalance > 0 && (
                        <p className="text-purple-600 font-semibold">
                          Advance: ₹{summary.advanceBalance.toLocaleString('en-IN')}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {filtered.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No bills yet</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {filtered.map((b) => {
              const totalAllocated = allocations
                .filter((a) => a.bill_id === b.id)
                .reduce((s, a) => s + Number(a.amount_applied), 0);
              const remaining = Number(b.amount) - totalAllocated;
              const billAllocations = allocations.filter((a) => a.bill_id === b.id);
              const isExpanded = expandedBill === b.id;

              return (
                <div key={b.id}>
                  <Card className="p-4">
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
                        <p className="text-sm font-medium text-foreground mt-2">
                          ₹{totalAllocated.toLocaleString('en-IN')} paid • ₹
                          {remaining.toLocaleString('en-IN')} remaining
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <p className="font-bold text-lg">₹{Number(b.amount).toLocaleString('en-IN')}</p>
                        <div className="flex flex-wrap gap-1 justify-end">
                          {b.status !== 'paid' && (
                            <>
                              <Button 
                                size="sm" 
                                onClick={() => setQuickPayBill(b)}
                                className="bg-green-600 hover:bg-green-700 text-white"
                              >
                                Pay Now
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => setAllocBill(b)}>
                                Allocate
                              </Button>
                            </>
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
                          {billAllocations.length > 0 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setExpandedBill(isExpanded ? null : b.id)}
                            >
                              {isExpanded ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Expandable Payment History */}
                  {isExpanded && billAllocations.length > 0 && (
                    <Card className="p-4 bg-slate-50 rounded-t-none border-t-0 space-y-2">
                      <h4 className="text-sm font-semibold text-foreground mb-3">Payment History</h4>
                      {billAllocations.map((alloc) => (
                        <div
                          key={alloc.id}
                          className={`p-3 rounded border ${txTypeColors(alloc.transaction_type)}`}
                        >
                          <div className="flex justify-between items-start">
                            <div className="text-sm">
                              <p className="font-medium">₹{Number(alloc.amount_applied).toLocaleString('en-IN')}</p>
                              <p className="text-xs">{alloc.transaction_date && format(new Date(alloc.transaction_date), 'dd MMM yyyy')}</p>
                              {alloc.transaction_description && (
                                <p className="text-xs">{alloc.transaction_description}</p>
                              )}
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {alloc.transaction_type}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </Card>
                  )}
                </div>
              );
            })}
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
      <QuickPayBillDialog
        open={!!quickPayBill}
        onOpenChange={(o) => !o && setQuickPayBill(null)}
        bill={quickPayBill}
      />
      <AllocateBillDialog
        open={!!allocBill}
        onOpenChange={(o) => !o && setAllocBill(null)}
        bill={allocBill}
      />
    </div>
  );
};
