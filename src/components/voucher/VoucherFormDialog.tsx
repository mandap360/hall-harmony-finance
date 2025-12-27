import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarDays, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { VoucherType, VOUCHER_TYPES } from "@/components/VoucherTypeDialog";
import { useAccounts } from "@/hooks/useAccounts";
import { useCategories } from "@/hooks/useCategories";
import { useIncomeCategories } from "@/hooks/useIncomeCategories";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { PaymentMethodType, PartyType } from "@/hooks/useTransactions";

interface VoucherFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  voucherType: VoucherType;
  onBack: () => void;
  onSuccess: () => void;
}

interface UnpaidPurchase {
  id: string;
  amount: number;
  voucher_date: string;
  description: string;
}

export function VoucherFormDialog({ 
  open, 
  onOpenChange, 
  voucherType, 
  onBack,
  onSuccess 
}: VoucherFormDialogProps) {
  const { toast } = useToast();
  const { profile } = useAuth();
  const { accounts } = useAccounts();
  const partyAccounts = accounts.filter(acc => acc.account_type === 'party');
  const { getExpenseCategories } = useCategories();
  const { categories: incomeCategories } = useIncomeCategories();
  const expenseCategories = getExpenseCategories();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [date, setDate] = useState<Date>(new Date());
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [vendorId, setVendorId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [billNumber, setBillNumber] = useState("");
  const [fromAccountId, setFromAccountId] = useState("");
  const [toAccountId, setToAccountId] = useState("");
  const [accountId, setAccountId] = useState("");
  const [incomeCategoryId, setIncomeCategoryId] = useState("");
  const [linkedPurchaseId, setLinkedPurchaseId] = useState("");
  const [linkedSaleId, setLinkedSaleId] = useState("");
  const [vendorUnpaidPurchases, setVendorUnpaidPurchases] = useState<UnpaidPurchase[]>([]);

  // Fetch unpaid purchases for the selected vendor (for Payment Voucher)
  useEffect(() => {
    const fetchUnpaidPurchases = async () => {
      if (!vendorId || !profile?.organization_id) {
        setVendorUnpaidPurchases([]);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('transactions')
          .select('id, amount, voucher_date, description')
          .eq('organization_id', profile.organization_id)
          .eq('voucher_type', 'purchase')
          .eq('party_id', vendorId)
          .eq('is_financial_transaction', false);

        if (error) throw error;
        setVendorUnpaidPurchases(data || []);
      } catch (error) {
        console.error('Error fetching unpaid purchases:', error);
        setVendorUnpaidPurchases([]);
      }
    };

    fetchUnpaidPurchases();
  }, [vendorId, profile?.organization_id]);

  // Reset form when voucher type changes
  useEffect(() => {
    setDate(new Date());
    setAmount("");
    setDescription("");
    setVendorId("");
    setCategoryId("");
    setBillNumber("");
    setFromAccountId("");
    setToAccountId("");
    setAccountId("");
    setIncomeCategoryId("");
    setLinkedPurchaseId("");
    setLinkedSaleId("");
  }, [voucherType]);

  const voucherInfo = VOUCHER_TYPES.find(v => v.id === voucherType);

  // Helper to determine payment method type based on account
  const getPaymentMethodType = (accountId: string): PaymentMethodType => {
    const account = accounts.find(a => a.id === accountId);
    // Check name for cash indicator
    if (account?.name?.toLowerCase().includes('cash')) {
      return 'cash';
    }
    return 'bank';
  };

  const handleSubmit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast({ title: "Error", description: "Please enter a valid amount", variant: "destructive" });
      return;
    }

    if (!profile?.organization_id) {
      toast({ title: "Error", description: "Organization not found", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);

    try {
      const parsedAmount = parseFloat(amount);
      const formattedDate = format(date, 'yyyy-MM-dd');

      switch (voucherType) {
        case 'purchase': {
          if (!vendorId || !categoryId) {
            toast({ title: "Error", description: "Please select vendor and category", variant: "destructive" });
            setIsSubmitting(false);
            return;
          }
          const vendor = partyAccounts.find(v => v.id === vendorId);

          // Create transaction record (not a financial transaction - will become financial when paid)
          const { error: purchaseError } = await supabase.from('transactions').insert({
            voucher_type: 'purchase' as const,
            voucher_date: formattedDate,
            amount: parsedAmount,
            party_type: 'vendor' as PartyType,
            party_id: vendorId,
            is_financial_transaction: false,
            organization_id: profile.organization_id,
            description: description || `Purchase from ${vendor?.name}`,
          });
          if (purchaseError) throw purchaseError;
          break;
        }
        
        case 'payment': {
          if (!vendorId || !fromAccountId) {
            toast({ title: "Error", description: "Please select vendor and account", variant: "destructive" });
            setIsSubmitting(false);
            return;
          }
          const vendor = partyAccounts.find(v => v.id === vendorId);

          // If linked to a purchase, mark the purchase as financial (paid)
          if (linkedPurchaseId) {
            const { error: markPaidError } = await supabase
              .from('transactions')
              .update({ is_financial_transaction: true })
              .eq('id', linkedPurchaseId);

            if (markPaidError) throw markPaidError;
          }

          // Create financial transaction
          const { error: paymentError } = await supabase.from('transactions').insert({
            voucher_type: 'payment' as const,
            voucher_date: formattedDate,
            amount: parsedAmount,
            party_type: 'vendor' as PartyType,
            party_id: vendorId,
            payment_method: getPaymentMethodType(fromAccountId),
            from_account_id: fromAccountId,
            is_financial_transaction: true,
            organization_id: profile.organization_id,
            description: description || `Payment to ${vendor?.name}`,
            reference_voucher_id: linkedPurchaseId || null,
          });
          if (paymentError) throw paymentError;
          break;
        }
        
        case 'fund_transfer': {
          if (!fromAccountId || !toAccountId || fromAccountId === toAccountId) {
            toast({ title: "Error", description: "Please select different accounts", variant: "destructive" });
            setIsSubmitting(false);
            return;
          }

          // Create financial transaction for transfer
          const { error: transferError } = await supabase.from('transactions').insert({
            voucher_type: 'fund_transfer' as const,
            voucher_date: formattedDate,
            amount: parsedAmount,
            from_account_id: fromAccountId,
            to_account_id: toAccountId,
            is_financial_transaction: true,
            organization_id: profile.organization_id,
            description: description || 'Fund Transfer',
          });
          if (transferError) throw transferError;
          break;
        }
        
        case 'sales': {
          if (!incomeCategoryId) {
            toast({ title: "Error", description: "Please select a category", variant: "destructive" });
            setIsSubmitting(false);
            return;
          }
          
          // Create secondary income record
          const { error: incomeError } = await supabase.from('secondary_income').insert({
            amount: parsedAmount,
            category_id: incomeCategoryId,
            organization_id: profile.organization_id,
          });
          if (incomeError) throw incomeError;

          // Create transaction (not financial - until receipt is made)
          const { error: salesError } = await supabase.from('transactions').insert({
            voucher_type: 'sales' as const,
            voucher_date: formattedDate,
            amount: parsedAmount,
            party_type: 'customer' as PartyType,
            is_financial_transaction: false,
            organization_id: profile.organization_id,
            description: description || 'Sales',
          });
          if (salesError) throw salesError;
          break;
        }
        
        case 'receipt': {
          if (!toAccountId) {
            toast({ title: "Error", description: "Please select receive account", variant: "destructive" });
            setIsSubmitting(false);
            return;
          }
          
          // Create financial transaction
          const { error: receiptError } = await supabase.from('transactions').insert({
            voucher_type: 'receipt' as const,
            voucher_date: formattedDate,
            amount: parsedAmount,
            party_type: 'customer' as PartyType,
            payment_method: getPaymentMethodType(toAccountId),
            to_account_id: toAccountId,
            is_financial_transaction: true,
            organization_id: profile.organization_id,
            description: description || 'Receipt',
          });
          if (receiptError) throw receiptError;
          break;
        }
      }

      toast({ title: "Success", description: `${voucherInfo?.label} created successfully` });
      onSuccess();
    } catch (error) {
      console.error('Error creating voucher:', error);
      const message = (error as any)?.message || "Failed to create voucher";
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderCommonFields = () => (
    <>
      <div className="space-y-2">
        <Label>Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full justify-start text-left font-normal">
              <CalendarDays className="mr-2 h-4 w-4" />
              {format(date, "PPP")}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(d) => d && setDate(d)}
              className="pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-2">
        <Label>Amount *</Label>
        <Input
          type="number"
          placeholder="Enter amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea
          placeholder="Enter description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
    </>
  );

  const renderPurchaseForm = () => (
    <>
      <div className="space-y-2">
        <Label>Vendor *</Label>
        <Select value={vendorId} onValueChange={setVendorId}>
          <SelectTrigger>
            <SelectValue placeholder="Select vendor" />
          </SelectTrigger>
          <SelectContent>
            {partyAccounts.map(party => (
              <SelectItem key={party.id} value={party.id}>{party.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Bill Number</Label>
        <Input placeholder="Enter bill number" value={billNumber} onChange={(e) => setBillNumber(e.target.value)} />
      </div>

      {renderCommonFields()}

      <div className="space-y-2">
        <Label>Category *</Label>
        <Select value={categoryId} onValueChange={setCategoryId}>
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {expenseCategories.filter(c => !c.parent_id).map(cat => (
              <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </>
  );

  const renderPaymentForm = () => (
    <>
      <div className="space-y-2">
        <Label>Vendor *</Label>
        <Select value={vendorId} onValueChange={(val) => { setVendorId(val); setLinkedPurchaseId(""); }}>
          <SelectTrigger>
            <SelectValue placeholder="Select vendor" />
          </SelectTrigger>
          <SelectContent>
            {partyAccounts.map(party => (
              <SelectItem key={party.id} value={party.id}>{party.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {vendorId && vendorUnpaidPurchases.length > 0 && (
        <div className="space-y-2">
          <Label>Link to Purchase (Optional)</Label>
          <Select value={linkedPurchaseId} onValueChange={(val) => {
            setLinkedPurchaseId(val);
            const purchase = vendorUnpaidPurchases.find(p => p.id === val);
            if (purchase) setAmount(purchase.amount.toString());
          }}>
            <SelectTrigger>
              <SelectValue placeholder="Select unpaid purchase" />
            </SelectTrigger>
            <SelectContent>
              {vendorUnpaidPurchases.map(purchase => (
                <SelectItem key={purchase.id} value={purchase.id}>
                  ₹{purchase.amount} ({format(new Date(purchase.voucher_date), 'dd/MM/yyyy')})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {renderCommonFields()}

      <div className="space-y-2">
        <Label>Payment Method *</Label>
        <Select value={fromAccountId} onValueChange={setFromAccountId}>
          <SelectTrigger>
            <SelectValue placeholder="Select account" />
          </SelectTrigger>
          <SelectContent>
            {accounts.map(account => (
              <SelectItem key={account.id} value={account.id}>{account.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </>
  );

  const renderFundTransferForm = () => (
    <>
      <div className="space-y-2">
        <Label>From Account *</Label>
        <Select value={fromAccountId} onValueChange={setFromAccountId}>
          <SelectTrigger>
            <SelectValue placeholder="Select source account" />
          </SelectTrigger>
          <SelectContent>
            {accounts.map(account => (
              <SelectItem key={account.id} value={account.id}>{account.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>To Account *</Label>
        <Select value={toAccountId} onValueChange={setToAccountId}>
          <SelectTrigger>
            <SelectValue placeholder="Select destination account" />
          </SelectTrigger>
          <SelectContent>
            {accounts.filter(a => a.id !== fromAccountId).map(account => (
              <SelectItem key={account.id} value={account.id}>{account.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {renderCommonFields()}
    </>
  );

  const renderSalesForm = () => (
    <>
      <div className="space-y-2">
        <Label>Income Category *</Label>
        <Select value={incomeCategoryId} onValueChange={setIncomeCategoryId}>
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {incomeCategories.map(cat => (
              <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {renderCommonFields()}
    </>
  );

  const renderReceiptForm = () => (
    <>
      <div className="space-y-2">
        <Label>Payment Method *</Label>
        <Select value={toAccountId} onValueChange={setToAccountId}>
          <SelectTrigger>
            <SelectValue placeholder="Select account (Cash/Bank)" />
          </SelectTrigger>
          <SelectContent>
            {accounts.map(account => (
              <SelectItem key={account.id} value={account.id}>{account.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Income Category</Label>
        <Select value={incomeCategoryId} onValueChange={setIncomeCategoryId}>
          <SelectTrigger>
            <SelectValue placeholder="Select category (optional)" />
          </SelectTrigger>
          <SelectContent>
            {incomeCategories.map(cat => (
              <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {renderCommonFields()}
    </>
  );

  const renderForm = () => {
    switch (voucherType) {
      case 'purchase': return renderPurchaseForm();
      case 'payment': return renderPaymentForm();
      case 'fund_transfer': return renderFundTransferForm();
      case 'sales': return renderSalesForm();
      case 'receipt': return renderReceiptForm();
      default: return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <DialogTitle>{voucherInfo?.label}</DialogTitle>
          </div>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {renderForm()}
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? "Creating..." : "Create Voucher"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
