import { useState, useMemo, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, ChevronDown, ChevronUp, DollarSign, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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

const ApplyAdvanceToBillDialog = ({
  open,
  onOpenChange,
  advanceId,
  advances,
  bills,
  allocations,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  advanceId: string | null;
  advances: any[];
  bills: Bill[];
  allocations: BillAllocation[];
}) => {
  const { allocateToBill } = useBills();
  const { vendors } = useVendors();
  const [billId, setBillId] = useState('');
  const [amount, setAmount] = useState('');

  useEffect(() => {
    if (open) {
      setBillId('');
      setAmount('');
    }
  }, [open]);

  if (!open || !advanceId) return null;

  const advance = advances.find((a) => a.id === advanceId);
  if (!advance) return null;

  // Calculate advance's remaining balance
  const advanceAllocated = allocations
    .filter((a) => a.transaction_id === advanceId)
    .reduce((s, a) => s + Number(a.amount_applied), 0);
  const advanceRemaining = Math.max(0, Number(advance.amount) - advanceAllocated);

  // Get bills for this vendor
  const vendorBills = bills.filter((b) => b.vendor_id === advance.entity_id);

  // For selected bill, calculate remaining amount
  const selectedBill = vendorBills.find((b) => b.id === billId);
  const billAllocated = allocations
    .filter((a) => a.bill_id === billId)
    .reduce((s, a) => s + Number(a.amount_applied), 0);
  const billRemaining = selectedBill ? Math.max(0, Number(selectedBill.amount) - billAllocated) : 0;

  const maxAllowableAmount = Math.min(advanceRemaining, billRemaining);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!billId || !amount || !advance) return;
    const allocAmount = parseFloat(amount);
    if (allocAmount > maxAllowableAmount) return;

    await allocateToBill({
      transaction_id: advance.id,
      bill_id: billId,
      amount_applied: allocAmount,
    });
    onOpenChange(false);
  };

  const vendorName = vendors.find((v) => v.vendor_id === advance.entity_id)?.name || 'Unknown';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Apply Advance to Bill</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="bg-purple-50 p-3 rounded text-sm">
            <p className="font-semibold text-purple-900">Advance Details</p>
            <p className="text-purple-700">{vendorName}</p>
            <p className="text-purple-700">Amount: ₹{Number(advance.amount).toLocaleString('en-IN')}</p>
            <p className="text-purple-700 font-semibold">Available: ₹{advanceRemaining.toLocaleString('en-IN')}</p>
          </div>

          {vendorBills.length === 0 && (
            <div className="bg-amber-50 p-3 rounded text-sm">
              <p className="text-amber-700 font-semibold">No Bills Available</p>
              <p className="text-amber-600">This vendor has no bills to allocate to.</p>
            </div>
          )}

          {vendorBills.length > 0 && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Select Bill *</Label>
                <Select value={billId} onValueChange={setBillId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pick a bill" />
                  </SelectTrigger>
                  <SelectContent>
                    {vendorBills.map((b) => {
                      const allocated = allocations
                        .filter((a) => a.bill_id === b.id)
                        .reduce((s, a) => s + Number(a.amount_applied), 0);
                      const remaining = Math.max(0, Number(b.amount) - allocated);
                      return (
                        <SelectItem key={b.id} value={b.id}>
                          Bill {b.bill_number || b.id.substring(0, 8)} — ₹{remaining.toLocaleString('en-IN')} due
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              {selectedBill && (
                <div className="bg-blue-50 p-3 rounded text-sm">
                  <p className="font-semibold text-blue-900">Bill Details</p>
                  <p className="text-blue-700">Amount: ₹{Number(selectedBill.amount).toLocaleString('en-IN')}</p>
                  <p className="text-blue-700">Remaining: ₹{billRemaining.toLocaleString('en-IN')}</p>
                </div>
              )}

              {selectedBill && (
                <div className="space-y-2">
                  <Label>Amount to Allocate *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    max={maxAllowableAmount}
                  />
                  {amount && parseFloat(amount) > maxAllowableAmount && (
                    <p className="text-xs text-red-600">
                      Cannot allocate more than ₹{maxAllowableAmount.toLocaleString('en-IN')}
                    </p>
                  )}
                  {amount && parseFloat(amount) <= maxAllowableAmount && (
                    <p className="text-xs text-green-600">
                      ✓ After allocation: ₹{(maxAllowableAmount - parseFloat(amount)).toLocaleString('en-IN')} advance remaining
                    </p>
                  )}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={!billId || !amount || parseFloat(amount) > maxAllowableAmount}
                >
                  Apply Advance
                </Button>
              </div>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

const AddExpenseDialog = ({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) => {
  const { addBill, allocateToBill } = useBills();
  const { addTransaction } = useTransactions();
  const { vendors } = useVendors();
  const { expenseCategories } = useAccountCategories();
  const { accounts } = useAccounts();
  
  // Expense tab state
  const [vendorId, setVendorId] = useState('');
  const [billNumber, setBillNumber] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [amount, setAmount] = useState('');
  const [fromAccountId, setFromAccountId] = useState('');
  const [isPayLater, setIsPayLater] = useState(false);
  
  // Advance tab state
  const [advAmount, setAdvAmount] = useState('');
  const [advDate, setAdvDate] = useState(new Date().toISOString().split('T')[0]);
  const [advFromAccountId, setAdvFromAccountId] = useState('');
  const [advVendorId, setAdvVendorId] = useState('');
  const [advDescription, setAdvDescription] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'expense' | 'advance'>('expense');

  useEffect(() => {
    if (open) {
      // Reset expense form
      setVendorId('');
      setBillNumber('');
      setCategoryId('');
      setDate(new Date().toISOString().split('T')[0]);
      setAmount('');
      setFromAccountId(accounts.find((a) => a.is_default)?.id || '');
      setIsPayLater(false);
      
      // Reset advance form
      setAdvAmount('');
      setAdvDate(new Date().toISOString().split('T')[0]);
      setAdvFromAccountId(accounts.find((a) => a.is_default)?.id || '');
      setAdvVendorId('');
      setAdvDescription('');
      
      setActiveTab('expense');
    }
  }, [open, accounts]);

  const handleExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorId || !amount) return;
    if (!isPayLater && !fromAccountId) return;

    setIsSubmitting(true);
    try {
      // First, add the bill
      const newBill = await addBill({
        vendor_id: vendorId,
        bill_number: billNumber || undefined,
        category_id: categoryId || null,
        date,
        amount: parseFloat(amount),
      });

      // If "Pay Now" is selected, create a transaction and allocate it to the bill
      if (!isPayLater && fromAccountId) {
        const newTransaction = await addTransaction({
          type: 'Expense',
          amount: parseFloat(amount),
          from_account_id: fromAccountId,
          entity_id: vendorId,
          transaction_date: date,
          description: `Payment for Bill ${billNumber || '(no bill number)'}`,
          transaction_status: 'Available',
        });

        // Link the transaction to the bill and update bill status to "paid"
        if (newBill && newTransaction) {
          await allocateToBill({
            transaction_id: newTransaction.id,
            bill_id: newBill.id,
            amount_applied: parseFloat(amount),
          });
        }
      }

      onOpenChange(false);
    } catch (error) {
      console.error('Error adding expense:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAdvanceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!advAmount || !advFromAccountId) return;

    setIsSubmitting(true);
    try {
      await addTransaction({
        type: 'Advance Paid',
        amount: parseFloat(advAmount),
        from_account_id: advFromAccountId,
        entity_id: advVendorId || null,
        transaction_date: advDate,
        description: advDescription || null,
        transaction_status: 'Available',
      });

      onOpenChange(false);
    } catch (error) {
      console.error('Error adding advance:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Expense / Advance</DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'expense' | 'advance')} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="expense">Expense</TabsTrigger>
            <TabsTrigger value="advance">Advance</TabsTrigger>
          </TabsList>
          
          {/* EXPENSE TAB */}
          <TabsContent value="expense" className="space-y-4 mt-4">
            <form onSubmit={handleExpenseSubmit} className="space-y-4">
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

              {/* Bill No and Bill Date on same line */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Bill No</Label>
                  <Input value={billNumber} onChange={(e) => setBillNumber(e.target.value)} placeholder="e.g., INV-001" />
                </div>
                <div className="space-y-2">
                  <Label>Bill Date *</Label>
                  <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
                </div>
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
                <Label>Amount *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  placeholder="0.00"
                />
              </div>

              {/* Payment Method Section */}
              <div className="space-y-3 pt-2 border-t">
                <div className="flex items-center justify-between mb-3">
                  <Label className="text-base font-semibold">Payment Method *</Label>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </div>

                <div className="space-y-2">
                  <Select value={fromAccountId} onValueChange={setFromAccountId} disabled={isPayLater}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select account" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.length === 0 ? (
                        <SelectItem value="none" disabled>
                          No accounts available
                        </SelectItem>
                      ) : (
                        accounts
                          .filter((a) => a.account_type === 'cash_bank')
                          .map((a) => (
                            <SelectItem key={a.id} value={a.id}>
                              {a.name} (₹{a.balance.toLocaleString('en-IN')})
                            </SelectItem>
                          ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="pay_later_checkbox"
                    checked={isPayLater}
                    onChange={(e) => setIsPayLater(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <Label htmlFor="pay_later_checkbox" className="cursor-pointer font-normal">
                    Pay later
                  </Label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting || (!isPayLater && !fromAccountId)}
                >
                  {isSubmitting ? 'Saving...' : 'Save Expense'}
                </Button>
              </div>
            </form>
          </TabsContent>
          
          {/* ADVANCE TAB */}
          <TabsContent value="advance" className="space-y-4 mt-4">
            <form onSubmit={handleAdvanceSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Amount *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={advAmount}
                  onChange={(e) => setAdvAmount(e.target.value)}
                  required
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label>Date *</Label>
                <Input
                  type="date"
                  value={advDate}
                  onChange={(e) => setAdvDate(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>From Account *</Label>
                <Select value={advFromAccountId} onValueChange={setAdvFromAccountId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select account" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.length === 0 ? (
                      <SelectItem value="none" disabled>
                        No accounts available
                      </SelectItem>
                    ) : (
                      accounts
                        .filter((a) => a.account_type === 'cash_bank')
                        .map((a) => (
                          <SelectItem key={a.id} value={a.id}>
                            {a.name} (₹{a.balance.toLocaleString('en-IN')})
                          </SelectItem>
                        ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Vendor (optional)</Label>
                <Select value={advVendorId} onValueChange={setAdvVendorId}>
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
                <Label>Description (optional)</Label>
                <Input
                  value={advDescription}
                  onChange={(e) => setAdvDescription(e.target.value)}
                  placeholder="e.g., Advance to ABC vendor"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting || !advAmount || !advFromAccountId}
                >
                  {isSubmitting ? 'Saving...' : 'Save Advance'}
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

const QuickPayBillDialog = ({
  open,
  onOpenChange,
  bill,
  advances,
  allocations,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  bill: Bill | null;
  advances: any[];
  allocations: BillAllocation[];
}) => {
  const { allocateToBill } = useBills();
  const { addTransaction } = useTransactions();
  const { accounts } = useAccounts();
  const { vendors } = useVendors();
  const [amount, setAmount] = useState('');
  const [fromAccountId, setFromAccountId] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [useAdvance, setUseAdvance] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Calculate total advance available for this vendor
  const vendorAdvances = bill
    ? advances.filter((a) => a.entity_id === bill.vendor_id)
    : [];
  
  const totalAdvanceAvailable = vendorAdvances.reduce((sum, adv) => {
    const allocated = allocations
      .filter((a) => a.transaction_id === adv.id)
      .reduce((s, a) => s + Number(a.amount_applied), 0);
    return sum + (Number(adv.amount) - allocated);
  }, 0);

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
      setUseAdvance(false);
    }
  }, [open, bill, allocations, accounts]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bill || !amount) return;

    setIsLoading(true);
    try {
      const amountToAllocate = parseFloat(amount);

      if (useAdvance && totalAdvanceAvailable > 0) {
        // Allocate from advances
        let remainingAmount = Math.min(amountToAllocate, totalAdvanceAvailable);
        
        for (const adv of vendorAdvances) {
          if (remainingAmount <= 0) break;
          
          const allocated = allocations
            .filter((a) => a.transaction_id === adv.id)
            .reduce((s, a) => s + Number(a.amount_applied), 0);
          const available = Number(adv.amount) - allocated;
          
          if (available > 0) {
            const toAllocate = Math.min(available, remainingAmount);
            await allocateToBill({
              transaction_id: adv.id,
              bill_id: bill.id,
              amount_applied: toAllocate,
            });
            remainingAmount -= toAllocate;
          }
        }
      } else if (!useAdvance) {
        // Create Expense transaction from account
        if (!fromAccountId) return;
        
        const tx = await addTransaction({
          type: 'Expense',
          amount: amountToAllocate,
          from_account_id: fromAccountId,
          entity_id: bill.vendor_id,
          transaction_date: paymentDate,
          description: description || `Payment for Bill #${bill.bill_number || bill.id}`,
          transaction_status: 'Available',
        });

        // Allocate transaction to bill
        await allocateToBill({
          transaction_id: tx.id,
          bill_id: bill.id,
          amount_applied: amountToAllocate,
        });
      }

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

            {/* Advance Payment Option */}
            {totalAdvanceAvailable > 0 && (
              <div className="space-y-3 p-4 rounded-lg bg-purple-50 border border-purple-200">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="use_advance_checkbox"
                    checked={useAdvance}
                    onChange={(e) => setUseAdvance(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 mt-1"
                  />
                  <div className="flex-1">
                    <Label htmlFor="use_advance_checkbox" className="cursor-pointer font-semibold text-purple-900">
                      Use Advance Payment
                    </Label>
                    <p className="text-xs text-purple-700 mt-1">
                      Available Credit: ₹{totalAdvanceAvailable.toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Pay From Account - Show only if not using advance */}
            {!useAdvance && (
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
            )}

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

            {!useAdvance && (
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g., Check #123, Online transfer"
                />
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading || (useAdvance ? false : !fromAccountId)} className="bg-green-600 hover:bg-green-700">
                {isLoading ? 'Processing...' : 'Record Payment'}
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

export const ExpensesPage = () => {
  const { bills, allocations, loading, deleteBill } = useBills();
  const { vendors } = useVendors();
  const { transactions, deleteTransaction } = useTransactions();
  const [selectedVendor, setSelectedVendor] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [showAdd, setShowAdd] = useState(false);
  const [quickPayBill, setQuickPayBill] = useState<Bill | null>(null);
  const [expandedBill, setExpandedBill] = useState<string | null>(null);
  const [expandedAdvance, setExpandedAdvance] = useState<string | null>(null);
  const [advanceToApply, setAdvanceToApply] = useState<string | null>(null);

  const vendorMap = useMemo(() => new Map(vendors.map((v) => [v.vendor_id, v.name])), [vendors]);

  // Filter bills by criteria
  const filtered = bills.filter((b) => {
    const matchesVendor = !selectedVendor || b.vendor_id === selectedVendor;
    const billDate = new Date(b.date);
    const matchesStartDate = !startDate || billDate >= new Date(startDate);
    const matchesEndDate = !endDate || billDate <= new Date(endDate);
    return matchesVendor && matchesStartDate && matchesEndDate;
  });

  // Filter and process advances
  const advances = transactions.filter((t) => t.type === 'Advance Paid');
  const filteredAdvances = advances.filter((adv) => {
    const matchesVendor = !selectedVendor || adv.entity_id === selectedVendor;
    const advDate = new Date(adv.transaction_date);
    const matchesStartDate = !startDate || advDate >= new Date(startDate);
    const matchesEndDate = !endDate || advDate <= new Date(endDate);
    return matchesVendor && matchesStartDate && matchesEndDate;
  });

  const advancesWithAllocations = filteredAdvances.map((adv) => {
    const allocated = allocations
      .filter((a) => a.transaction_id === adv.id)
      .reduce((s, a) => s + Number(a.amount_applied), 0);
    return {
      transaction: adv,
      allocated,
      available: Number(adv.amount) - allocated,
    };
  });


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-border bg-card">
        <div className="px-4 py-4">
          <h1 className="text-2xl font-bold">Expenses</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage vendor expenses and advances</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Filters */}
        <Card className="p-4 border-border">
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Filters</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">Vendor</label>
                <Select value={selectedVendor} onValueChange={setSelectedVendor}>
                  <SelectTrigger>
                    <SelectValue placeholder="All vendors" />
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
                <label className="text-xs font-medium text-muted-foreground">Start Date</label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  placeholder="From date"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">End Date</label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  placeholder="To date"
                />
              </div>
              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedVendor('');
                    setStartDate('');
                    setEndDate('');
                  }}
                  className="w-full"
                >
                  Reset Filters
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Bills List */}
        {filtered.length === 0 && advancesWithAllocations.length === 0 ? (
          <Card className="p-12 text-center border-dashed">
            <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-muted-foreground font-medium">No expenses found</p>
            <p className="text-sm text-muted-foreground mt-1">Try adjusting your filters or add a new expense</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {/* Advances */}
            {advancesWithAllocations.map(({ transaction: adv, allocated, available }) => {
              const advAllocations = allocations.filter((a) => a.transaction_id === adv.id);
              const isExpanded = expandedAdvance === adv.id;
              const vendorName = vendorMap.get(adv.entity_id || '') || 'General';
              const refNum = `ADV-${(allocations.length + 1).toString().padStart(2, '0')}`;

              return (
                <div key={adv.id}>
                  <Card className="p-6 border transition-all hover:shadow-md bg-purple-50 border-purple-200">
                    <div className="flex items-start justify-between">
                      {/* Left Section */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="text-lg font-semibold text-foreground">{vendorName}</h3>
                          <Badge className="bg-purple-100 text-purple-700 border-purple-200">advance paid</Badge>
                        </div>
                        
                        <div className="space-y-1 mb-3">
                          <p className="text-sm text-muted-foreground">Ref #: {refNum}</p>
                          <p className="text-sm text-muted-foreground">Date: {format(new Date(adv.transaction_date), 'dd MMM yyyy')}</p>
                        </div>

                        <p className="text-sm font-medium text-muted-foreground">
                          Available Credit: ₹{available.toLocaleString('en-IN')} unutilized • ₹{allocated.toLocaleString('en-IN')} advanced
                        </p>
                      </div>

                      {/* Right Section */}
                      <div className="flex flex-col items-end gap-4 ml-6">
                        <p className="text-2xl font-bold text-foreground">₹{Number(adv.amount).toLocaleString('en-IN')}</p>
                        
                        <div className="flex items-center gap-2">
                          {available > 0 && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-blue-600 border-blue-200 hover:bg-blue-50"
                              onClick={() => setAdvanceToApply(adv.id)}
                            >
                              Apply to Bill
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => {
                              if (confirm('Delete this advance?')) deleteTransaction(adv.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Expandable Allocation History */}
                    {advAllocations.length > 0 && (
                      <div className="mt-4 pt-4 border-t">
                        <button
                          onClick={() => setExpandedAdvance(isExpanded ? null : adv.id)}
                          className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                          Allocated to Bills ({advAllocations.length})
                        </button>

                        {isExpanded && (
                          <div className="mt-3 space-y-2">
                            {advAllocations.map((alloc) => (
                              <div key={alloc.id} className="p-3 rounded-md text-sm bg-white border border-purple-100">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <p className="font-medium">₹{Number(alloc.amount_applied).toLocaleString('en-IN')}</p>
                                    <p className="text-xs opacity-75">
                                      Bill ID: {alloc.bill_id.substring(0, 8)}...
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </Card>
                </div>
              );
            })}
            {/* Bills Rows */}
            {filtered.map((b) => {
              const totalAllocated = allocations
                .filter((a) => a.bill_id === b.id)
                .reduce((s, a) => s + Number(a.amount_applied), 0);
              const remaining = Number(b.amount) - totalAllocated;
              const billAllocations = allocations.filter((a) => a.bill_id === b.id);
              const isExpanded = expandedBill === b.id;

              return (
                <div key={b.id}>
                  <Card className={`p-6 border transition-all hover:shadow-md ${
                    b.status === 'paid' ? 'bg-green-50 border-green-200' : 'bg-card border-border'
                  }`}>
                    <div className="flex items-start justify-between">
                      {/* Left Section */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="text-lg font-semibold text-foreground">{vendorMap.get(b.vendor_id) || 'Unknown'}</h3>
                          <Badge className={statusColors[b.status]}>{b.status}</Badge>
                        </div>
                        
                        <div className="space-y-1 mb-3">
                          {b.bill_number && (
                            <p className="text-sm text-muted-foreground">Bill #: {b.bill_number}</p>
                          )}
                          <p className="text-sm text-muted-foreground">Date: {format(new Date(b.date), 'dd MMM yyyy')}</p>
                        </div>

                        <p className="text-sm font-medium text-muted-foreground">
                          ₹{totalAllocated.toLocaleString('en-IN')} paid • ₹{remaining.toLocaleString('en-IN')} remaining
                        </p>
                      </div>

                      {/* Right Section */}
                      <div className="flex flex-col items-end gap-4 ml-6">
                        <p className="text-2xl font-bold text-foreground">₹{Number(b.amount).toLocaleString('en-IN')}</p>
                        
                        <div className="flex items-center gap-2">
                          {b.status !== 'paid' && (
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 text-white"
                              onClick={() => setQuickPayBill(b)}
                            >
                              Pay
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => {
                              if (confirm('Delete this bill?')) deleteBill(b.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Expandable Payment History */}
                    {billAllocations.length > 0 && (
                      <div className="mt-4 pt-4 border-t">
                        <button
                          onClick={() => setExpandedBill(isExpanded ? null : b.id)}
                          className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                          Payment History ({billAllocations.length})
                        </button>

                        {isExpanded && (
                          <div className="mt-3 space-y-2">
                            {billAllocations.map((alloc) => (
                              <div key={alloc.id} className={`p-3 rounded-md text-sm ${txTypeColors(alloc.transaction_type)}`}>
                                <div className="flex justify-between items-start">
                                  <div>
                                    <p className="font-medium">₹{Number(alloc.amount_applied).toLocaleString('en-IN')}</p>
                                    <p className="text-xs opacity-75">
                                      {alloc.transaction_date && format(new Date(alloc.transaction_date), 'dd MMM yyyy')}
                                    </p>
                                  </div>
                                  <Badge variant="outline" className="text-xs">{alloc.transaction_type}</Badge>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </Card>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Button
        onClick={() => setShowAdd(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50"
        size="icon"
      >
        <Plus className="h-6 w-6" />
      </Button>

      <AddExpenseDialog open={showAdd} onOpenChange={setShowAdd} />
      <QuickPayBillDialog
        open={!!quickPayBill}
        onOpenChange={(o) => !o && setQuickPayBill(null)}
        bill={quickPayBill}
        advances={advances}
        allocations={allocations}
      />
      <ApplyAdvanceToBillDialog
        open={!!advanceToApply}
        onOpenChange={(o) => !o && setAdvanceToApply(null)}
        advanceId={advanceToApply}
        advances={advances}
        bills={bills}
        allocations={allocations}
      />
    </div>
  );
};
